import React, { useState } from "react";
import { Menu, Search, ArrowRight, CheckCircle, Users, BarChart3, Palette, Code, Monitor } from "lucide-react";

const navItems = [
  { name: "Products", dropdown: ["Test Management", "Bug Tracking", "Reporting"] },
  { name: "Solutions", dropdown: ["Automation", "Manual Testing", "Performance"] },
  {
    name: "Why Us",
    megaDropdown: [
      { title: "System of Work", desc: "Blueprint for how teams work together" },
      { title: "Marketplace", desc: "Connect thousands of apps to your products" },
      { title: "Customers", desc: "Case studies & stories powered by teamwork" },
      { title: "FedRAMP", desc: "Compliant solutions for the public sector" },
      { title: "Resilience", desc: "Enterprise-grade & highly performant infrastructure" },
      { title: "Platform", desc: "Deeply integrated, reliable & secure platform" },
      { title: "Trust center", desc: "Ensure your data's security, compliance & availability" },
    ]
  },
  { name: "Resources", dropdown: ["Docs", "Blog", "Webinars"] },
  { name: "Enterprise", dropdown: ["Custom Solutions", "Integrations", "Support"] },
];

const categories = [
  { name: "Software", icon: Code, color: "bg-purple-100", iconColor: "text-purple-600" },
  { name: "Product management", icon: CheckCircle, color: "bg-yellow-100", iconColor: "text-yellow-600" },
  { name: "Marketing", icon: BarChart3, color: "bg-blue-100", iconColor: "text-blue-600" },
  { name: "Project management", icon: Monitor, color: "bg-orange-100", iconColor: "text-orange-600" },
  { name: "Design", icon: Palette, color: "bg-pink-100", iconColor: "text-pink-600" },
  { name: "IT", icon: Users, color: "bg-green-100", iconColor: "text-green-600" },
];

export default function LandingHeader({ user }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "";

  // Close drawer on outside click
  React.useEffect(() => {
    if (!drawerOpen) return;
    const handleClick = (e) => {
      if (e.target.closest('.drawer') || e.target.closest('.hamburger')) return;
      setDrawerOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerOpen]);

  return (
    <div className="w-full">
      <nav className="w-full bg-white flex items-center px-4 py-4 shadow relative">
        {/* Modern searchbar overlay */}
        {searchOpen ? (
          <div className="fixed top-0 left-0 w-full h-24 bg-white z-50 flex items-center justify-center transition-all duration-300">
            <div className="w-full max-w-2xl flex items-center px-6">
              <input
                type="text"
                placeholder="Search Keywords"
                className="w-full h-14 px-6 text-xl rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                autoFocus
              />
              <button className="ml-4 text-gray-400 text-2xl" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
            </div>
          </div>
        ) : (
          <>
            {/* Hamburger for mobile, left aligned */}
            <div className="flex items-center flex-shrink-0">
              <button className="hamburger lg:hidden mr-2 rounded-r-full bg-blue-100 p-2" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <Menu className="w-8 h-8 text-blue-700" />
              </button>
            </div>
            {/* Logo and name, centered on mobile, left on desktop */}
            <div className="flex items-center gap-4 mx-auto lg:mx-0">
              <img src={"https://i.postimg.cc/PrG43h61/kiwami.jpg"} alt="KiwamiTestCloud Logo" className="w-36 h-16 object-contain" />
              <span className="text-3xl font-bold text-blue-700">KiwamiTestCloud</span>
              <div className="hidden lg:flex items-center gap-2">
                {navItems.map(item => (
                  <div key={item.name} className="relative group mx-2">
                    <button className="text-black font-medium px-3 py-2 hover:text-blue-300">{item.name}</button>
                    {/* Mega dropdown for 'Why Us' */}
                    {item.megaDropdown ? (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full bg-white text-black rounded-2xl shadow-xl mt-4 p-8 min-w-[700px] flex flex-wrap gap-8 hidden group-hover:flex z-20">
                        {item.megaDropdown.map((opt, idx) => (
                          <div key={opt.title} className="w-1/3 mb-4">
                            <div className="font-bold text-lg mb-1 flex items-center gap-2">
                              {opt.title}
                              {opt.title === "System of Work" && (
                                <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">NEW</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{opt.desc}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="absolute left-0 top-full bg-white text-black rounded shadow-lg mt-2 min-w-[160px] hidden group-hover:block z-10">
                        {item.dropdown.map(opt => (
                          <div key={opt} className="px-4 py-2 hover:bg-blue-50 cursor-pointer">{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Right side: search and profile */}
            <div className="flex items-center gap-4 ml-auto">
              <button onClick={() => setSearchOpen(v => !v)} className="text-blue-600 hover:text-blue-300">
                <Search className="w-6 h-6" />
              </button>
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {initials || ""}
              </div>
            </div>
            {/* Drawer for mobile nav */}
            <div
              className={`drawer fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
              style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}
            >
              <div className="flex flex-col p-8 gap-6">
                <div className="flex items-center gap-3 mb-8">
                  <img src={"https://i.postimg.cc/PrG43h61/kiwami.jpg"} alt="Logo" className="w-12 h-12 rounded-full" />
                  <span className="text-2xl font-bold text-blue-700">KiwamiTestCloud</span>
                </div>
                {navItems.map(item => (
                  <div key={item.name}>
                    <button
                      className="w-full text-left text-black font-medium px-3 py-2 hover:text-blue-600 focus:outline-none"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Overlay for smooth close */}
            {drawerOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300 ease-in-out" />
            )}
          </>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Headline */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4 leading-tight">
              KiwamiTestCloud:
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              from <span className="relative">
                bugs
                <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 200 20" fill="none">
                  <path d="M5 15C50 5, 100 5, 195 15" stroke="#FCD34D" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span> to dreams
            </h2>
          </div>

          {/* CTA Button */}
          <div className="mb-16 animate-fade-in-delay">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
              Get started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Category Icons */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-5xl mx-auto animate-fade-in-delay-2">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={category.name} 
                  className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-110"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300`}>
                    <IconComponent className={`w-8 h-8 ${category.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                    {category.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Login Link */}
          <div className="mt-16 animate-fade-in-delay-3">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">
                Login
              </a>
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}