import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start the countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      const newOtp = [...otp];
      pasteArray.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      if (pasteArray.length === 6) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', { 
        email, 
        otp: otpString 
      });
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleResendOtp = async () => {
  if (!canResend) return;

  try {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Call the API to resend OTP
    const { data } = await axios.post('http://localhost:5000/api/auth/resend-otp', { email });

    setSuccess(data.message || 'A new OTP has been sent to your email');
    setCanResend(false);
    setTimeLeft(120); // Reset timer to 2 minutes

    // Restart the countdown
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to {email}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 sr-only">
                  OTP Code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <div key={index} className="w-12 h-16">
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-full h-full text-center text-2xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  {[0, 1, 2].map((group) => (
                    <div key={group} className="flex space-x-3">
                      {otp.slice(group * 2, group * 2 + 2).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">{success}</h3>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Verifying...' : 'Submit Otp'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
  <p className="text-sm text-gray-600">
    Didn't receive a code?{' '}
    {canResend ? (
      <button
        type="button"
        className="font-medium text-blue-600 hover:text-blue-500"
        onClick={handleResendOtp}
        disabled={isSubmitting}
      >
        Resend OTP
      </button>
    ) : (
      <span className="text-gray-500">
        Resend OTP in {formatTime(timeLeft)}
      </span>
    )}
  </p>
</div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;