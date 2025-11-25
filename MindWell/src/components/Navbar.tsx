import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Heart, User, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const authNavLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const adminNavLinks = [
    { path: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/98 backdrop-blur-md shadow-soft border-b border-gray-100' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-soft" style={{borderRadius: '0.875rem 0.625rem 1rem 0.625rem'}}>
                <Heart className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-warm" style={{background: 'linear-gradient(135deg, #0d9488 0%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                MindWell
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'text-primary-600 bg-primary-50/80 shadow-soft'
                      : 'text-warm-light hover:text-primary-600 hover:bg-primary-50/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            {isAuthenticated && authNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-primary-600 bg-primary-50/80 shadow-soft'
                    : 'text-warm-light hover:text-primary-600 hover:bg-primary-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && adminNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-red-600 bg-red-50/80 shadow-soft'
                    : 'text-red-700 hover:text-red-600 hover:bg-red-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-soft" style={{borderRadius: '0.625rem 0.5rem 0.75rem 0.5rem'}}>
                    <User className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium text-warm">
                    Welcome, {user?.firstName}!
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-warm-light hover:text-red-600 transition-colors duration-300 rounded-xl hover:bg-red-50/50"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2.5} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-warm-light hover:text-primary-600 transition-colors duration-300 rounded-xl hover:bg-primary-50/50"
                >
                  <LogIn className="h-4 w-4" strokeWidth={2.5} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="btn-warm flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl transition-all duration-300"
                  style={{borderRadius: '0.875rem 0.625rem 1rem 0.625rem'}}
                >
                  <User className="h-4 w-4" strokeWidth={2.5} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && authNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user?.role === 'admin' && adminNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'text-red-600 bg-red-50'
                  : 'text-red-700 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-base font-medium text-gray-700">
                  Welcome, {user?.firstName}!
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;