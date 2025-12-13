import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, User, ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type ButtonBoxProps = {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
};

export default function LandingModern() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleNavigation = (path: string) => navigate(path);

  const motionProps = shouldReduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  const ButtonBox = ({ label, onClick, icon }: ButtonBoxProps) => (
    <motion.button
      {...motionProps}
      whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={onClick}
      className="relative w-[8.5rem] sm:w-56 md:w-64 lg:w-72 h-40 sm:h-48 md:h-52 lg:h-56 bg-white/95 backdrop-blur-sm border border-emerald-100 flex flex-col items-center justify-center gap-3 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 cursor-pointer"
      aria-label={label}
    >
      <div className="flex items-center justify-center text-4xl sm:text-5xl text-emerald-600">
        {icon}
      </div>
      <div className="text-sm sm:text-base md:text-lg font-semibold text-emerald-700">
        {label}
      </div>
      <div className="absolute inset-0 rounded-2xl bg-emerald-50 opacity-0 hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
    </motion.button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4">
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center gap-10">
        {/* Header */}
        <header className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-700 tracking-tight">
            Swad Setu
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Quick access panel for Admin, Staff, and Orders — designed for
            in-house restaurant tablets.
          </p>
        </header>

        {/* 3 horizontal cards — responsive */}
        <section className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 flex-wrap md:flex-nowrap">
          <ButtonBox
            label="Admin Access"
            onClick={() => handleNavigation("/admin-login")}
            icon={<User className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />}
          />

          <ButtonBox
            label="Staff Access"
            onClick={() => handleNavigation("/staff-login")}
            icon={<Users className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />}
          />

          <ButtonBox
            label="Place Order"
            onClick={() => handleNavigation("/table-select")}
            icon={
              <ShoppingCart className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
            }
          />
        </section>

        {/* Info bar */}
        <section className="  text-center border border-emerald-50 ">
          <p className="text-xs sm:text-sm text-gray-600">
            Your restaurant, perfectly connected.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} Swad Setu • Zager Digital Services
        </footer>
      </main>
    </div>
  );
}
