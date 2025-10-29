import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { trackUserAction } from '../services/analytics';

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    "https://i.postimg.cc/Y0MPjJRV/tbt.jpg",
    "https://i.pinimg.com/736x/2a/b8/93/2ab89346194ee5eea1e1990da184629d.jpg",
    "https://i.pinimg.com/1200x/b0/0c/f7/b00cf77bd76332e5b598cd5c04b7964c.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const scrollToFeatures = () => {
    const element = document.querySelector('#features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });

      trackUserAction('cta_clicked', {
        cta_type: 'find_products',
        location: 'hero_section',
      });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#e2b8e6] to-[#d8a5dc] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover your perfect look
            </h1>

            <p className="text-xl lg:text-2xl text-white/90 mb-8 font-semibold leading-relaxed">
              remboglow uses technology to match your unique skin type, tone, and preferences
              with correct makeup and skincare products. Say goodbye to trial and error.
            </p>

            <motion.button
              onClick={scrollToFeatures}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-[#e2b8e6] px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 transform"
            >
              Find Your Perfect Products
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto h-96 overflow-hidden rounded-2xl shadow-2xl bg-pink-200">
              {heroImages.map((image, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: index === currentImageIndex ? 1 : 0,
                    scale: index === currentImageIndex ? 1 : 1.05,
                  }}
                  transition={{
                    opacity: { duration: 1.5, ease: "easeInOut" },
                    scale: { duration: 1.5, ease: "easeInOut" }
                  }}
                  style={{
                    zIndex: index === currentImageIndex ? 2 : 1
                  }}
                >
                  <img
                    src={image}
                    alt={`Beauty inspiration ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
