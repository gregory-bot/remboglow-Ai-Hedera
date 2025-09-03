import React, { useEffect, useRef, useState } from 'react';
import { Download, Award, Users, Code } from 'lucide-react';
// Add this import at the top of Contact.jsx
import About from './About'; // or the correct path to your About component

// Your component code...

const About = () => {
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <section ref={sectionRef} className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                About Me
              </h1>
              
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  With over 8 years of experience at leading tech companies, I specialize in architecting 
                  large-scale distributed systems, leading global engineering teams, and mentoring the next 
                  generation of software engineers.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  My expertise spans Web2, Web3, and AI domains, with a passion for creating technology 
                  that makes a meaningful impact. I've built systems serving 100M+ users, led teams across 
                  multiple continents, and contributed to open-source projects with thousands of stars.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  When I'm not coding, you'll find me speaking at tech conferences, mentoring engineers, 
                  or exploring the latest developments in artificial intelligence and blockchain technology.
                </p>
              </div>
              
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                <Download className="mr-2 w-4 h-4" />
                Download CV
              </button>
            </div>
            
            {/* Right Image */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Alex Chen"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/5 to-purple-600/5"></div>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Code className="w-8 h-8" />, number: "8+", label: "Years Experience" },
              { icon: <Users className="w-8 h-8" />, number: "100M+", label: "Users Served" },
              { icon: <Award className="w-8 h-8" />, number: "50+", label: "Engineers Mentored" },
              { icon: <Code className="w-8 h-8" />, number: "25+", label: "Projects Delivered" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;