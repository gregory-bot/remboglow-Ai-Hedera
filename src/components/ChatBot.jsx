import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Loader, Mic, Minimize2 } from 'lucide-react';
import { generateTextResponse } from '../services/geminiService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there 👋 I'm your remboglow Assistant! Ask me anything about beauty, fashion, or how to use the platform 💜",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  // 🎙️ Setup Speech-to-Text
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // 🔊 Text-to-Speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // ✉️ Send Message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateTextResponse(userMessage.text);
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      speak(response);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Oops! Something went wrong. Please try again 💜",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  // Desktop-specific positioning
  const getChatPosition = () => {
    if (isMobile) {
      return {
        right: '1rem',
        bottom: '1rem',
        maxWidth: 'calc(100vw - 2rem)'
      };
    } else {
      return {
        right: '2rem',
        bottom: '2rem',
        maxWidth: '24rem'
      };
    }
  };

  const chatPosition = getChatPosition();

  return (
    <>
      {/* Floating Button - Desktop positioning */}
      <motion.button
        onClick={toggleChat}
        className={`fixed bottom-8 right-8 bg-gradient-to-r from-[#e2b8e6] to-purple-500 hover:opacity-90 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-300 ${isOpen ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open chat"
        style={{
          bottom: isMobile ? '1.5rem' : '2rem',
          right: isMobile ? '1.5rem' : '2rem'
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Minimized Chat Header */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bg-gradient-to-r from-[#e2b8e6] to-purple-500 text-white p-4 rounded-2xl shadow-lg z-50 flex items-center justify-between"
            style={{
              bottom: chatPosition.bottom,
              right: chatPosition.right,
              width: isMobile ? 'calc(100vw - 2rem)' : '20rem'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">remboglow.com</h3>
                <p className="text-xs opacity-90">Click to expand</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                aria-label="Expand chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-purple-200"
            style={{
              right: chatPosition.right,
              bottom: chatPosition.bottom,
              width: isMobile ? chatPosition.maxWidth : '24rem',
              height: isMobile ? '70vh' : '500px',
              maxHeight: isMobile ? '70vh' : '32rem'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#e2b8e6] to-purple-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">remboglow Assistant</h3>
                  <p className="text-sm opacity-90">Here to help ✨</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={minimizeChat}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isBot ? 'bg-purple-100' : 'bg-pink-100'}`}>
                      {message.isBot ? (
                        <Bot className="w-4 h-4 text-purple-600" />
                      ) : (
                        <User className="w-4 h-4 text-pink-600" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${message.isBot ? 'bg-gray-100 text-gray-800' : 'bg-gradient-to-r from-[#e2b8e6] to-purple-500 text-white'}`}>
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-purple-100'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about remboglow..."
                  className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  disabled={isLoading}
                />
                {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                  <motion.button
                    onClick={startListening}
                    whileTap={{ scale: 0.9 }}
                    className={`p-3 rounded-full flex-shrink-0 ${isListening ? 'bg-red-500 text-white' : 'bg-purple-100 text-purple-600'} transition-colors`}
                    disabled={isLoading}
                    aria-label="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-r from-[#e2b8e6] to-purple-500 hover:opacity-90 text-white p-3 rounded-full transition-colors flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;