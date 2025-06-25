// C:\Users\ASUS\meditrack-ai\backend\server.js
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer'); // For handling file uploads
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Gemini AI SDK
const admin = require('firebase-admin'); // Firebase Admin SDK
const cloudinary = require('cloudinary').v2; // Cloudinary SDK

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// --- Firebase Admin SDK Initialization ---
try {
  // Uses GOOGLE_APPLICATION_CREDENTIALS environment variable for authentication
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID, // Explicitly set project ID
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  process.exit(1); // Exit process if Firebase init fails, as it's critical
}

const db = admin.firestore(); // Firestore database instance

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer Configuration for In-Memory Storage ---
// Files will be stored in memory as a Buffer, not saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept only image files
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

// --- Firebase Authentication Middleware ---
// Verifies the ID token sent from the frontend
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]; // Extract token from "Bearer <token>" header

  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken); // Verify token with Firebase Admin SDK
    req.user = decodedToken; // Attach user info (UID, email, etc.) to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // Specific error messages for common issues
    if (error.code === 'auth/id-token-expired') {
        return res.status(403).json({ error: 'Unauthorized: Session expired. Please log in again.' });
    } else if (error.code === 'auth/invalid-id-token') {
        return res.status(403).json({ error: 'Unauthorized: Invalid token.' });
    }
    return res.status(403).json({ error: 'Unauthorized: Token verification failed.', details: error.message });
  }
};

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- API Endpoint to Analyze Reports ---
// This route is protected by the verifyToken middleware
app.post('/api/analyze-reports', verifyToken, upload.array('reportFiles'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  const userId = req.user.uid; // Get user ID from the verified token
  let combinedExtractedText = '';
  const extractedTextsArray = [];
  const uploadedImageUrls = []; // To store Cloudinary URLs

  try {
    for (const file of req.files) {
      const mimeType = file.mimetype;

      // 1. Upload image to Cloudinary directly from buffer
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `meditrack-ai/reports/${userId}`, // Organize uploads by user ID
            resource_type: 'image',
            // Generate a unique public_id, replacing spaces in original filename
            public_id: `report_${Date.now()}_${file.originalname.replace(/\s+/g, '_').replace(/\./g, '_')}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer); // Pass the file buffer directly from Multer's memory storage
      });

      uploadedImageUrls.push(uploadResult.secure_url); // Store the Cloudinary URL

      // 2. Prepare image for Gemini Vision API (using the buffer)
      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'), // Convert buffer to base64 for Gemini
          mimeType: mimeType,
        },
      };

      const imageAnalysisPrompt = "Extract all readable text from this medical report. Focus on patient details, test names, results, and reference ranges. Present the extracted text clearly, indicating the source of the text if possible.";

      const result = await model.generateContent([imageAnalysisPrompt, imagePart]);
      const response = result.response;
      const extractedTextFromGemini = response.text();

      combinedExtractedText += `\n\n--- Start of Report: ${file.originalname} (URL: ${uploadResult.secure_url}) ---\n`;
      combinedExtractedText += extractedTextFromGemini;
      combinedExtractedText += `\n--- End of Report: ${file.originalname} ---\n`;

      extractedTextsArray.push({
        fileName: file.originalname,
        cloudinaryUrl: uploadResult.secure_url,
        text: extractedTextFromGemini,
      });
    }

    // 3. Prepare full prompt for AI analysis of combined texts
    const fullPrompt = `You are a highly specialized medical AI assistant. Your task is to analyze the provided lab report text(s) and deliver concise, clear, and actionable feedback.

*Instructions:*
1. *Structure and Format:* Use Markdown heavily for readability. Use headings (##, ###), bullet points (*), and bold (*) for emphasis.
2. *Summary of Key Findings*
3. *Detailed Analysis of Out-of-Range Values*
4. *General Health Suggestions*
5. *Important Disclaimer*

Lab Report Text(s):\n\n${combinedExtractedText}

Please analyze the reports and respond as instructed.`;

    const aiResponse = await model.generateContent(fullPrompt);
    const aiFeedback = aiResponse.response.text();

    // 4. Save report data to Firestore
    const reportDocRef = await db.collection('medicalReports').add({
      userId: userId, // Link report to the authenticated user
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Firestore server timestamp
      originalFiles: extractedTextsArray.map(item => ({ // Store info about original files
        fileName: item.fileName,
        cloudinaryUrl: item.cloudinaryUrl
      })),
      extractedTexts: extractedTextsArray.map(item => item.text), // Store texts for individual files
      combinedExtractedText: combinedExtractedText, // Store the combined raw text
      aiFeedback: aiFeedback, // Store the AI-generated feedback
      status: 'analyzed' // Status of the report
    });

    res.json({
      message: 'Reports analyzed and saved successfully',
      aiFeedback: aiFeedback,
      extractedTexts: extractedTextsArray,
      reportId: reportDocRef.id, // Return the Firestore document ID
      uploadedUrls: uploadedImageUrls // Return the Cloudinary URLs for frontend reference
    });

  } catch (error) {
    console.error('Error processing reports:', error);
    let errorMessage = 'Failed to analyze reports.';
    // More specific error messages
    if (error.message && error.message.includes('file size limit')) {
      errorMessage = 'File too large. Please upload files under 5MB.';
    } else if (error.http_code === 400 && error.error_info && error.error_info.message.includes('Invalid API Key')) {
        errorMessage = 'Cloudinary API Key invalid or not configured correctly.';
    } else if (error.message && error.message.includes('API key not valid')) { // For Gemini API key issues
        errorMessage = 'Gemini API Key invalid or not configured correctly.';
    }
    res.status(500).json({ error: errorMessage, details: error.message });
  }
  // No finally block needed for fs.unlinkSync as files are not saved locally
});

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Meditrack AI Backend is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});