import React, { useState, useEffect, useRef } from "react";
import { analyzeImage } from "../services/geminiService";
import { Camera, Loader, CheckCircle, ExternalLink, Sparkles } from "lucide-react";
import {
  trackImageUpload,
  trackAnalysisComplete,
  trackPaymentInitiated,
  trackPaymentCompleted,
  trackProductClick,
  trackUserAction,
} from "../services/analytics";

const FREE_UPLOADS = 1;
const PRICE_KES = 99;
const BACKEND_BASE = "https://face-fit.onrender.com";

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(localStorage.getItem("ff_paid") === "true");
  const [uploadsCount, setUploadsCount] = useState(
    Number(localStorage.getItem("ff_uploads_count") || "0")
  );

  const fileInputRef = useRef(null);

  useEffect(() => {
    const paidFlag = sessionStorage.getItem("paystack_paid");
    if (paidFlag === "true") {
      setPaid(true);
      localStorage.setItem("ff_paid", "true");
      sessionStorage.removeItem("paystack_paid");

      trackPaymentCompleted(PRICE_KES);

      const pending = sessionStorage.getItem("pending_upload_request");
      if (pending) {
        sessionStorage.removeItem("pending_upload_request");
        alert("✅ Payment confirmed — you can now add more images.");
      }
    }
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      trackUserAction("image_upload_error", {
        error_type: "file_too_large",
        file_size: file.size,
      });
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setAnalysis(null);

    trackImageUpload({
      size: file.size,
      type: file.type,
    });
  };

  const initiatePayment = async () => {
    try {
      trackPaymentInitiated(PRICE_KES);

      const response = await fetch(`${BACKEND_BASE}/api/paystack/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "testuser@example.com",
          amount: PRICE_KES * 100,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${errorText}`);
      }

      const data = await response.json();

      if (data?.status && data?.data?.authorization_url) {
        sessionStorage.setItem("pending_upload_request", "true");
        window.location.href = data.data.authorization_url;
      } else {
        alert("❌ Payment initialization failed. Please try again.");
        trackUserAction("payment_failed", {
          error_type: "initialization_failed",
        });
      }
    } catch (err) {
      console.error("Payment init error:", err);
      alert(`⚠️ Payment initiation failed: ${err.message}`);
      trackUserAction("payment_error", {
        error_message: err.message,
      });
    }
  };

  const canAddAnotherImage = () => {
    if (uploadsCount < FREE_UPLOADS) return true;
    if (paid) return true;
    return false;
  };

  const handleAddMore = () => {
    if (!canAddAnotherImage()) {
      trackUserAction("paywall_shown", {
        uploads_count: uploadsCount,
        free_limit: FREE_UPLOADS,
      });
      initiatePayment();
      return;
    }
    trackUserAction("add_more_images_clicked", {
      uploads_count: uploadsCount,
    });
    fileInputRef.current?.click();
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    setError("");

    trackUserAction("analysis_started", {
      upload_number: uploadsCount + 1,
    });

    try {
      const result = await analyzeImage(selectedImage);

      if (result?.error) {
        setError(result.message || "Analysis failed.");
        trackUserAction("analysis_error", {
          error_message: result.message,
        });
      } else {
        setAnalysis(result);

        const newCount = uploadsCount + 1;
        setUploadsCount(newCount);
        localStorage.setItem("ff_uploads_count", String(newCount));

        trackAnalysisComplete(result);
      }
    } catch (e) {
      console.error("Analysis error:", e);
      setError("Failed to process image. Please try again.");
      trackUserAction("analysis_exception", {
        error_message: e.message,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError("");

    trackUserAction("image_reset", {
      had_analysis: !!analysis,
    });
  };

  const handleProductClick = (product) => {
    trackProductClick(product);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-400" /> Try it out. Upload Your Photo
        </h2>
        <p className="text-gray-900">
          First {FREE_UPLOADS} photos are free. Additional uploads cost KES {PRICE_KES}.
        </p>
        {uploadsCount >= FREE_UPLOADS && !paid && (
          <p className="text-sm text-orange-600 mt-2">
            You've used your free uploads. Pay KES {PRICE_KES} to add more images.
          </p>
        )}
      </div>

      {!previewUrl ? (
        <div className="border-2 border-dashed border-purple-500 rounded-xl p-8 text-center hover:border-yellow-400 transition-colors duration-200 bg-gray-800 bg-opacity-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={handleAddMore}
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white mb-2">
              Choose Your Photo
            </p>
            <p className="text-gray-300">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-400 mt-2">PNG, JPG up to 5MB</p>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Ready for Analysis
                </h3>
                <p className="text-gray-300 mb-6">
                  We'll analyze your facial features and suggest personalized
                  makeup & fashion ideas.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={handleUploadAndAnalyze}
                    disabled={analyzing}
                    className="flex-1 min-w-[180px] bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze My Look
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetSelection}
                    className="px-6 py-3 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    Choose Different Photo
                  </button>

                  <button
                    onClick={handleAddMore}
                    className="px-6 py-3 border border-purple-600 text-purple-400 rounded-lg hover:bg-purple-900 transition-colors duration-200"
                  >
                    Add More Images
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
              {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-400 bg-green-900 bg-opacity-20 p-4 rounded-lg">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">
                  Analysis Complete!
                </span>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                  Face Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {analysis.skinTone && (
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-2">
                        Skin Tone
                      </h4>
                      <p className="text-white text-lg capitalize">{analysis.skinTone}</p>
                    </div>
                  )}
                  {analysis.facialShape && (
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-2">
                        Facial Shape
                      </h4>
                      <p className="text-white text-lg capitalize">{analysis.facialShape}</p>
                    </div>
                  )}
                  {analysis.currentLook && analysis.currentLook !== 'Not specified' && (
                    <div className="md:col-span-2 bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-2">
                        Current Look
                      </h4>
                      <p className="text-white">{analysis.currentLook}</p>
                    </div>
                  )}
                </div>
              </div>

              {analysis.makeupRecommendations && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                    Makeup Recommendations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(analysis.makeupRecommendations).map(
                      ([key, val]) => (
                        <div key={key} className="bg-gray-900 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-400 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <p className="text-white">{val}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {analysis.fashionRecommendations && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                    Fashion Recommendations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(analysis.fashionRecommendations).map(
                      ([key, val]) => (
                        <div key={key} className="bg-gray-900 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-400 mb-2 capitalize">
                            {key}
                          </h4>
                          <p className="text-white">{val}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {analysis.productSuggestions &&
                analysis.productSuggestions.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
                      Recommended Products
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {analysis.productSuggestions.map((product, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 transition-transform duration-200 hover:scale-[1.02]"
                        >
                          <div className="flex">
                            <div className="w-1/3">
                              <img
                                src={product.imageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iMC4zNWVtIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"}
                                alt={product.product}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iMC4zNWVtIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
                                }}
                              />
                            </div>
                            <div className="w-2/3 p-4">
                              <p className="font-semibold text-white text-sm mb-1">
                                {product.brand}
                              </p>
                              <p className="text-white text-lg font-bold mb-2">
                                {product.product}
                              </p>
                              {product.shade && (
                                <p className="text-gray-300 text-sm mb-2">
                                  Shade: {product.shade}
                                </p>
                              )}
                              <p className="text-purple-400 font-semibold mb-2">
                                {product.price}
                              </p>
                              <div className="flex justify-between items-center mt-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${product.isAffordable ? 'bg-green-900 text-green-300' : 'bg-purple-900 text-purple-300'}`}>
                                  {product.isAffordable ? 'Affordable' : 'Premium'}
                                </span>
                                {product.buyUrl ? (
                                  <a
                                    href={product.buyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleProductClick(product)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    Buy <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400 px-2 py-1">
                                    Link unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
