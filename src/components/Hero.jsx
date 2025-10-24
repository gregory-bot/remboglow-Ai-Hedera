import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { trackUserAction } from '../services/analytics';

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    "https://imgproxy.services.pitch.com/_/w:1162/h:858/resizing_type:fit/format:avif/plain/pitch-assets-ccb95893-de3f-4266-973c-20049231b248/071e7e57-0257-446c-9403-259d8213a415",
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
            <div className="relative w-full max-w-md mx-auto">
              {heroImages.map((image, index) => (
                <motion.img
                  key={index}
                  src={image}
                  alt={`Beauty inspiration ${index + 1}`}
                  className={`w-full h-96 object-cover rounded-2xl shadow-2xl transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: index === currentImageIndex ? 1 : 0.8,
                    opacity: index === currentImageIndex ? 1 : 0
                  }}
                  transition={{ duration: 1 }}
                />
              ))}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      trackUserAction('hero_image_clicked', {
                        image_index: index,
                      });
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
