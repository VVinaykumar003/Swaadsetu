import React, { useState, useEffect } from "react";
import Hero from "./Hero";
import { motion } from "framer-motion";
import { Footer } from "../component/Footer";
// import HotspotInteractive from '../component/MenuScreenShot';
import { useNavigate } from "react-router-dom";
import { CTASection } from "../component/cta-section";
import { StaffSection } from "./staff-section";
import { AnalyticsSection } from "./AnalyticsSection";
import Navbar from "../component/Navbar";
import AboutSection from "./AboutSection";
import bg from "../assets/SwaadSetu_shape.png";




interface ScreenshotCardProps {
  icon: string;
  title: string;
  description: string;
}

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
      const sections = ["home", "features", "about",  "contact"];
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

 

  const screenshots: ScreenshotCardProps[] = [
    {
      imageUrl:
        "https://get.apicbase.com/wp-content/uploads/2024/10/Apicbase-Restaurant-Management-Software.png",
      title: "Menu Management",
      description:
        "Create and update your menu with items, combos, images, and dietary tags in seconds.",
      link: "/",
    },
    {
      imageUrl:
        "https://foodship.co.in/wp-content/uploads/2023/05/Order-Management.jpg",
      title: "Order Tracking",
      description:
        "Monitor all orders live and track them from pending to delivered.",
    },
    {
      imageUrl:
        "https://d2xqcz296oofyv.cloudfront.net/wp-content/uploads/2022/04/utility-billing-software-solutions-tridens.jpg",
      title: "Billing System",
      description:
        "Generate accurate bills with extras, taxes, and discounts supported out-of-the-box.",
    },
    {
      imageUrl:
        "https://scholarlykitchen.sspnet.org/wp-content/uploads/2015/07/options-analysis1.jpg?w=300",
      title: "Analytics Dashboard",
      description:
        "See revenue trends, top sellers, and peak hours at a glance.",
    },
    {
      imageUrl: "https://resdiary.com/hubfs/Table%20Management%20System.jpg",
      title: "Table Management",
      description:
        "Visualise table occupancy, open sessions, and assignments in one place.",
    },
    {
      imageUrl:
        "https://www.shutterstock.com/shutterstock/photos/1727885581/display_1500/stock-vector-staff-log-in-icon-profile-individual-icon-1727885581.jpg",
      title: "Staff Portal",
      description:
        "Let staff manage orders and bills quickly using a focused workspace.",
    },
  ];
  const navigate = useNavigate();

  return (
    <div className="font-sans bg-radial from-yellow-100 from-20% via-white to-yellow-100 text-black overflow-x-hidden scroll-smooth">
      {/* Navigation */}

      <Navbar />



      {/* Hero Section */}
      <section id="home" className="relative">
        <Hero />
      </section>

      {/* About Section */}
      <section id="about">
        <AboutSection/>
      </section>

      <div id="features">
        {/* StaffSection */}
        <StaffSection />

        {/* Screenshots Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-radial from-yellow-100 from-20% via-white to-yellow-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center flex flex-col items-center">
              {/* Label + main heading */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                }}
              >
               

                <div className=" relative w-40 sm:w-60 md:w-60 h-14 sm:h-16 md:h-18 lg:h-20  mx-auto  overflow-hidden rounded-md">
                  {/* Background image */}
                  <img
                    src={bg}
                    alt="Staff Portal"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Text on top, starting from left */}
                  <div className="relative z-10 mx-1 lg:mx-3 my-2 flex items-center justify-start w-full h-full px-4">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-black">
                      Staff Features
                    </h3>
                  </div>
                </div>

                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold text-black ">
                  Give your team a clean, fast workspace.
                </h2>
              {/* subheading */}
              <p className="mt-3 text-gray-700 max-w-2xl mx-auto">
                   From order routing to table management, every screen is built to
                reduce taps, cut confusion, and keep service moving smoothly.
              </p>
              </motion.div>

            </div>

            {/* cards */}
            <div className="mt-10 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={index}
                    className="
                        relative overflow-hidden rounded-2xl border border-white/10
                        bg-white/5 backdrop-blur-md
                        shadow-lg shadow-black/40
                        hover:shadow-xl hover:-translate-y-1 hover:bg-white/10
                        transition-all duration-300
                      "
                  >
                    {/* Top image */}
                    <div className="relative">
                      <img
                        src={screenshot.imageUrl}
                        alt={screenshot.title}
                        className="h-40 w-full object-cover inset-0 "
                        loading="lazy"
                      />
                      {/* gradient overlay at bottom of image */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      {/* small pill tag */}
                      <span className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[11px] text-amber-300 uppercase tracking-wide">
                        Preview
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-3 px-4 py-4">
                      {/* Title + accent bar */}
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-6 w-1.5 rounded-full bg-amber-400" />
                        <div>
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-600">
                            {screenshot.title}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            {screenshot.description}
                          </p>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          {/* <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> */}
                        </span>
                        <span className="uppercase tracking-wide text-gray-500">
                          Swaadsetu
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          className="btn btn-xs sm:btn-sm btn-warning text-black font-semibold rounded-full"
                          onClick={() => navigate("/features")}
                        >
                          Learn more
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-[11px] text-gray-500"
                          onClick={() => navigate("/features")}
                        >
                          Open demo →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AnalyticsSection */}
        <AnalyticsSection />
      </div>

      <div id="contact">
        {/* CTA Section*/}
        <CTASection />
        {/* Footer */}
        <Footer />
      </div>

      <style >{`
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
  );
};

export default SwaadsetuLanding;
