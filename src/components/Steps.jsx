import React from 'react';
import { motion } from 'framer-motion';
import { Upload, CreditCard, Lightbulb } from 'lucide-react';

const Steps = () => {
  const steps = [
    {
      icon: <Upload className="w-8 h-8 text-white" />,
      title: 'Upload',
      description: 'Upload your photo for AI analysis',
      color: 'bg-blue-500'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-white" />,
      title: 'Pay',
      description: 'Secure payment for premium insights',
      color: 'bg-green-500'
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-white" />,
      title: 'Get Insights',
      description: 'Receive personalized recommendations',
      color: 'bg-purple-500'
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
            How It Works
          </h2>
          <div className="w-24 h-1 bg-[#e2b8e6] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to discover your perfect beauty and fashion match.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center relative"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#e2b8e6] text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              {/* Step Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 pt-12">
                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-[#e2b8e6] text-2xl">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;