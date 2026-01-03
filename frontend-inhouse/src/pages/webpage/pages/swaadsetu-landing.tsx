import React, { useState, useEffect } from "react";
import Hero from "./Hero";
import { Footer } from "../component/Footer";
import { CTASection } from "../component/cta-section";
import { CustomerSection } from "./customer-section";
import { AnalyticsSection } from "./AnalyticsSection";
import Navbar from "../component/Navbar";
import AboutSection from "./AboutSection";

import { Helmet } from "@dr.pogodin/react-helmet";
// import MobileFloatingButton from "../component/ui/MobileFolatingButton";
import StaffSection from "../pages/StaffSection";

const SwaadsetuLanding: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Active section tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "about", "contact"];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const { offsetTop, clientHeight } = section;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + clientHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
   <>
     <Helmet>
      <title>Swaad Setu - Revolutionize Your Restaurant's Ordering Experience</title>
      <meta
        name="description"
        content="Swaad Setu is a cloud-based SaaS and India’s leading QR code ordering platform helping restaurants enhance customer experience, manage orders efficiently, and grow faster."
      />

      <meta name="keywords" content="SwaadSetu, smart ordering, restaurant management, call waiter, live bill updates, scan & order" />
        <meta name="author" content="Zager" />
      {/* Open Graph / Social */}
      <meta property="og:title" content="Swaad Setu - Revolutionize Your Restaurant's Ordering Experience" />
      <meta property="og:description" content="Swaad Setu is a cloud-based SaaS and India’s leading QR code ordering platform helping restaurants enhance customer experience, manage orders efficiently, and grow faster." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.swaadsetu.com" />
      <meta property="og:image" content="https://www.swaadsetu.com/logo.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Swaad Setu - Revolutionize Your Restaurant's Ordering Experience" />
      <meta name="twitter:description" content="Swaad Setu is a cloud-based SaaS and India’s leading QR code ordering platform helping restaurants enhance customer experience, manage orders efficiently, and grow faster." />
      <meta name="twitter:image" content="https://www.swaadsetu.com/logo.png" />

    </Helmet>

    
    <div className="font-sans bg-radial from-yellow-100 from-20% via-white to-yellow-100 text-black overflow-x-hidden scroll-smooth">
      {/* Navigation */}

      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative">
        <Hero />
      </section>

      {/* About Section */}
      <section id="about">
        <AboutSection />
      </section>

      <div id="features">
        {/* StaffSection */}
        <CustomerSection />

        {/* Staff Section */}
        <StaffSection />

        {/* AnalyticsSection */}
        <AnalyticsSection />
      </div>

      <div id="contact">
        {/* CTA Section*/}
        <CTASection />
        {/* Footer */}
        <Footer />
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.45s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
        .animate-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </div>
    </>
  );
};

export default SwaadsetuLanding;
