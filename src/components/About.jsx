import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Sparkles, Globe } from 'lucide-react';
// Add this import at the top of Contact.js// or the correct path to your About component

// Your component code...
const About = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: 'Inclusive Beauty',
      description: 'Celebrating all skin tones and beauty types',
      color: 'bg-pink-500'
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: 'Community First',
      description: 'Building connections through shared experiences',
      color: 'bg-blue-500'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-white" />,
      title: 'AI Innovation',
      description: 'Cutting-edge technology for personalized results',
      color: 'bg-purple-500'
    },
    {
      icon: <Globe className="w-8 h-8 text-white" />,
      title: 'Cultural Relevance',
      description: 'Honoring African beauty traditions and trends',
      color: 'bg-green-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About Face-Fit
          </h2>
          <div className="w-24 h-1 bg-[#e2b8e6] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Face-Fit is revolutionizing the beauty and fashion industry by using advanced AI technology 
            to provide personalized recommendations that celebrate African beauty. Our mission is to 
            eliminate the guesswork in beauty routines while promoting inclusivity and cultural relevance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className={`${value.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#e2b8e6] to-purple-400 rounded-2xl shadow-xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
          <p className="text-lg leading-relaxed opacity-90 max-w-3xl mx-auto">
            We envision a world where everyone can confidently express their unique beauty, 
            supported by technology that understands and celebrates diversity. Face-Fit is 
            more than an app – it's a movement towards inclusive, personalized beauty for all.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;