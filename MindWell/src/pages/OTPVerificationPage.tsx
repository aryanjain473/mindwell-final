import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Clock } from 'lucide-react';
import OTPInput from '../components/OTPInput';
import api from '../utils/axiosConfig';

const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('pendingVerificationEmail', emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // Redirect to signup if no email
      navigate('/signup');
    }
  }, [location.state, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/otp/verify', {
        email,
        otp,
        type: 'email_verification'
      });

      if (response.data.verified) {
        setSuccess(true);
        // Clear pending verification email
        localStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! You can now log in.',
              verifiedEmail: email 
            }
          });
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/otp/resend', {
        email,
        type: 'email_verification'
      });

      setResendCooldown(60); // 1 minute cooldown
      setTimeLeft(600); // Reset timer to 10 minutes
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <OTPInput
              onComplete={() => {}}
              onResend={() => {}}
              success={true}
              email={email}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <p className="text-gray-600 mb-4">
                Redirecting you to login page...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 relative"
        >
          {/* Back Button */}
          <Link
            to="/signup"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign Up
          </Link>

          {/* OTP Input Component */}
          <OTPInput
            onComplete={handleOTPComplete}
            onResend={handleResendOTP}
            isLoading={isLoading}
            error={error}
            email={email}
          />

          {/* Timer and Info */}
          <div className="mt-8 space-y-4">
            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Code expires in {formatTime(timeLeft)}</span>
            </div>

            {/* Email Info */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <span>Sent to {email}</span>
            </div>

            {/* Resend Info */}
            {resendCooldown > 0 && (
              <div className="text-center text-sm text-gray-500">
                Resend available in {resendCooldown} seconds
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your spam folder if you don't see the email</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• The code will expire in 10 minutes</li>
              <li>• You can request a new code after 1 minute</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
