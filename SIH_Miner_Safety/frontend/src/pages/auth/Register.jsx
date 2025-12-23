import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { LANGUAGE_OPTIONS } from '../../i18n/config';
import { OPERATION_ROLES } from '../../constants/operationRoles';

const DEFAULT_OPERATION_ROLE = OPERATION_ROLES[0].value;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    preferredLanguage: 'english',
    operationRole: DEFAULT_OPERATION_ROLE,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: value
    };

    if (name === 'role') {
      updated.operationRole = value === 'employee' ? (formData.operationRole || DEFAULT_OPERATION_ROLE) : '';
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="glass-card backdrop-blur-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <div className="h-1 w-20 bg-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-heading">
              Join Mine Safety Companion
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label text-black">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input text-black"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="form-label text-black">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input text-black"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="form-label text-black">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input text-black"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="form-label text-black">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="form-input text-black"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="form-label text-black">Account Type</label>
                  <select
                    id="role"
                    name="role"
                    className="form-input text-black"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="preferredLanguage" className="form-label text-black">Preferred Language</label>
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    className="form-input text-black"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                  >
                    {LANGUAGE_OPTIONS.map((language) => (
                      <option key={language.preference} value={language.preference}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.role === 'employee' && (
                <div>
                  <label htmlFor="operationRole" className="form-label text-black">Operational Role</label>
                  <select
                    id="operationRole"
                    name="operationRole"
                    className="form-input text-black"
                    value={formData.operationRole}
                    onChange={handleChange}
                  >
                    {OPERATION_ROLES.map((roleItem) => (
                      <option key={roleItem.value} value={roleItem.value}>
                        {roleItem.value} — {roleItem.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Registering...</span>
                  </>
                ) : 'Register'}
              </button>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;