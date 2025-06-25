// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReports, setUserReports] = useState([]); // New state for user reports

  // Function to add a new report to the history
  const addReport = (reportData) => {
    // Add a unique ID and timestamp to the report
    const newReport = {
      id: Date.now(), // Simple unique ID for now
      timestamp: new Date().toISOString(),
      ...reportData
    };
    setUserReports(prevReports => [newReport, ...prevReports]); // Add new report to the beginning
    console.log("Report added to context:", newReport);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile from Firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.log('No such user profile document!');
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
        // In a real app, you'd fetch userReports from Firestore here
        // For now, it will be empty on refresh/new login unless explicitly fetched.
      } else {
        setUserProfile(null);
        setUserReports([]); // Clear reports when logged out
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    logout: () => auth.signOut(),
    userReports, // Include userReports in context value
    addReport,    // Include addReport function in context value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}