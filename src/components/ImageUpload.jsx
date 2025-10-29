import React, { useState, useEffect, useRef } from "react";
import { analyzeImage } from "../services/geminiService";
import { Camera, Upload, Loader, CheckCircle, ExternalLink, Sparkles, DollarSign, Clock, Droplet, X } from "lucide-react";
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
  const [userBudget, setUserBudget] = useState(10000);
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
    setShowBudgetInput(true);

    trackImageUpload({
      size: file.size,
      type: file.type,
    });
  };

  const startCamera = async () => {
    if (!canAddAnotherImage()) {
      trackUserAction("paywall_shown", {
        uploads_count: uploadsCount,
        free_limit: FREE_UPLOADS,
      });
      initiatePayment();
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 }
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      trackUserAction("camera_opened", {});
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please check permissions.");
      trackUserAction("camera_error", {
        error_message: err.message,
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
      setAnalysis(null);
      setShowBudgetInput(true);
      stopCamera();

      trackImageUpload({
        size: file.size,
        type: file.type,
        source: "camera"
      });
    }, "image/jpeg", 0.95);
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
      budget: userBudget
    });

    try {
      const result = await analyzeImage(selectedImage, userBudget);

      if (result?.error) {
        setError(result.message || "Analysis failed.");
        trackUserAction("analysis_error", {
          error_message: result.message,
        });
      } else {
        setAnalysis(result);

        sessionStorage.setItem("face_fit_analysis", JSON.stringify(result));
        sessionStorage.setItem("face_fit_budget", String(userBudget));

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
    setShowBudgetInput(false);

    trackUserAction("image_reset", {
      had_analysis: !!analysis,
    });
  };

  const handleProductClick = (product) => {
    trackProductClick(product);
  };

  if (showCamera) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#b1006e]">Take Your Photo</h3>
            <button
              onClick={stopCamera}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-4 justify-center">
            <button
              onClick={capturePhoto}
              className="bg-[#b1006e] text-white px-8 py-4 rounded-full font-bold hover:bg-pink-700 transition-colors duration-200 flex items-center gap-2 text-lg"
            >
              <Camera className="w-6 h-6" />
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      <div className="text-center mb-8">
        <p className="text-gray-800">
          get skincare recommendations
        </p>
        <p className="text-sm text-gray-600 mt-2">
          first {FREE_UPLOADS} analysis free. Additional uploads: KES {PRICE_KES}
        </p>
        {uploadsCount >= FREE_UPLOADS && !paid && (
          <p className="text-sm text-orange-600 mt-2 font-semibold">
            You've used your free analysis. Pay KES {PRICE_KES} for unlimited access.
          </p>
        )}
      </div>

      {!previewUrl ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleAddMore}
              className="border-2 border-dashed border-[#b1006e] rounded-2xl p-8 text-center hover:border-pink-700 hover:bg-pink-50 transition-all duration-200 bg-white"
            >
              <Upload className="w-16 h-16 text-[#b1006e] mx-auto mb-4" />
              <p className="text-xl font-semibold text-[#b1006e] mb-2">
                Upload Photo
              </p>
              <p className="text-gray-600">Choose from gallery</p>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
            </button>

            <button
              onClick={startCamera}
              className="border-2 border-dashed border-[#b1006e] rounded-2xl p-8 text-center hover:border-pink-700 hover:bg-pink-50 transition-all duration-200 bg-white"
            >
              <Camera className="w-16 h-16 text-[#b1006e] mx-auto mb-4" />
              <p className="text-xl font-semibold text-[#b1006e] mb-2">
                Take Photo
              </p>
              <p className="text-gray-600">Use camera</p>
              <p className="text-sm text-gray-500 mt-2">camera capture</p>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-100">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-2xl shadow-md"
                />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-[#b1006e] mb-4">
                  Ready for Personalized Analysis
                </h3>
                <p className="text-gray-700 mb-4">
                  Get AI-powered facial analysis with real product recommendations
                </p>

                {showBudgetInput && (
                  <div className="mb-4">
                    <label className="block text-[#b1006e] font-semibold mb-2 flex items-center gap-2">
                      Your Budget (KES)
                    </label>
                    <input
                      type="number"
                      value={userBudget}
                      onChange={(e) => setUserBudget(Number(e.target.value))}
                      min="1000"
                      max="50000"
                      step="500"
                      className="w-full bg-pink-50 text-gray-800 px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-[#b1006e] focus:outline-none"
                      placeholder="e.g., 10000"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      We'll recommend products within your budget
                    </p>
                  </div>
                )}

                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={handleUploadAndAnalyze}
                    disabled={analyzing}
                    className="flex-1 min-w-[180px] bg-[#b1006e] text-white py-3 px-6 rounded-full font-bold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Get My Analysis
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetSelection}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors duration-200 font-semibold"
                  >
                    Choose Different Photo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl">
              {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border-2 border-green-300 p-4 rounded-2xl">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">
                  Your Personalized Analysis is Ready!
                </span>
              </div>

              {analysis.skinAnalysis && (
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-[#b1006e] mb-6 border-b-2 border-pink-200 pb-2 flex items-center gap-2">
                    <Droplet className="text-[#b1006e]" />
                    Your Skin Profile
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                      <h4 className="font-semibold text-[#b1006e] mb-2">Skin Tone</h4>
                      <p className="text-gray-800 text-lg capitalize">{analysis.skinAnalysis.skinTone}</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                      <h4 className="font-semibold text-[#b1006e] mb-2">Facial Shape</h4>
                      <p className="text-gray-800 text-lg capitalize">{analysis.skinAnalysis.facialShape}</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                      <h4 className="font-semibold text-[#b1006e] mb-2">Skin Type</h4>
                      <p className="text-gray-800 text-lg capitalize">{analysis.skinAnalysis.skinType}</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                      <h4 className="font-semibold text-[#b1006e] mb-2">Undertone</h4>
                      <p className="text-gray-800 text-lg capitalize">{analysis.skinAnalysis.undertone}</p>
                    </div>
                    {analysis.skinAnalysis.concerns && analysis.skinAnalysis.concerns.length > 0 && (
                      <div className="md:col-span-2 bg-pink-50 p-4 rounded-2xl border border-pink-200">
                        <h4 className="font-semibold text-[#b1006e] mb-2">Skin Concerns</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skinAnalysis.concerns.map((concern, idx) => (
                            <span key={idx} className="bg-[#b1006e] text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysis.skincareRoutine && (
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-[#b1006e] mb-6 border-b-2 border-pink-200 pb-2 flex items-center gap-2">
                    <Clock className="text-[#b1006e]" />
                    Your Personalized Skincare Routine
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-[#b1006e] mb-4">☀️ Morning Routine</h4>
                      <div className="space-y-3">
                        {analysis.skincareRoutine.morning?.map((step, idx) => (
                          <div key={idx} className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[#b1006e] font-semibold">Step {idx + 1}: {step.step}</span>
                                <p className="text-gray-800 font-bold">{step.product}</p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{step.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-[#b1006e] mb-4">🌙 Evening Routine</h4>
                      <div className="space-y-3">
                        {analysis.skincareRoutine.evening?.map((step, idx) => (
                          <div key={idx} className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[#b1006e] font-semibold">Step {idx + 1}: {step.step}</span>
                                <p className="text-gray-800 font-bold">{step.product}</p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{step.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysis.skincareRoutine.weekly && analysis.skincareRoutine.weekly.length > 0 && (
                      <div>
                        <h4 className="text-xl font-semibold text-[#b1006e] mb-4">📅 Weekly Treatments</h4>
                        <div className="space-y-3">
                          {analysis.skincareRoutine.weekly.map((step, idx) => (
                            <div key={idx} className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-[#b1006e] font-semibold">{step.step}</span>
                                  <p className="text-gray-800 font-bold">{step.product}</p>
                                  <p className="text-gray-600 text-sm">{step.frequency}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm">{step.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {analysis.makeupRecommendations && (
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-[#b1006e] mb-6 border-b-2 border-pink-200 pb-2">
                    💄 Makeup Recommendations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(analysis.makeupRecommendations).map(([key, val]) => (
                      <div key={key} className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                        <h4 className="font-semibold text-[#b1006e] mb-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <p className="text-gray-800">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.fashionRecommendations && (
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-[#b1006e] mb-6 border-b-2 border-pink-200 pb-2">
                    👗 Fashion Style Guide
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(analysis.fashionRecommendations).map(([key, val]) => (
                      <div key={key} className="bg-pink-50 p-4 rounded-2xl border border-pink-200">
                        <h4 className="font-semibold text-[#b1006e] mb-2 capitalize">
                          {key}
                        </h4>
                        {Array.isArray(val) ? (
                          <div className="flex flex-wrap gap-2">
                            {val.map((item, idx) => (
                              <span key={idx} className="bg-[#b1006e] text-white px-2 py-1 rounded-full text-sm font-semibold">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-800">{val}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.productRecommendations && analysis.productRecommendations.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-pink-100">
                  <h3 className="text-2xl font-bold text-[#b1006e] mb-6 border-b-2 border-pink-200 pb-2">
                    🛍️ Recommended Products (Within Your Budget)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis.productRecommendations.map((product, idx) => (
                      <div
                        key={idx}
                        className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200 hover:border-[#b1006e] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-xs text-[#b1006e] font-semibold uppercase">{product.category}</span>
                            <p className="text-gray-800 font-bold text-lg">{product.brand}</p>
                            <p className="text-gray-700">{product.product}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            product.priority === 'essential'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {product.priority}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 italic">{product.reason}</p>

                        <div className="flex justify-between items-center">
                          <p className="text-[#b1006e] font-bold text-xl">{product.price}</p>
                          {product.buyUrl ? (
                            <a
                              href={product.buyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleProductClick(product)}
                              className="bg-[#b1006e] hover:bg-pink-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors font-semibold"
                            >
                              Buy Now <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-500">Link unavailable</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-[#b1006e] to-pink-600 rounded-3xl p-8 text-center shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-3">Want a Daily Routine Plan?</h3>
                <p className="text-white mb-4">
                  Get a detailed step-by-step daily skincare and makeup routine tailored to your needs
                </p>
                <button
                  onClick={() => window.location.href = '/routine'}
                  className="bg-white text-[#b1006e] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                  Create My Routine
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
