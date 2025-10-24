import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-4FRC6TM73F";

export const initGA = () => {
  try {
    ReactGA.initialize(MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true,
      },
    });
    console.log("✅ Google Analytics initialized");
  } catch (error) {
    console.error("❌ GA initialization failed:", error);
  }
};

export const trackPageView = (path) => {
  try {
    ReactGA.send({ hitType: "pageview", page: path });
    console.log(`📊 Page view tracked: ${path}`);
  } catch (error) {
    console.error("❌ Page view tracking failed:", error);
  }
};

export const trackEvent = (eventName, params = {}) => {
  try {
    ReactGA.event(eventName, params);
    console.log(`📊 Event tracked: ${eventName}`, params);
  } catch (error) {
    console.error("❌ Event tracking failed:", error);
  }
};

export const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem("facefit_session_id");

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("facefit_session_id", sessionId);
    sessionStorage.setItem("facefit_session_start", new Date().toISOString());
  }

  return sessionId;
};

export const getOrCreateUserId = () => {
  let userId = localStorage.getItem("facefit_user_id");

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("facefit_user_id", userId);
    localStorage.setItem("facefit_user_created", new Date().toISOString());

    trackEvent("new_user_created", {
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  }

  return userId;
};

export const trackUserAction = (action, metadata = {}) => {
  const sessionId = getOrCreateSessionId();
  const userId = getOrCreateUserId();

  const eventData = {
    action,
    session_id: sessionId,
    user_id: userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  trackEvent(action, eventData);

  return eventData;
};

export const trackImageUpload = (imageData) => {
  trackUserAction("image_uploaded", {
    image_size: imageData.size,
    image_type: imageData.type,
    upload_count: Number(localStorage.getItem("ff_uploads_count") || 0) + 1,
  });
};

export const trackAnalysisComplete = (analysisData) => {
  trackUserAction("analysis_completed", {
    skin_tone: analysisData.skinTone,
    facial_shape: analysisData.facialShape,
    products_suggested: analysisData.productSuggestions?.length || 0,
  });
};

export const trackPaymentInitiated = (amount) => {
  trackUserAction("payment_initiated", {
    amount: amount,
    currency: "KES",
  });
};

export const trackPaymentCompleted = (amount) => {
  trackUserAction("payment_completed", {
    amount: amount,
    currency: "KES",
    paid_status: true,
  });
};

export const trackProductClick = (product) => {
  trackUserAction("product_clicked", {
    product_name: product.product,
    brand: product.brand,
    price: product.price,
    is_affordable: product.isAffordable,
  });
};

export const trackSectionView = (sectionName) => {
  trackUserAction("section_viewed", {
    section: sectionName,
  });
};

export const getSessionMetrics = () => {
  return {
    sessionId: sessionStorage.getItem("facefit_session_id"),
    userId: localStorage.getItem("facefit_user_id"),
    sessionStart: sessionStorage.getItem("facefit_session_start"),
    userCreated: localStorage.getItem("facefit_user_created"),
    uploadCount: localStorage.getItem("ff_uploads_count"),
    isPaid: localStorage.getItem("ff_paid") === "true",
  };
};
