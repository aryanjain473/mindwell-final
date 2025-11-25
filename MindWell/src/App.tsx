import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import EnhancedDashboardPage from './pages/EnhancedDashboardPage';
import EnhancedDashboardV2 from './pages/EnhancedDashboardV2';
import ChatPage from './pages/ChatPage';
import TherapistDirectoryPage from './pages/TherapistDirectoryPage';
import TherapistProfilePage from './pages/TherapistProfilePage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import VideoConsultationPage from './pages/VideoConsultationPage';
import AppointmentsPage from './pages/AppointmentsPage';
import JournalPage from './pages/JournalPage';
import AdminDashboard from './pages/AdminDashboard';
import WellnessGamesPage from './pages/WellnessGamesPage';
import WellnessGamePage from './pages/WellnessGamePage';
import FaceMoodPage from './pages/FaceMoodPage';
import AcademicStressPage from './pages/AcademicStressPage';
import BreathingExercisePage from './pages/BreathingExercisePage';
import MeditationPage from './pages/MeditationPage';
import GratitudePage from './pages/GratitudePage';
import SleepTrackerPage from './pages/SleepTrackerPage';
import GoalsPage from './pages/GoalsPage';
import ChatButton from './components/ChatButton';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pt-16"
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-email" element={<OTPVerificationPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <EnhancedDashboardV2 />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/therapists" element={<TherapistDirectoryPage />} />
                <Route path="/therapist/:id" element={<TherapistProfilePage />} />
                <Route path="/book-appointment/:id" element={
                  <ProtectedRoute>
                    <BookAppointmentPage />
                  </ProtectedRoute>
                } />
                <Route path="/video-consultation/:sessionId" element={
                  <ProtectedRoute>
                    <VideoConsultationPage />
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <JournalPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/wellness-games" element={
                  <ProtectedRoute>
                    <WellnessGamesPage />
                  </ProtectedRoute>
                } />
                <Route path="/wellness-games/:gameId" element={
                  <ProtectedRoute>
                    <WellnessGamePage />
                  </ProtectedRoute>
                } />
                <Route path="/face-mood" element={
                  <ProtectedRoute>
                    <FaceMoodPage />
                  </ProtectedRoute>
                } />
                <Route path="/stress/academic" element={
                  <ProtectedRoute>
                    <AcademicStressPage />
                  </ProtectedRoute>
                } />
                <Route path="/breathing" element={
                  <ProtectedRoute>
                    <BreathingExercisePage />
                  </ProtectedRoute>
                } />
                <Route path="/meditation" element={
                  <ProtectedRoute>
                    <MeditationPage />
                  </ProtectedRoute>
                } />
                <Route path="/gratitude" element={
                  <ProtectedRoute>
                    <GratitudePage />
                  </ProtectedRoute>
                } />
                <Route path="/sleep" element={
                  <ProtectedRoute>
                    <SleepTrackerPage />
                  </ProtectedRoute>
                } />
                <Route path="/goals" element={
                  <ProtectedRoute>
                    <GoalsPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </motion.main>
          </AnimatePresence>
          <Footer />
          <ChatButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;