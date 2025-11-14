import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DonationFormPage from './pages/DonationFormPage';
import DonationListPage from './pages/DonationListPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import ResourcesPage from './pages/ResourcesPage';
import Loader from './components/Loader';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { firebaseUser, loading } = useUser();
  
  if (loading) {
    return <Loader message="Loading..." />;
  }
  
  if (!firebaseUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public Route Component (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { firebaseUser, loading } = useUser();
  
  if (loading) {
    return <Loader message="Loading..." />;
  }
  
  if (firebaseUser) {
    return <Navigate to="/home" />;
  }
  
  return children;
};

// Layout Component with Header
const Layout = ({ children, showHeader = true, fullScreen = false }) => {
  const { loading } = useUser();
  
  if (loading) {
    return <Loader message="Initializing..." />;
  }
  
  return (
    <div className="app-layout">
      {showHeader && <Header />}
      <main className={fullScreen ? 'app-main-fullscreen' : showHeader ? 'app-main' : 'app-main-full'}>
        {children}
      </main>
    </div>
  );
};

// App Routes Component
const AppRoutes = () => {
  const { firebaseUser } = useUser();
  
  return (
    <Routes>
      {/* Public Routes (no header) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Layout showHeader={false}>
              <LoginPage />
            </Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Layout showHeader={false}>
              <RegisterPage />
            </Layout>
          </PublicRoute>
        }
      />
      
      {/* Protected Routes (with header) */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout showHeader={true}>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations/create"
        element={
          <ProtectedRoute>
            <Layout showHeader={true}>
              <DonationFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations"
        element={
          <ProtectedRoute>
            <Layout showHeader={true}>
              <DonationListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout showHeader={true}>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Public Pages (with header) */}
      <Route
        path="/map"
        element={
          <Layout showHeader={true} fullScreen={true}>
            <MapPage />
          </Layout>
        }
      />
      <Route
        path="/map/donate"
        element={
          <ProtectedRoute>
            <Layout showHeader={true} fullScreen={true}>
              <MapPage mode="donate" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map/nearby"
        element={
          <ProtectedRoute>
            <Layout showHeader={true} fullScreen={true}>
              <MapPage mode="nearby" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map/distribution"
        element={
          <ProtectedRoute>
            <Layout showHeader={true} fullScreen={true}>
              <MapPage mode="distribution" />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map/centers"
        element={
          <Layout showHeader={true} fullScreen={true}>
            <MapPage mode="centers" />
          </Layout>
        }
      />
      <Route
        path="/how-it-works"
        element={
          <Layout showHeader={true}>
            <HowItWorksPage />
          </Layout>
        }
      />
      <Route
        path="/faq"
        element={
          <Layout showHeader={true}>
            <FAQPage />
          </Layout>
        }
      />
      <Route
        path="/resources"
        element={
          <Layout showHeader={true}>
            <ResourcesPage />
          </Layout>
        }
      />
      
      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to={firebaseUser ? "/home" : "/login"} />}
      />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </Router>
  );
}

export default App;

