import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthImage from '../../assets/auth.jpg';

const apiBaseUrl = import.meta.env.VITE_BASE_API;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    otp: '',
    forgotEmail: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (loginMethod === 'email') {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || Object.values(data).join(', ') || 'Login failed');
        }

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'An error occurred during login');
      }
    } else if (loginMethod === 'mobile') {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/verify-otp/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile: formData.mobile,
            otp: formData.otp,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Invalid OTP');
        }

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'An error occurred during OTP verification');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.forgotEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || Object.values(data).join(', ') || 'Failed to send password reset email');
      }

      setSuccessMessage(data.message);
    } catch (err) {
      setError(err.message || 'An error occurred while requesting password reset');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {showForgotPassword ? 'Reset Your Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {showForgotPassword ? 'Enter your email to receive a password reset link' : 'Login to your account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-md">
              {successMessage}
            </div>
          )}

          {!showForgotPassword ? (
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className="w-full py-2 px-4 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm"
                >
                  {loginMethod === 'email' ? 'Email Login' : 'Mobile Login'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {loginMethod === 'email' ? (
                  <>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" aria-label="Email icon" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="example@gmail.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" aria-label="Password icon" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-label="Hide password" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-label="Show password" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Keep me logged in
                        </label>
                      </div>
                      <div className="text-sm">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                    >
                      Sign In
                    </button>

                    <div className="text-center my-4">or</div>

                    <button
                      type="button"
                      onClick={() => setLoginMethod('mobile')}
                      className="w-full bg-white text-blue-600 py-3 px-4 border border-gray-300 rounded-lg font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                    >
                      Login with Mobile OTP
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" aria-label="Mobile number icon" />
                        </div>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+1234567890"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                        OTP
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" aria-label="OTP icon" />
                        </div>
                        <input
                          type="text"
                          id="otp"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter OTP"
                          disabled={!formData.mobile}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.mobile) {
                          setError('Please enter a valid mobile number');
                          return;
                        }
                        try {
                          const response = await fetch(`${apiBaseUrl}/auth/request-otp/`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ mobile: formData.mobile }),
                          });
                          const data = await response.json();
                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to request OTP');
                          }
                          setError(null);
                          alert('OTP sent to your mobile number');
                        } catch (err) {
                          setError(err.message || 'An error occurred while requesting OTP');
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 mb-4"
                      disabled={!formData.mobile}
                    >
                      Request OTP
                    </button>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </form>
            </>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-label="Email icon" />
                  </div>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    value={formData.forgotEmail}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              >
                Send Reset Link
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {!showForgotPassword && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-gray-100">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${AuthImage})` }}
        ></div>
      </div>
    </div>
  );
};

export default LoginPage;