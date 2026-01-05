import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Images } from "../assets/assets";


// const shapeVariants = {
//   initial: { scale: 0, opacity: 0 },
//   animate: { scale: 1, opacity: 1, rotate: 360 },
// };

// const transitionSettings = {
//   duration: 2,
//   repeat: Infinity,
//   ease: "easeInOut",
//   repeatDelay: 1,
// };



// simple counter
const Counter = ({ target, label }: { target: number; label: string }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId: number;
    const duration = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <div className="flex flex-col items-center md:items-center ">
      <span className="text-3xl md:text-3xl lg:text-3xl font-extrabold leading-none lg:text-white md:text-gray-200">
        {value}+
      </span>
      <span className="mt-1 text-[10px] md:text-xs lg:text-neutral-200 sm:text-gray-600 text-center md:text-left md:text-gray-100">
        {label}
      </span>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
   <section className="relative sm:min-h-[70vh] md:min-h-auto  overflow-hidden c-space flex flex-col items-stretch justify-start  md:mt-0.5">

      {/* Desktop banner (md+) */}
      <div className="hidden md:block w-full h-full md:mt-3">
        <img
          src={Images.pcImage}
          alt="Hero banner"
          className="w-full h-full max-h-screen object-cover object-center"
        />
      </div>


     {/* Mobile banner */}
      <div className="w-full block md:hidden">
        <img
          src={Images.mobileImage}
          alt="Mobile hero banner"
          className="w-full h-auto max-h-[80vh] object-cover mx-auto mt-9 sm:mt-15"
          style={{ objectPosition: "center" }}
        />
      </div>


      {/* DESKTOP overlay: buttons + counters on top of image */}
      <div className="absolute  inset-0 hidden md:flex items-end justify-start pointer-events-none    md:w-full">
      <div className="w-auto px-6 lg:pb-26 lg:ml-20 md:ml-4 md:pb-15 pl-28.5 pointer-events-auto max-w-full  ">
          <div className="flex flex-col gap-4 items-end  md:-ml-27   sm:gap-2 md:items-center md:-mb-10">
            {/* buttons */}
            <div className="flex flex-row gap-4 items-end border-green-300 ">
              <motion.button
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 50, delay: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="btn md:btn-sm lg:btn-lg bg-amber-300 text-black font-medium px-6 py-3 rounded shadow"
              >
                Try for Free
              </motion.button>

              <motion.button
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 50, delay: 0.7 }}
                whileTap={{ scale: 0.95 }}
                className="btn border md:btn-sm lg:btn-lg border-amber-300 text-amber-500 bg-transparent px-6 py-3 rounded"
              >
                See How It Works
              </motion.button>
            </div>

            {/* counters */} 
            <div className="flex gap-10 justify-start lg:text-black md:text-black mt-5 ">
              <Counter target={58} label="Restaurants Using SwaadSetu" />
              <Counter target={100} label="Daily Orders Processed" />
              <Counter target={100} label="Happy Diners Served" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CTA + counters: separate section BELOW image */}
      <div className="md:hidden w-full bg-[#f6eab5] px-6 pt-4 pb-8 flex flex-col items-center gap-4 sm:flex-row">
        {/* smaller buttons, not overlapping character */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <motion.button
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70, delay: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-amber-300 text-black font-semibold px-4 py-2 rounded shadow text-sm"
          >
            Try for Free
          </motion.button>

          <motion.button
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70, delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
            className="border border-amber-300 text-amber-600 bg-transparent px-4 py-2 rounded text-sm"
          >
            See How It Works
          </motion.button>
        </div>

        {/* counters band */}
        <div className="mt-2 flex justify-center gap-6 text-black">
             <Counter target={58} label="Restaurants Using SwaadSetu" />
              <Counter target={100} label="Daily Orders Processed" />
              <Counter target={100} label="Happy Diners Served" />
        </div>
      </div>

      {/* Animated shapes (unchanged) */}
      {/* {shapes.map(({ type, top, left, size, delay }, index) => (
        <motion.div
          key={index}
          initial="initial"
          animate="animate"
          variants={shapeVariants}
          transition={{ ...transitionSettings, delay }}
          style={{
            position: "absolute",
            top,
            left,
            width: size,
            height: size,
            borderRadius: type === "circle" ? "50%" : "0%",
            background: "linear-gradient(90deg, #ffb347, #ffcc33)",
            zIndex: 8,
            opacity: 0.75,
            pointerEvents: "none",
          }}
          className="hidden sm:block"
          aria-hidden="true"
        />
      ))} */}
    </section>
    //changes done by 
  );
};

export default Hero;
