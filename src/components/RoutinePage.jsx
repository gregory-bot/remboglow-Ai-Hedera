import React, { useState, useEffect } from "react";
import { generateDailyRoutine } from "../services/geminiService";
import {
  Clock,
  Sun,
  Moon,
  Calendar,
  Loader,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Info,
  ShoppingBag
} from "lucide-react";
import { trackUserAction } from "../services/analytics";
import { useNavigate } from "react-router-dom";

const RoutinePage = () => {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAnalysis = sessionStorage.getItem("face_fit_analysis");
    if (savedAnalysis) {
      try {
        const analysis = JSON.parse(savedAnalysis);
        if (analysis.skinAnalysis) {
          const profile = {
            skinType: analysis.skinAnalysis.skinType || "combination",
            concerns: analysis.skinAnalysis.concerns || [],
            budget: parseInt(sessionStorage.getItem("face_fit_budget")) || 10000
          };
          setUserProfile(profile);
          generateRoutineFromProfile(profile);
        }
      } catch (e) {
        console.error("Error parsing saved analysis:", e);
      }
    }
  }, []);

  const generateRoutineFromProfile = async (profile) => {
    setLoading(true);
    setError("");

    trackUserAction("routine_generation_started", {
      skin_type: profile.skinType,
      concerns: profile.concerns,
      budget: profile.budget
    });

    try {
      const routineData = await generateDailyRoutine(profile);
      setRoutine(routineData);

      trackUserAction("routine_generation_complete", {
        total_cost: routineData.estimatedTotalCost,
        morning_steps: routineData.routineSchedule?.morning?.length || 0,
        evening_steps: routineData.routineSchedule?.evening?.length || 0
      });
    } catch (err) {
      console.error("Error generating routine:", err);
      setError("Failed to generate routine. Please try again.");
      trackUserAction("routine_generation_error", {
        error_message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2b8e6] pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <Loader className="w-16 h-16 text-[#b1006e] animate-spin mx-auto mb-4" />
            <p className="text-[#b1006e] text-2xl font-bold">Creating your personalized routine...</p>
            <p className="text-gray-600 mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-[#e2b8e6] pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#b1006e] mb-6 hover:text-pink-700 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Routine Yet</h2>
            <p className="text-gray-600 text-lg mb-6">
              Upload your photo in the Features section to get your personalized skincare routine!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#b1006e] text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition-colors duration-200 text-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e2b8e6] pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#b1006e] mb-6 hover:text-pink-700 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#b1006e] mb-3">
            Your Personalized Daily Routine
          </h1>
          <p className="text-gray-700 text-lg">
            Custom routine for {userProfile?.skinType} skin
          </p>
        </div>

        {routine.routineSchedule?.morning && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-400 p-3 rounded-full">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#b1006e]">Morning Routine</h2>
                <p className="text-gray-600">
                  Duration: {routine.routineDuration?.morning || "10-15 minutes"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {routine.routineSchedule.morning.map((step, idx) => (
                <div key={idx} className="bg-pink-50 rounded-2xl p-6 border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{step.step}</h3>
                        <p className="text-gray-500 text-sm">
                          {step.time || ""} {step.time && "•"} {step.duration || "2 min"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[#b1006e] font-bold text-lg mb-1">{step.product}</p>
                    <p className="text-gray-600 text-sm">{step.brand}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl mb-3 border border-pink-200">
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-bold text-[#b1006e]">How to use:</span> {step.howToUse}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-bold text-[#b1006e]">Why:</span> {step.why}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-[#b1006e] font-bold text-xl">{step.price}</p>
                    {step.buyUrl && (
                      <a
                        href={step.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#b1006e] hover:bg-pink-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors font-semibold"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Buy Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {routine.routineSchedule?.evening && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500 p-3 rounded-full">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#b1006e]">Evening Routine</h2>
                <p className="text-gray-600">
                  Duration: {routine.routineDuration?.evening || "15-20 minutes"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {routine.routineSchedule.evening.map((step, idx) => (
                <div key={idx} className="bg-pink-50 rounded-2xl p-6 border-l-4 border-indigo-500">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{step.step}</h3>
                        <p className="text-gray-500 text-sm">
                          {step.time || ""} {step.time && "•"} {step.duration || "2 min"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[#b1006e] font-bold text-lg mb-1">{step.product}</p>
                    <p className="text-gray-600 text-sm">{step.brand}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl mb-3 border border-pink-200">
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-bold text-[#b1006e]">How to use:</span> {step.howToUse}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-bold text-[#b1006e]">Why:</span> {step.why}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-[#b1006e] font-bold text-xl">{step.price}</p>
                    {step.buyUrl && (
                      <a
                        href={step.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#b1006e] hover:bg-pink-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors font-semibold"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Buy Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {routine.routineSchedule?.weekly && routine.routineSchedule.weekly.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-500 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#b1006e]">Weekly Treatments</h2>
                <p className="text-gray-600">Special care 2-3 times per week</p>
              </div>
            </div>

            <div className="space-y-4">
              {routine.routineSchedule.weekly.map((step, idx) => (
                <div key={idx} className="bg-pink-50 rounded-2xl p-6 border-l-4 border-pink-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{step.step}</h3>
                      <p className="text-pink-600 text-sm font-semibold">{step.frequency}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[#b1006e] font-bold text-lg mb-1">{step.product}</p>
                    <p className="text-gray-600 text-sm">{step.brand}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl mb-3 border border-pink-200">
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-bold text-[#b1006e]">How to use:</span> {step.howToUse}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-bold text-[#b1006e]">Why:</span> {step.why}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-[#b1006e] font-bold text-xl">{step.price}</p>
                    {step.buyUrl && (
                      <a
                        href={step.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#b1006e] hover:bg-pink-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors font-semibold"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Buy Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {routine.tips && routine.tips.length > 0 && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-8 shadow-2xl mb-6 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-[#b1006e]" />
              <h3 className="text-2xl font-bold text-[#b1006e]">Pro Tips</h3>
            </div>
            <ul className="space-y-3">
              {routine.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
          <Clock className="w-12 h-12 text-[#b1006e] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-[#b1006e] mb-2">Total Investment</h3>
          <p className="text-4xl font-bold text-pink-600 mb-4">
            {routine.estimatedTotalCost || "Ksh 8,000 - 12,000"}
          </p>
          <p className="text-gray-600">
            This routine is designed specifically for your {userProfile?.skinType} skin
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoutinePage;
