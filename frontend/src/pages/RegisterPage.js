import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields and select a role');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Create Firebase Auth user first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Wait a moment for Firebase to initialize the user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the auth token
      const token = await userCredential.user.getIdToken();
      
      // Create user profile with role
      console.log('📤 Sending registration request:', {
        name: name,
        role: role,
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      });

      const response = await api.post('/users', {
        name: name.trim(),
        role: role,
        email: userCredential.user.email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📥 Registration response:', response.data);
      
      // Verify response
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Registration failed');
      }

      const savedUserData = response.data.data || response.data;
      console.log('✅ User profile created:', {
        id: savedUserData.id,
        name: savedUserData.name,
        role: savedUserData.role,
        email: savedUserData.email,
      });
      
      // Verify role was saved
      if (!savedUserData.role) {
        console.error('❌ CRITICAL: Role was not saved in response!');
        throw new Error('Role was not saved. Please try again.');
      }

      // Wait for Firestore to be ready and verify the data
      console.log('⏳ Waiting for Firestore write to complete...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify the data was saved by fetching it back from Firestore
      let verificationAttempts = 0;
      let verifiedData = null;
      
      while (verificationAttempts < 3 && !verifiedData?.role) {
        try {
          const verifyResponse = await api.get('/users/me');
          verifiedData = verifyResponse.data.data || verifyResponse.data;
          console.log(`✅ Verification attempt ${verificationAttempts + 1}:`, {
            name: verifiedData.name,
            role: verifiedData.role,
            email: verifiedData.email,
          });
          
          if (verifiedData.role) {
            console.log('✅ Role verified successfully!');
            break;
          }
        } catch (verifyError) {
          console.warn(`⚠️ Verification attempt ${verificationAttempts + 1} failed:`, verifyError.message);
        }
        
        verificationAttempts++;
        if (verificationAttempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!verifiedData || !verifiedData.role) {
        console.error('❌ CRITICAL: Could not verify role after registration!');
        setError('Registration completed but role verification failed. Please refresh the page.');
        return;
      }
      
      console.log('🎉 Registration successful! Navigating to home...');
      // The UserContext will automatically detect the new auth state
      // and load the user data via the onAuthStateChanged listener
      // No need to manually refresh - just navigate
      navigate('/home');
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('   Error details:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      
      // If Firebase Auth user was created but profile creation failed, we should handle this
      if (err.response?.status === 400 && err.response?.data?.error?.includes('already exists')) {
        // User profile already exists, navigate to home
        console.log('⚠️ User profile already exists, navigating to home...');
        navigate('/home');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join Donr to reduce food waste</p>

        <form onSubmit={handleRegister} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="register-input"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
            required
          />

          <div className="role-selection">
            <label>I am a:</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-button ${role === 'donator' ? 'active' : ''}`}
                onClick={() => setRole('donator')}
              >
                Donator
              </button>
              <button
                type="button"
                className={`role-button ${role === 'distributor' ? 'active' : ''}`}
                onClick={() => setRole('distributor')}
              >
                Distributor
              </button>
              <button
                type="button"
                className={`role-button ${role === 'acceptor' ? 'active' : ''}`}
                onClick={() => setRole('acceptor')}
              >
                Acceptor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="register-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

