import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Loader, CreditCard, X, Sparkles } from 'lucide-react'; // Added Sparkles import
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config.jsx';
import { analyzeImage } from '../services/geminiService.jsx';
import toast from 'react-hot-toast';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    // Check if this is the second upload attempt
    if (uploadCount >= 1) {
      setShowPaymentModal(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(selectedImage);
      
      if (result.error) {
        toast.error(result.message || 'Failed to analyze image');
        return;
      }

      setAnalysis(result);
      setUploadCount(prev => prev + 1);
      
      // Save to Firebase
      await addDoc(collection(db, 'analyses'), {
        timestamp: new Date(),
        result: result,
        imageSize: selectedImage.size,
        imageType: selectedImage.type
      });

      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePayment = () => {
    // Simulate payment process
    toast.success('Payment successful! You can now upload more images.');
    setShowPaymentModal(false);
    setUploadCount(0); // Reset count after payment
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
  };

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
            Try Face-Fit Now
          </h2>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Upload your photo and get instant AI-powered beauty and fashion recommendations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Upload Your Photo
            </h3>

            {!imagePreview ? (
              <div className="border-2 border-dashed border-[#e2b8e6] rounded-xl p-12 text-center hover:border-purple-400 transition-colors duration-300">
                <Camera className="w-16 h-16 text-[#e2b8e6] mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Choose a clear photo of your face for the best results
                </p>
                <label className="bg-[#e2b8e6] hover:bg-purple-400 text-white px-6 py-3 rounded-full cursor-pointer inline-flex items-center transition-colors duration-200">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    onClick={resetUpload}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-[#e2b8e6] hover:bg-purple-400 disabled:bg-purple-300 text-white py-4 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze My Look'
                  )}
                </button>

                {uploadCount >= 1 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      🎉 You've used your free analysis! Upgrade for unlimited access.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your Results
            </h3>

            {!analysis ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Upload and analyze your photo to see personalized recommendations here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {analysis.skinTone && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-2">Skin Analysis</h4>
                    <p className="text-purple-700">
                      <strong>Skin Tone:</strong> {analysis.skinTone}
                    </p>
                    {analysis.facialShape && (
                      <p className="text-purple-700">
                        <strong>Face Shape:</strong> {analysis.facialShape}
                      </p>
                    )}
                  </div>
                )}

                {analysis.makeupRecommendations && (
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h4 className="font-bold text-pink-800 mb-2">Makeup Recommendations</h4>
                    <div className="space-y-2 text-sm text-pink-700">
                      {analysis.makeupRecommendations.foundation && (
                        <p><strong>Foundation:</strong> {analysis.makeupRecommendations.foundation}</p>
                      )}
                      {analysis.makeupRecommendations.lipColor && (
                        <p><strong>Lip Color:</strong> {analysis.makeupRecommendations.lipColor}</p>
                      )}
                      {analysis.makeupRecommendations.eyeMakeup && (
                        <p><strong>Eye Makeup:</strong> {analysis.makeupRecommendations.eyeMakeup}</p>
                      )}
                    </div>
                  </div>
                )}

                {analysis.fashionRecommendations && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-2">Fashion Recommendations</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      {analysis.fashionRecommendations.style && (
                        <p><strong>Style:</strong> {analysis.fashionRecommendations.style}</p>
                      )}
                      {analysis.fashionRecommendations.colors && (
                        <p><strong>Colors:</strong> {analysis.fashionRecommendations.colors}</p>
                      )}
                    </div>
                  </div>
                )}

                {analysis.productSuggestions && analysis.productSuggestions.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-3">Product Suggestions</h4>
                    <div className="space-y-3">
                      {analysis.productSuggestions.slice(0, 3).map((product, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                          {product.imageUrl && (
                            <img 
                              src={product.imageUrl} 
                              alt={product.product}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.brand} - {product.product}</p>
                            <p className="text-sm text-gray-600">{product.shade}</p>
                            <p className="text-sm font-bold text-green-600">{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#e2b8e6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Upgrade to Premium
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You've used your free analysis! Upgrade to get unlimited AI-powered beauty recommendations.
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#e2b8e6] to-purple-400 p-6 rounded-xl mb-6">
                    <div className="text-white text-center">
                      <p className="text-3xl font-bold mb-2">KSH 500</p>
                      <p className="text-sm opacity-90">Unlimited analyses for 30 days</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handlePayment}
                      className="w-full bg-[#e2b8e6] hover:bg-purple-400 text-white py-3 rounded-xl font-bold transition-colors duration-200"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ImageUpload;