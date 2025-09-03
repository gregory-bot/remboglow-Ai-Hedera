import React, { useState, useEffect, useRef } from "react";
import { analyzeImage } from "../services/geminiService";
import { Camera, Loader, CheckCircle } from "lucide-react";

/**
 * Business rules:
 *  - First image upload is free.
 *  - From the second upload onwards, user must pay KES 200 via Paystack.
 *  - No login; tracked with localStorage + sessionStorage.
 *    - localStorage.ff_uploads_count → number of completed analyses.
 *    - sessionStorage.paystack_paid → 'true' if recent payment succeeded.
 */
const FREE_UPLOADS = 1;
const PRICE_KES = 50;
const BACKEND_BASE = "https://face-fit.onrender.com"; // Express backend

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [uploadsCount, setUploadsCount] = useState(
    Number(localStorage.getItem("ff_uploads_count") || "0")
  );

  const fileInputRef = useRef(null);

  // Check if user just returned from Paystack
  useEffect(() => {
    const paidFlag = sessionStorage.getItem("paystack_paid");
    if (paidFlag === "true") {
      setPaid(true);
      sessionStorage.removeItem("paystack_paid");

      const pending = sessionStorage.getItem("pending_upload_request");
      if (pending) {
        sessionStorage.removeItem("pending_upload_request");
        alert("✅ Payment confirmed — you can now add more images.");
      }
    }
  }, []);

  // Select image
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setAnalysis(null);
  };

  // Initialize Paystack checkout
  const initiatePayment = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/paystack/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "testuser@example.com", // dummy email until auth is added
          amount: PRICE_KES * 100, // Paystack expects kobo
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${errorText}`);
      }

      const data = await response.json();
      console.log("Pay init response:", data);

      if (data?.status && data?.data?.authorization_url) {
        sessionStorage.setItem("pending_upload_request", "true");
        window.location.href = data.data.authorization_url; // redirect to Paystack
      } else {
        alert("❌ Payment initialization failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment init error:", err);
      alert(`⚠️ Payment initiation failed: ${err.message}`);
    }
  };

  // Check if user can upload again
  const canAddAnotherImage = () => {
    if (uploadsCount < FREE_UPLOADS) return true;
    if (paid) return true;
    return false;
  };

  // Add new image
  const handleAddMore = () => {
    if (!canAddAnotherImage()) {
      initiatePayment();
      return;
    }
    fileInputRef.current?.click();
  };

  // Upload + AI analysis
  const handleUploadAndAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError("");

    try {
      const result = await analyzeImage(selectedImage);

      if (result?.error) {
        setError(result.message || "Analysis failed.");
      } else {
        setAnalysis(result);

        const newCount = uploadsCount + 1;
        setUploadsCount(newCount);
        localStorage.setItem("ff_uploads_count", String(newCount));
      }
    } catch (e) {
      console.error("Analysis error:", e);
      setError("Failed to process image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Try it out. Upload Your Photo
        </h2>
        <p className="text-gray-600">
          First photo is free. Additional uploads cost KES {PRICE_KES}.
        </p>
        {uploadsCount >= FREE_UPLOADS && !paid && (
          <p className="text-sm text-orange-600 mt-2">
            You’ve used your free upload. Pay KES {PRICE_KES} to add more images.
          </p>
        )}
      </div>

      {/* Upload Zone */}
      {!previewUrl ? (
        <div className="border-2 border-dashed border-purple-600 rounded-xl p-12 text-center hover:border-yellow-400 transition-colors duration-200">
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
            <Camera className="w-16 h-16 text-blue-700 mx-auto mb-4" />
            <p className="text-xl font-semibold text-black mb-2">
              Choose Your Photo
            </p>
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview & Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-black mb-4">
                  Ready for Analysis
                </h3>
                <p className="text-gray-600 mb-6">
                  We’ll analyze your facial features and suggest personalized
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
                        <Camera className="w-5 h-5" />
                        Analyze My Look
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetSelection}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Choose Different Photo
                  </button>

                  <button
                    onClick={handleAddMore}
                    className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                  >
                    Add More Images
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {error}
            </div>
          )}

          {/* AI Analysis Result */}
          {analysis && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">
                  Analysis Complete!
                </span>
              </div>

              {/* Handle both structured and free-text responses */}
              {analysis.analysis ? (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Your Personalized Recommendations
                  </h3>
                  <pre className="whitespace-pre-wrap text-black leading-relaxed">
                    {analysis.analysis}
                  </pre>
                </div>
              ) : (
                <>
                  {/* Example structured display */}
                  {analysis.skinTone && analysis.facialShape && (
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h3 className="text-2xl font-bold text-black mb-4">
                        Face Analysis
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-purple-600 mb-2">
                            Skin Tone
                          </h4>
                          <p className="text-black">{analysis.skinTone}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-600 mb-2">
                            Facial Shape
                          </h4>
                          <p className="text-black">{analysis.facialShape}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
