import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config.jsx';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firestoreError, setFirestoreError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFirestoreError(false);
    
    try {
      // Try to save to Firebase first
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        timestamp: new Date(),
        status: 'new'
      });
      
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message to Firestore:', error);
      setFirestoreError(true);
      toast.error('Failed to save to database, but WhatsApp message will still open.');
    } finally {
      setIsSubmitting(false);
    }
    
    // Always open WhatsApp regardless of Firestore success
    const whatsappMessage = `New Feedback from FaceFit:%0A%0AName: ${formData.name}%0AEmail: ${formData.email}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/254748163492?text=${whatsappMessage}`, '_blank');
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      title: 'Email',
      value: 'facefit643@gmail.com',
      color: 'bg-blue-500'
    },
    {
      icon: <Phone className="w-6 h-6 text-white" />,
      title: 'Phone',
      value: '+254 748 163 492',
      color: 'bg-green-500',
      link: 'tel:+254748163492'
    },
    {
      icon: <MapPin className="w-6 h-6 text-white" />,
      title: 'Location',
      value: 'Nairobi, Kenya',
      color: 'bg-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#e2b8e6] to-[#d8a5dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative"
          >
            {firestoreError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Database Connection Issue</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Your message will still be sent via WhatsApp, but we couldn't save it to our database. Please check your internet connection.
                  </p>
                </div>
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us any feedback</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2b8e6] focus:border-transparent transition-colors duration-200"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2b8e6] focus:border-transparent transition-colors duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2b8e6] focus:border-transparent transition-colors duration-200"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-[#e2b8e6] hover:bg-purple-400 disabled:bg-purple-300 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send via WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`${info.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                      {info.link ? (
                        <a href={info.link} className="text-gray-600 hover:text-purple-600 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-600">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Direct WhatsApp Contact</h4>
                <p className="text-green-700 text-sm">
                  After submitting the form, WhatsApp will open with your message ready to send to our team.
                </p>
                <a 
                  href="https://wa.me/254748163492" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Message us directly
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;