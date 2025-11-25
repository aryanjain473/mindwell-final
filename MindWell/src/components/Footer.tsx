import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-soft" style={{borderRadius: '0.875rem 0.625rem 1rem 0.625rem'}}>
                <Heart className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">MindWell</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-normal">
              Empowering your mental wellness journey with innovative technology and compassionate care.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2.5 bg-gray-700/60 rounded-xl hover:bg-primary-500/80 transition-all duration-300 transform hover:scale-110 hover:shadow-soft"
                  style={{borderRadius: '0.625rem 0.5rem 0.75rem 0.5rem'}}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Quick Links</h3>
            <div className="space-y-2.5">
              {[
                { path: '/', label: 'Home' },
                { path: '/features', label: 'Features' },
                { path: '/about', label: 'About Us' },
                { path: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-gray-300 hover:text-primary-400 transition-colors duration-300 text-sm font-normal"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Services</h3>
            <div className="space-y-2.5 text-sm text-gray-300 font-normal">
              <p>AI Mental Health Support</p>
              <p>Emotion Detection</p>
              <p>Find Therapists</p>
              <p>Wellness Gamification</p>
              <p>24/7 Crisis Support</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-tight">Get in Touch</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start space-x-2.5 text-gray-300">
                <Mail className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="font-normal">support@mindwell.com</span>
              </div>
              <div className="flex items-start space-x-2.5 text-gray-300">
                <Phone className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="font-normal">+91 7030318001</span>
              </div>
              <div className="flex items-start space-x-2.5 text-gray-300">
                <MapPin className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="font-normal leading-relaxed">KJ Somaiya School of Engineering, Vidyavihar East, Mumbai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/60 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm font-normal">
              © 2025 MindWell. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;