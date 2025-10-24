// components/Feedback.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Star } from 'lucide-react';

const Feedback = () => {
  const [formData, setFormData] = useState({
    rating: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // ✅ Replace with your actual Apps Script URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwj9BLMSO2ASMsJ3uZcxI6xrdInS_vn5gzMAiKpggmNkoHk5m8PYjsAthDoqvUisMo1Gw/exec';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRating = (rating) => {
    setFormData({
      ...formData,
      rating: rating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate session ID for tracking
      const sessionId = localStorage.getItem('facefit_session_id') || 'unknown';

      // 🧠 Bypass CORS using 'no-cors' mode
      // Browser treats response as opaque, but data is still submitted to Google Sheets
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // 👈 key line that allows Google Script to accept the request
        body: JSON.stringify({
          ...formData,
          sessionId: sessionId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Since 'no-cors' prevents reading the response, just assume success
      setIsSubmitted(true);
      setFormData({ rating: 0, message: '' });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Sorry, there was an error submitting your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="feedback" className="py-20 bg-gradient-to-br from-[#e2b8e6] to-[#d8a5dc]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl p-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Your feedback has been received. We appreciate your input and will use it to improve Face-Fit.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            >
              Submit Another Feedback
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="feedback" className="py-20 bg-gradient-to-br from-[#e2b8e6] to-[#d8a5dc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Share Your Feedback
          </h2>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-700 mb-6">
                How would you rate your experience with Face-Fit?
              </label>
              <div className="flex justify-center space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-3 focus:outline-none transition-transform duration-200 hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || formData.rating)
                          ? 'text-purple-600 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {formData.rating === 0
                  ? 'Select your rating'
                  : `You rated us ${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-lg font-semibold text-gray-700 mb-3">
                Your Feedback
              </label>
              <textarea
                name="message"
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="What did you like? What can we improve? Your detailed feedback helps us grow..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting || formData.rating === 0 || !formData.message.trim()}
                className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Feedback;
