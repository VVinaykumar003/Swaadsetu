import { useEffect, useState } from "react";
import Logo from "../assets/logo3.png";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    <nav className="fixed top-0 inset-x-0 bg-black/95 backdrop-blur border-b border-zinc-800 shadow-lg z-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* top row */}
        <div className="flex items-center justify-between py-3">
          {/* logo */}
          <img
            src={Logo}
            alt="Swaadsetu Logo"
            onClick={() => navigate("/web")}
            className="h-8 sm:h-10 w-auto object-contain cursor-pointer lg:-ml-9 -ml-4"
          />

          {/* desktop links */}
          <ul className="hidden md:flex items-center gap-6 text-sm font-medium font-sans">
            {["home", "about", "features", "contact"].map((section) => (
              <li key={section}>
                <button
                  onClick={() => scrollToSection(section)}
                  className={`transition-colors duration-200 px-2 py-1 rounded ${
                    activeSection === section
                      ? "text-yellow-400"
                      : "text-white hover:text-yellow-300"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => navigate("/login")}
                className="bg-yellow-500 text-black px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80"
              >
                Go to app
              </button>
            </li>
          </ul>

          {/* mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80"
            >
              Go to app
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-white hover:text-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* mobile dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden pb-3"
            >
              <ul className="bg-black/95 border border-yellow-500/40 rounded-lg shadow-lg py-2 flex flex-col font-sans">
                {["home", "about", "features", "contact"].map((section) => (
                  <li key={section} className="w-full">
                    <button
                      onClick={() => {
                        scrollToSection(section);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium ${
                        activeSection === section
                          ? "text-yellow-400"
                          : "text-white hover:text-yellow-300"
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  </li>
                ))}
                <li className="mt-1 border-t border-zinc-800 pt-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/login");
                    }}
                    className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-600 transition-colors duration-200"
                  >
                    Go to app
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
