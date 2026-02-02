import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SurveysListPage from './pages/SurveysListPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import EditSurveyPage from './pages/EditSurveyPage';
import TakeSurveyPage from './pages/TakeSurveyPage';
import SurveyResultsPage from './pages/SurveyResultsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import SuggestPage from './pages/SuggestPage';
import ResponsesPage from './pages/ResponsesPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-zinc-500">A carregar...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route - redirects to dashboard if logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-zinc-500">A carregar...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout with Navbar
const Layout = ({ children, showNavbar = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <LandingPage />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/surveys"
        element={
          <ProtectedRoute>
            <Layout>
              <SurveysListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/surveys/:id/take"
        element={
          <ProtectedRoute>
            <Layout>
              <TakeSurveyPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <Layout>
              <AboutPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suggest"
        element={
          <ProtectedRoute>
            <Layout>
              <SuggestPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <Layout>
              <ResultsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/responses"
        element={
          <ProtectedRoute>
            <Layout>
              <ResponsesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/surveys/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateSurveyPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/surveys/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditSurveyPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/surveys/:id/results"
        element={
          <ProtectedRoute>
            <Layout>
              <SurveyResultsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App min-h-screen bg-[#f5f5f5]">
          <AppRoutes />
          <Toaster position="bottom-right" richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
