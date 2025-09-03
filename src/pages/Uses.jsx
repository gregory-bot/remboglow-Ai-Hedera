import React, { useEffect, useRef, useState } from 'react';

const Uses = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      title: "Coding Tools",
      items: [
        "VS Code - Primary editor with extensive customization",
        "JetBrains IntelliJ Ultimate - For Java/Kotlin and complex refactoring",
        "Neovim - Terminal-based editing with custom Lua config",
        "iTerm2 + Oh My Zsh - Enhanced terminal with Powerlevel10k theme",
        "Docker Desktop - Containerization and local development",
        "Postman - API testing and documentation"
      ]
    },
    {
      title: "Hardware",
      items: [
        "MacBook Pro 16\" M2 Max - Primary development machine with 64GB RAM",
        "Dell UltraSharp 32\" 4K - Main display for coding and design work",
        "LG 27\" 4K - Secondary display for monitoring and documentation",
        "Herman Miller Aeron - Ergonomic chair for long coding sessions",
        "Apple Magic Keyboard - Wireless keyboard with numeric keypad",
        "Logitech MX Master 3S - Precision mouse with customizable buttons"
      ]
    },
    {
      title: "Productivity",
      items: [
        "Raycast - Spotlight replacement with powerful extensions",
        "Linear - Issue tracking and project management",
        "Notion - Documentation, notes, and knowledge management",
        "1Password - Password management and secure notes",
        "Rectangle - Window management with keyboard shortcuts",
        "CleanMyMac X - System optimization and maintenance"
      ]
    },
    {
      title: "Terminal",
      items: [
        "iTerm2 - Terminal emulator with split panes and profiles",
        "Oh My Zsh - Framework for managing Zsh configuration",
        "Powerlevel10k - Fast and customizable Zsh theme",
        "Homebrew - Package manager for macOS",
        "GitHub CLI - Command-line interface for GitHub",
        "Tmux - Terminal multiplexer for session management"
      ]
    },
    {
      title: "Fonts",
      items: [
        "JetBrains Mono - Primary coding font with ligatures",
        "Fira Code - Alternative coding font with programming ligatures",
        "SF Pro - System font for UI elements",
        "Inter - Web typography and documentation",
        "Operator Mono - Premium coding font for special projects"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <section ref={sectionRef} className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Uses
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A comprehensive look at my development setup, tools, and workflows that help me 
              build scalable systems efficiently.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {category.title}
                </h2>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const [name, description] = item.split(' - ');
                    return (
                      <div key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                          {description && (
                            <span className="text-gray-600 dark:text-gray-300"> - {description}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Setup Philosophy */}
          <div className={`mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-2xl font-bold mb-4">Setup Philosophy</h2>
            <p className="text-lg leading-relaxed opacity-90 max-w-3xl mx-auto">
              My setup is optimized for both performance and comfort. I believe in investing in quality tools 
              that enhance productivity while maintaining a clean, organized workspace. Every choice is 
              intentional and focused on long-term efficiency.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Uses;