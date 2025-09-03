import React, { useEffect, useRef, useState } from 'react';
import { Code, Server, Cloud, Database, Brain, Settings } from 'lucide-react';

const TechStack = () => {
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
      title: "Languages",
      icon: <Code className="w-6 h-6" />,
      color: "bg-blue-500",
      technologies: ["JavaScript", "TypeScript", "Python", "Go", "Java", "C++", "Rust", "Solidity"]
    },
    {
      title: "Frameworks",
      icon: <Server className="w-6 h-6" />,
      color: "bg-green-500",
      technologies: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Spring Boot", "Gin"]
    },
    {
      title: "Cloud & DevOps",
      icon: <Cloud className="w-6 h-6" />,
      color: "bg-purple-500",
      technologies: ["AWS", "Google Cloud", "Azure", "Kubernetes", "Docker", "Terraform", "GitLab CI", "Jenkins"]
    },
    {
      title: "Databases",
      icon: <Database className="w-6 h-6" />,
      color: "bg-orange-500",
      technologies: ["PostgreSQL", "MongoDB", "Redis", "Cassandra", "ClickHouse", "DynamoDB", "Elasticsearch", "Neo4j"]
    },
    {
      title: "AI/ML Tools",
      icon: <Brain className="w-6 h-6" />,
      color: "bg-pink-500",
      technologies: ["TensorFlow", "PyTorch", "Scikit-learn", "Apache Spark", "MLflow", "Kubeflow", "Jupyter", "Pandas"]
    },
    {
      title: "Tools & Others",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-indigo-500",
      technologies: ["Git", "VS Code", "IntelliJ", "Vim", "Postman", "Figma", "Jira", "Datadog"]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <section ref={sectionRef} className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Tech Stack
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Technologies and tools I use to build scalable, performant, and maintainable systems.
            </p>
          </div>

          {/* Tech Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`${category.color} p-4`}>
                  <div className="flex items-center text-white">
                    {category.icon}
                    <h2 className="text-xl font-semibold ml-3">{category.title}</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {category.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy */}
          <div className={`mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-2xl font-bold mb-4">Technology Philosophy</h2>
            <p className="text-lg leading-relaxed opacity-90 max-w-4xl mx-auto">
              I believe in choosing the right tool for the job, not just the newest one. My approach 
              focuses on proven technologies that scale, maintainable architectures, and continuous 
              learning. Quality over quantity, performance over perfection.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TechStack;