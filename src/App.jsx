import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { initGA, trackPageView, getOrCreateSessionId, getOrCreateUserId, trackSectionView } from "./services/analytics";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Problems from "./components/Problems.jsx";
import Solutions from "./components/Solutions.jsx";
import Steps from "./components/Steps.jsx";
import ImageUpload from "./components/ImageUpload.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import ChatBot from "./components/ChatBot.jsx";
import PaystackCallback from "./components/PaystackCallback.jsx";
import Feedback from "./components/Feedback.jsx";


function AnalyticsWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return children;
}

function App() {
  useEffect(() => {
    initGA();

    const sessionId = getOrCreateSessionId();
    const userId = getOrCreateUserId();

    console.log("📊 Analytics initialized:", {
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const sectionId = entry.target.id;
            if (sectionId) {
              trackSectionView(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <Router>
      <AnalyticsWrapper>
        <div className="min-h-screen bg-[#e2b8e6] font-sans relative">
          <Toaster position="top-right" />

          <Header />

          <Routes>
            <Route
              path="/"
              element={
                <main>
                  <section id="home">
                    <Hero />
                  </section>
                  <section id="problems">
                    <Problems />
                  </section>
                  <section id="solutions">
                    <Solutions />
                  </section>
                  <section id="steps">
                    <Steps />
                  </section>
                  <section id="features">
                    <ImageUpload />
                  </section>
                  <section id="about">
                    <About />
                  </section>
                    <section id="feedback">
    <Feedback />
  </section>
                  <section id="contact">
                    <Contact />
                  </section>
                </main>
              }
            />

            <Route path="/paystack-callback" element={<PaystackCallback />} />
          </Routes>

          <Footer />

          <ChatBot />
        </div>
      </AnalyticsWrapper>
    </Router>
  );
}

export default App;
