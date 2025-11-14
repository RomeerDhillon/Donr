import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useUser } from '../contexts/UserContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, firebaseUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getMapPath = () => {
    if (!user?.role) return '/map';
    if (user.role === 'donator') return '/map/donate';
    if (user.role === 'acceptor') return '/map/nearby';
    if (user.role === 'distributor') return '/map/distribution';
    return '/map';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate(firebaseUser ? '/home' : '/')}>
          <h1>Donr</h1>
        </div>

        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button
            className={`nav-link ${location.pathname.startsWith('/map') ? 'active' : ''}`}
            onClick={() => {
              navigate(getMapPath());
              setMobileMenuOpen(false);
            }}
          >
            Map
          </button>
          <button
            className={`nav-link ${isActive('/how-it-works')}`}
            onClick={() => {
              navigate('/how-it-works');
              setMobileMenuOpen(false);
            }}
          >
            How It Works
          </button>
          <button
            className={`nav-link ${isActive('/faq')}`}
            onClick={() => {
              navigate('/faq');
              setMobileMenuOpen(false);
            }}
          >
            FAQ
          </button>
          <button
            className={`nav-link ${isActive('/resources')}`}
            onClick={() => {
              navigate('/resources');
              setMobileMenuOpen(false);
            }}
          >
            Resources
          </button>
          {firebaseUser && (
            <button
              className={`nav-link ${isActive('/home')}`}
              onClick={() => {
                navigate('/home');
                setMobileMenuOpen(false);
              }}
            >
              Dashboard
            </button>
          )}
          {firebaseUser ? (
            <>
              <button
                className={`nav-link ${isActive('/profile')}`}
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
              >
                Profile
              </button>
              <button
                className="nav-link logout"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-link"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </button>
              <button
                className="nav-link signup"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;

