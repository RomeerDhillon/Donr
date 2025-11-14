import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import api from '../config/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeFirestore = null;
    
    console.log('🔐 UserContext: Setting up auth state listener...');
    
    // Set up real-time auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentFirebaseUser) => {
      console.log('🔐 UserContext: Auth state changed:', currentFirebaseUser ? currentFirebaseUser.uid : 'logged out');
      
      // Clean up previous Firestore listener if it exists
      if (unsubscribeFirestore) {
        console.log('🔐 UserContext: Cleaning up previous Firestore listener');
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      setFirebaseUser(currentFirebaseUser);
      setError(null);

      if (currentFirebaseUser) {
        console.log('🔐 UserContext: User is authenticated, setting up Firestore listener...');
        
        // Set up real-time Firestore listener with error handling
        try {
          const userDocRef = doc(db, 'users', currentFirebaseUser.uid);
          unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              try {
                if (docSnapshot.exists()) {
                  const userData = {
                    id: docSnapshot.id,
                    uid: currentFirebaseUser.uid,
                    email: currentFirebaseUser.email,
                    ...docSnapshot.data(),
                  };
                  
                  console.log('✅ UserContext: Real-time user data loaded from Firestore:', {
                    id: userData.id,
                    name: userData.name,
                    role: userData.role,
                    email: userData.email,
                  });
                  
                  // Validate required fields
                  if (!userData.name || !userData.role) {
                    console.error('❌ UserContext: User data missing required fields!', {
                      hasName: !!userData.name,
                      hasRole: !!userData.role,
                      fullData: userData,
                    });
                  }
                  
                  setUser(userData);
                  setLoading(false);
                  setError(null);
                } else {
                  console.warn('⚠️ UserContext: User document does not exist in Firestore for UID:', currentFirebaseUser.uid);
                  // Fallback to API call
                  loadUserDataFromAPI(currentFirebaseUser);
                }
              } catch (error) {
                console.error('❌ UserContext: Error processing Firestore snapshot:', error);
                // Fallback to API call on processing error
                loadUserDataFromAPI(currentFirebaseUser);
              }
            },
            (firestoreError) => {
              console.error('❌ UserContext: Firestore listener error:', firestoreError);
              // Silently fall back to API call - don't show error to user
              loadUserDataFromAPI(currentFirebaseUser);
            }
          );
        } catch (error) {
          console.error('❌ UserContext: Error setting up Firestore listener:', error);
          // Fallback to API call if listener setup fails
          loadUserDataFromAPI(currentFirebaseUser);
        }
      } else {
        console.log('🔐 UserContext: User is not authenticated');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('🔐 UserContext: Cleaning up listeners');
      try {
        unsubscribeAuth();
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
        }
      } catch (error) {
        console.warn('Warning: Error cleaning up UserContext listeners:', error);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserDataFromAPI = async (currentFirebaseUser) => {
    try {
      console.log('📡 UserContext: Loading user data from API...');
      const response = await api.get('/users/me');
      const userData = response.data.data || response.data;
      
      // Merge with Firebase Auth data
      const mergedUserData = {
        ...userData,
        uid: currentFirebaseUser.uid,
        email: currentFirebaseUser.email || userData.email,
      };
      
      console.log('📡 UserContext: API user data loaded:', {
        id: mergedUserData.id,
        name: mergedUserData.name,
        role: mergedUserData.role,
        email: mergedUserData.email,
      });
      
      if (!mergedUserData.name || !mergedUserData.role) {
        console.error('❌ UserContext: API returned incomplete user data!', {
          hasName: !!mergedUserData.name,
          hasRole: !!mergedUserData.role,
          fullData: mergedUserData,
        });
      }
      
      setUser(mergedUserData);
      setLoading(false);
      setError(null);
    } catch (apiError) {
      console.error('❌ UserContext: Error loading user data from API:', apiError);
      console.error('   Error response:', apiError.response?.data);
      console.error('   Error status:', apiError.response?.status);
      
      // Set minimal user data from Firebase Auth
      if (currentFirebaseUser) {
        setUser({
          uid: currentFirebaseUser.uid,
          email: currentFirebaseUser.email,
          name: currentFirebaseUser.displayName || '',
          role: null,
        });
      }
      setLoading(false);
      setError(apiError.response?.data?.error || 'Failed to load user data');
    }
  };

  const refreshUser = React.useCallback(() => {
    if (firebaseUser) {
      setLoading(true);
      loadUserDataFromAPI(firebaseUser);
    }
  }, [firebaseUser]);

  const value = React.useMemo(() => ({
    user,
    firebaseUser,
    loading,
    error,
    refreshUser,
  }), [user, firebaseUser, loading, error, refreshUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

