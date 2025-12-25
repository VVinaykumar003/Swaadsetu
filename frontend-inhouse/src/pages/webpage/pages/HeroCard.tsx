"use client";
import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center px-4 py-20 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.3),transparent_50%)] opacity-50" />
      
      <div className="max-w-6xl mx-auto text-center text-black relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 bg-gradient-to-r from-black via-gray-800 to-black-900 bg-clip-text text-transparent leading-tight">
            Modern Office
            <span className="block text-yellow-900 text-4xl md:text-6xl">Management System</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-black/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Real-time notifications, task tracking, and role-based access control built for modern teams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button className="px-12 py-6 bg-black text-yellow-400 text-lg font-bold rounded-full shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 transition-all duration-300 hover:-translate-y-1">
              Get Started Free
            </button>
            <button className="px-12 py-6 border-4 border-black text-black text-lg font-bold rounded-full hover:bg-black hover:text-yellow-400 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Cards */}
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/20 backdrop-blur-xl rounded-3xl rotate-12 opacity-70" />
      <div className="absolute top-20 right-20 w-48 h-48 bg-black/10 backdrop-blur-xl rounded-2xl -rotate-6 opacity-60" />
    </section>
  );
};

export default HeroSection;

