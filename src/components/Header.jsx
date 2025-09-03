import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
    { name: 'Get Started', href: '#features' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close menu smoothly after clicking a link
    setTimeout(() => setIsMenuOpen(false), 300);
  };

  // Close menu when clicking outside or pressing Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-footer') && !e.target.closest('.hamburger-btn')) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#e2b8e6]/95 backdrop-blur-sm shadow-lg' 
          : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg">
                <img 
                  src="https://i.pinimg.com/736x/2a/b8/93/2ab89346194ee5eea1e1990da184629d.jpg" 
                  alt="Face-Fit Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold text-[#b1006e]">face-fit</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-white hover:text-purple-200 font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>

            {/* Mobile Hamburger Button - Rounded and Stylish */}
            <button
              className="hamburger-btn md:hidden p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 flex items-center justify-center w-14 h-14 shadow-lg hover:shadow-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white transition-transform duration-300" />
              ) : (
                <Menu className="w-6 h-6 text-white transition-transform duration-300" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Navigation Footer - Slides from left */}
      <div className={`nav-footer fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
        isMenuOpen 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-gradient-to-r from-[#e2b8e6] to-purple-400 rounded-t-3xl shadow-2xl p-6">
          {/* Close button at top */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Footer Info */}
          <div className="text-center text-white/90">
            <p className="text-sm mb-2">© 2025 Face-Fit</p>
            <p className="text-xs opacity-80">AI-powered beauty recommendations</p>
          </div>
        </div>
      </div>

      {/* Overlay - Only visible when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-500 ease-in-out"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;