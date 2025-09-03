import React, { useEffect, useRef, useState } from 'react';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

const Blog = () => {
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

  const articles = [
    {
      title: "Scaling Systems for 100M+ Users: Lessons from the Trenches",
      excerpt: "Deep dive into the architectural patterns, database strategies, and infrastructure decisions that enabled our platform to handle massive scale while maintaining sub-100ms response times.",
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Architecture", "Scalability", "Performance"],
      readTime: "12 min read",
      date: "Dec 15, 2024"
    },
    {
      title: "My Journey Leading Multi-Region Architecture Redesign",
      excerpt: "How we redesigned our monolithic architecture into a distributed system spanning 12 regions, reducing latency by 70% and improving availability to 99.99%.",
      image: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Architecture", "Migration", "Infrastructure"],
      readTime: "15 min read",
      date: "Nov 28, 2024"
    },
    {
      title: "Leading Global Engineering Teams: A Framework for Success",
      excerpt: "Best practices for managing distributed teams across multiple time zones, fostering collaboration, and maintaining high engineering standards at scale.",
      image: "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Leadership", "Management", "Remote Work"],
      readTime: "8 min read",
      date: "Nov 10, 2024"
    },
    {
      title: "AI/ML in Production: From Prototype to Scale",
      excerpt: "Implementing machine learning models in production environments, covering model deployment, monitoring, A/B testing, and maintaining performance at enterprise scale.",
      image: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["AI/ML", "Production", "MLOps"],
      readTime: "10 min read",
      date: "Oct 22, 2024"
    },
    {
      title: "The Evolution of Modern Web Development",
      excerpt: "Analyzing the current state of web development, emerging technologies, and predictions for the next 5 years based on industry trends and developer adoption patterns.",
      image: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Web Development", "Trends", "Future"],
      readTime: "7 min read",
      date: "Oct 5, 2024"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <section ref={sectionRef} className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Words & Thoughts
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sharing knowledge from building large-scale systems, leading engineering teams, 
              and navigating the challenges of modern software development.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {articles.map((article, index) => (
              <article
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg leading-relaxed opacity-90 mb-6 max-w-2xl mx-auto">
              Subscribe to get the latest insights on engineering leadership, system architecture, 
              and technical best practices delivered to your inbox monthly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Subscribe
              </button>
            </div>
            
            <p className="text-sm opacity-80 mt-4">
              No spam, unsubscribe at any time. 2,500+ engineers already subscribed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;