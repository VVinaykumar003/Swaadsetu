import React from "react";
import bg from "../assets/logo3.png"
const BlissBayLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-[Outfit] overflow-x-hidden bg-[radial-gradient(circle_at_50%_-20%,#1a1a1a,transparent)]">
      {/* Top Bar */}
      <nav className="top-nav px-[5%] py-8 flex items-center justify-between text-[0.7rem] tracking-[0.2em] uppercase text-[#888888]">
        <div className="flex items-center gap-2">
          <img src={bg} className="w-40 h-10 left-1.5 "/>
        </div>

         <div className="flex items-center gap-2">
          <span className="h-[6px] w-[6px] rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
          <span>Live System</span>
        </div>
       
      </nav>

      {/* Hero */}
      <main className="hero flex-1 flex flex-col items-center justify-center px-5 py-10">
        <h1
          className="
            restaurant-name
            text-center mb-2 leading-[0.9]
            font-[Syncopate] 
            text-[clamp(2.5rem,8vw,5rem)]
            bg-[linear-gradient(180deg,#ffffff_0%,#444444_100%)]
            bg-clip-text text-transparent
          "
        >
          BLISS BAY
        </h1>

        <div className="tagline text-[#FFD700] tracking-[0.5em] font-light text-[0.8rem] mb-14 uppercase">
          MODERN BISTRO
        </div>

        {/* Modern Grid */}
        <div
          className="
            action-container
            w-full max-w-[1100px]
            grid gap-5 px-5
           
            lg:grid-[4fr,1fr,1fr]
          "
        >
          {/* Main CTA */}
          <a
            href="#"
            className="
              main-cta
              bg-white text-[#0a0a0a]
              p-10 md:p-14
              rounded-[30px]
              flex flex-col justify-between
              no-underline
              relative overflow-hidden
              transition-transform duration-400
              [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)]
              hover:scale-[1.02]
            "
          >
            <div>
              <h2 className="m-0 text-[2rem] font-semibold">Start Order</h2>
              <p className="mt-3 text-[1rem] opacity-70">
                Browse our curated seasonal menu
              </p>
            </div>
            <div className="text-right text-[1rem] mt-8">
              clikc me →
            </div>
          </a>

          {/* Secondary group */}
          <div className="secondary-group flex flex-col gap-5">
            <a
              href="#"
              className="
                access-card
                flex items-center justify-between
                bg-[rgba(255,255,255,0.03)]
                border border-[rgba(255,255,255,0.05)]
                px-7 py-6
                rounded-[25px]
                no-underline text-white
                transition-colors duration-300
                hover:bg-[rgba(255,255,255,0.08)]
                hover:border-[#FFD700]
              "
            >
              <div>
                <div className="text-[0.7rem] text-[#FFD700] mb-1">
                  INTERNAL
                </div>
                <div className="font-semibold">Staff Portal</div>
              </div>
              <span>↗</span>
            </a>

            <a
              href="#"
              className="
                access-card
                flex items-center justify-between
                bg-[rgba(255,255,255,0.03)]
                border border-[rgba(255,255,255,0.05)]
                px-7 py-6
                rounded-[25px]
                no-underline text-white
                transition-colors duration-300
                hover:bg-[rgba(255,255,255,0.08)]
                hover:border-[#FFD700]
              "
            >
              <div>
                <div className="text-[0.7rem] text-[#FFD700] mb-1">
                  MANAGEMENT
                </div>
                <div className="font-semibold">Admin Dashboard</div>
              </div>
              <span>↗</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-[rgba(255,255,255,0.05)] py-10 text-center">
        <div className="powered-by text-[0.75rem] text-[#888888] tracking-[0.06em]">
          OPERATED BY{" "}
          <a
            href="#"
            className="ss-brand text-white font-bold no-underline border-b border-[#FFD700]"
          >
            SWAAD SETU
          </a>{" "}
          &copy; 2025
        </div>
      </footer>
    </div>
  );
};

export default BlissBayLanding;
