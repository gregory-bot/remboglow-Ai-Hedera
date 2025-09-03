import React from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Problems from './components/Problems.jsx';
import Solutions from './components/Solutions.jsx';
import Steps from './components/Steps.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="min-h-screen bg-[#e2b8e6] font-sans relative">
      {/* Notifications */}
      <Toaster position="top-right" />

      {/* Header */}
      <Header />

      {/* Main Content */}
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
        <section id="contact">
          <Contact />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating ChatBot (always available) */}
      <ChatBot />
    </div>
  );
}

export default App;
