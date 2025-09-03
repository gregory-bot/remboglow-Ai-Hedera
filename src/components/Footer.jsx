import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
    { name: 'Get Started', href: '#features' }
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e2b8e6] shadow-lg">
                <img 
                  src="https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=100" 
                  alt="Face-Fit Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white">Face-Fit</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              AI-powered beauty and fashion recommendations that celebrate your unique style and cultural heritage.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block text-gray-400 hover:text-[#e2b8e6] transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <p>hello@face-fit.com</p>
              <p>+254 700 123 456</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by Face-Fit Team
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © 2025 Face-Fit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;