import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  email?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error,
  success = false,
  email
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOnChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target;
    const newOTP: string[] = [...otp];
    newOTP[activeOTPIndex] = value.substring(value.length - 1);

    if (!value) {
      setActiveOTPIndex(activeOTPIndex - 1);
    } else {
      setActiveOTPIndex(activeOTPIndex + 1);
    }

    setOtp(newOTP);
  };

  const handleOnKeyDown = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Backspace') {
      if (activeOTPIndex > 0) {
        setActiveOTPIndex(activeOTPIndex - 1);
        const newOTP = [...otp];
        newOTP[activeOTPIndex - 1] = '';
        setOtp(newOTP);
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  }, [otp, length, onComplete]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6"
        >
          {success ? (
            <CheckCircle className="h-8 w-8 text-white" />
          ) : (
            <RefreshCw className="h-8 w-8 text-white" />
          )}
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {success ? 'Email Verified!' : 'Verify Your Email'}
        </h2>
        <p className="text-gray-600">
          {success 
            ? 'Your email has been successfully verified'
            : `We've sent a 6-digit code to ${email}`
          }
        </p>
      </div>

      {!success && (
        <>
          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center space-x-3">
              {otp.map((_, index) => (
                <motion.input
                  key={index}
                  ref={index === activeOTPIndex ? inputRef : null}
                  type="text"
                  value={otp[index]}
                  onChange={handleOnChange}
                  onKeyDown={handleOnKeyDown}
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 ${
                    error
                      ? 'border-red-500 bg-red-50'
                      : activeOTPIndex === index
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 bg-white hover:border-primary-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  maxLength={1}
                  disabled={isLoading}
                />
              ))}
            </div>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center space-x-2 text-red-600"
              >
                <XCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </div>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Didn't receive the code?
            </p>
            <button
              onClick={onResend}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-500 font-medium transition-colors disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
        >
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-primary-600" />
            <span className="text-primary-600 font-medium">Verifying...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OTPInput;
