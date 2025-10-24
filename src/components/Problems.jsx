import React from 'react';
import { motion } from 'framer-motion';

const Problems = () => {
  const problems = [
    {
      title: 'Wrong Products',
      description: 'Using the wrong products causes skin issues and health risks.',
      icon: '❌',
    },
    {
      title: 'Trial & Error',
      description: 'Wasting money on routines that don\'t work.',
      icon: '💸',
    },
    {
      title: 'Cultural Relevance',
      description: 'Lack of advice for African beauty needs.',
      icon: '🌍',
    },
    {
      title: 'Disability Inclusion',
      description: 'People with disabilities are often left out.',
      icon: '♿',
    },
    {
      title: 'Job Creation',
      description: 'Empowering users to sell natural products.',
      icon: '💼',
    },
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
            Problem remboglow Solves
          </h2>
          <div className="w-24 h-1 bg-[#e2b8e6] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding the challenges in beauty and fashion that affect millions of people daily.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:scale-105"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;