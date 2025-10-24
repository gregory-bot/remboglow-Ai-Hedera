import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Palette, ShoppingBag, Sparkles,  Clock, Users, BarChart2 } from 'lucide-react';

const Solutions = () => {
  const solutions = [
    {
      icon: <Camera className="w-8 h-8 text-purple-500" />,
      title: 'Face Analysis',
      description: 'Platform finds your skin tone & face shape.',
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-500" />,
      title: 'Makeup Picks',
      description: 'Get best shades for you.',
    },
        {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: 'Routine Builder',
      description: 'Create your personalized skincare & makeup routine.',
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-purple-500" />,
      title: 'Fashion',
      description: 'Styles and products for your look.',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: 'Cultural Relevance',
      description: 'African beauty, local trends.',
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: 'Community',
      description: 'Share & connect.',
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-500" />,
      title: 'Data Analytics',
      description: 'Insights for businesses.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#e2b8e6] to-[#d8a5dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Our Solution
          </h2>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Advanced technology meets personalized beauty recommendations for the perfect match.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:scale-105"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                {solution.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {solution.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {solution.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;