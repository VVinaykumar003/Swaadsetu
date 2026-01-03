import { motion, useReducedMotion } from "framer-motion";
import { ShoppingCart, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import bg from "../assets/logo3.png"
import { useNavigate, useParams ,Link } from "react-router-dom";
import Logo from '../pages/webpage/assets/Final_Logo_White.png'
// import { getRestaurantByRid } from "../api/restaurant.api";
// import { useTenant } from "../context/TenantContext";

type ButtonBoxProps = {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
};

export default function LandingModern() {
  const navigate = useNavigate();
  const { rid: ridFromUrl } = useParams();
  // const { setRid } = useTenant();

  const rid = ridFromUrl!;
  const [restaurantName, setRestaurantName] = useState(rid);

  // useEffect(() => {
  //   setRid(rid); // ensure tenant context stays aligned
  // }, [rid, setRid]);

  // useEffect(() => {
  //   getRestaurantByRid(rid)
  //     .then((data) => {
  //       setRestaurantName(data.restaurantName);
  //     })
  //     .catch((error) => {
  //       console.error("Failed to fetch restaurant name:", error);
  //     });
  // }, [rid]);

  const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  const ButtonBox = ({ label, onClick, icon ,text}: ButtonBoxProps) => (
   <motion.button
  {...motionProps}
  whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
  transition={{ type: "spring", stiffness: 260, damping: 20 }}
  onClick={onClick}
  className="
    relative
    w-full max-w-xs
    sm:max-w-sm md:max-w-md lg:max-w-lg
    h-28
    sm:h-36 md:h-40 lg:h-44
    bg-linear-to-br from-yellow-200 via-yellow-400 to-yellow-600
    border border-yellow-300/50
    flex flex-col items-center justify-center gap-2
    rounded-2xl
    shadow-[0_0_15px_rgba(234,179,8,0.4)]
    hover:shadow-[0_0_25px_rgba(234,179,8,0.6)]
    transition-all duration-200
    cursor-pointer overflow-hidden group
  "
>
  {/* glossy overlay */}
  <div className="absolute inset-0 bg-linear-to-br from-white/40 via-transparent to-transparent opacity-80 px-1" />

  {/* icon */}
  <div
    className="
      relative z-10
      text-3xl
      sm:text-4xl md:text-5xl
      drop-shadow-sm
      text-black
    "
  >
    {icon}
  </div>

  {/* label */}
  <div
    className="
      relative z-10
      font-bold text-black drop-shadow-sm
      px-3 py-1 rounded-2xl
      text-xs
      [text-clamp(0.7rem,2.8vw,0.95rem)]
      sm:text-sm md:text-base lg:text-lg
      text-center
    "
  >
    {label}
  </div>

  {/* description – only on md+ so mobile stays compact */}
 <p
  className="
    hidden sm:block
    relative z-10
    text-xs sm:text-sm md:text-base lg:text-lg
    font-medium
    text-black/90
    px-4 pt-2 pb-3
    text-center
    leading-relaxed
   

    rounded-xl
    mt-1 sm:mt-2
    shadow-[0_4px_12px_rgba(0,0,0,0.12)]
  "
>
  {text}
</p>

</motion.button>

  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-[Outfit] overflow-x-hidden bg-[radial-gradient(circle_at_50%_-20%,#1a1a1a,transparent)]">
{/* 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-black p-4" */}
          <nav className="top-nav px-[5%] py-2 flex items-center justify-between text-[0.7rem] tracking-[0.2em] uppercase text-[#888888]">
        <div className="lg:-ml-16 -ml-4 md:-ml-10">
          <img src={bg} className="lg:w-60 lg:h-13 left-0  w-37 h-10"/>
        </div>

         <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
          <span>Live System</span>
        </div>
       
      </nav>
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center gap-10 mt-3">
        <header className="text-center px-2">
          <h1    className="
            restaurant-name
            text-center mb-2 leading-[0.9]
            font-[Syncopate] 
            lg:text-[clamp(2.5rem,5vw,5rem)]
            bg-[linear-gradient(180deg,#ffffff_0%,#444444_100%)]
            bg-clip-text text-transparent
            text-[clamp(2rem,2vw,5rem)]
          ">
            {restaurantName || " Vrindavan Restaurant "} 
          </h1>
          <p className="text-xs sm:text-sm text-yellow-400 mt-2">
            Quick access for Admin, Staff, and Orders
          </p>
        </header>

        <section className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 flex-wrap md:flex-nowrap">
          <ButtonBox
            label="Admin Access"
            onClick={() => navigate(`/t/${rid}/admin-login`)}
            icon={<User className="w-9 h-9" />}
            text={"Dashboard and Analytics"}
          />

          <ButtonBox
            label="Staff Access"
            onClick={() => navigate(`/t/${rid}/staff-login`)}
            icon={<Users className="w-9 h-9" />}
             text={"Manage tables and service"}
          />

          <ButtonBox
            label="Place Order"
            onClick={() =>
              (window.location.href = `${
                import.meta.env.VITE_USER_LINK
              }t/${rid}`)
            }
            icon={<ShoppingCart className="w-9 h-9" />}
             text={"View menu and order now "}
          />
        </section>

         <footer className="w-full border-t border-[#333333] mt-10">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          {/* Top links row */}
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div
              className="
                grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5
                gap-x-6 gap-y-3
                place-items-center w-full
              "
            >
              <Link
                to="/web"
                className="text-sm text-[#888888] hover:text-[#FFBE00] transition-colors"
              >
                Home
              </Link>
              <Link
                to="#"
                className="text-sm text-[#888888] hover:text-[#FFBE00] transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/termsandcondition"
                className="text-sm text-[#888888] hover:text-[#FFBE00] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/termsandcondition"
                className="text-sm text-[#888888] hover:text-[#FFBE00] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/termsandcondition"
                className="text-sm text-[#888888] hover:text-[#FFBE00] transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Logo + copyright */}
          <div className="border-t border-[#333333] pt-8 mt-8 flex flex-col items-center gap-3">
            <button onClick={() => navigate("/web")}>
              <img src={Logo} className="w-44 h-11" />
            </button>

            <div className="hidden md:flex flex-col items-center">
              <button onClick={() => navigate("/web")}>
                <p className="text-sm text-[#888888]">
                  Swaad Setu – A Product By
                </p>
                <p className="text-sm ml-1.5">
                  © {new Date().getFullYear()} Zager Digital Services Pvt. Ltd.
                </p>
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => navigate("/web")}>
                <p className="text-sm text-[#888888]">
                  Swaad Setu – A Product By
                </p>
                <p className="text-sm ml-1.5">
                  © 2025 Zager Digital Services Pvt. Ltd.
                </p>
              </button>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}