import {
  QrCode,
  Clock,
  FileText,
  Bell,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Bill from "../assets/Bill.jpeg";
import placeOrder from "../assets/placeorder.jpeg";
import orderStatus from "../assets/orderStatus.jpeg";
import custDetails from "../assets/custmDetails.jpeg";
import userFront from "../assets/userFrot.jpeg";
import bg from "../assets/customerHeading.png";
import ScrollableMobileMockup from "../component/ScrollableMobileMockup";

const features = [
  {
    icon: QrCode,
    title: "QR Code Ordering",
    description:
      "Customers scan and order instantly. No app downloads, no waiting for staff. Pure convenience.",
    color: "#FFBE00",
  },
  {
    icon: Clock,
    title: "Live Order Tracking",
    description:
      "Real-time order status updates from kitchen to table. Complete transparency for customers.",
    color: "#22C55E",
  },
  {
    icon: FileText,
    title: "Digital Bill Management",
    description:
      "Generate and share bills instantly. Support for split payments and custom discounts.",
    color: "#3B82F6",
  },
  {
    icon: Bell,
    title: "Instant Waiter Call",
    description:
      "Direct notification system for customer service. No more waiting or looking around.",
    color: "#F59E0B",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Integrated UPI, cards, wallets. PCI-DSS compliant with instant payment reconciliation.",
    color: "#8B5CF6",
  },
];

const galleryImages = [userFront, placeOrder, Bill, orderStatus, custDetails];

export function CustomerSection() {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const hero = galleryImages[heroIndex];

  return (
    <section className="section bg-[#111111] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="space-y-6">
          <div>
            <img src={bg} className="h-auto w-60" alt="Customers heading" />
          </div>

          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            {/* LEFT: content */}
            <div className="flex-1 text-left">
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Features That Delight Your Customers
              </h2>

              <p className="mt-3 text-base leading-relaxed text-[#EDEDED] sm:text-lg">
                Every feature is designed to create a seamless, modern dining
                experience that keeps customers coming back.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/demo")}
                  className="inline-flex items-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black shadow transition hover:bg-amber-600"
                >
                  Request Live Demo
                </button>
                <button
                  onClick={() => navigate("/features")}
                  className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  Explore All Features
                </button>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-1">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 rounded-xl bg-[#181818] p-4 transition-colors hover:bg-[#222222]"
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                      style={{ background: feature.color }}
                    >
                      <feature.icon size={22} className="text-black" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-white sm:text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-[#EDEDED] sm:text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: hero + thumbs */}
            {/* RIGHT: hero + thumbs */}
            <div className="flex-1 lg:flex lg:items-center lg:justify-end lg:gap-6">
              {/* BIG PHONE MOCKUP USING COMPONENT */}
              <ScrollableMobileMockup hero={hero} />

              {/* THUMBS */}
              <div className="mt-4 w-full lg:mt-0 lg:w-auto">
                {/* mobile row */}
                <div className="flex items-center justify-center gap-2 lg:hidden">
                  {galleryImages.map((src, i) =>
                    i === heroIndex ? null : (
                      <div
                        key={i}
                        className="tooltip"
                        data-tip="Click me"
                      >
                        <button
                          type="button"
                          onClick={() => setHeroIndex(i)}
                          className="group relative h-16 w-16 overflow-hidden rounded-xl border border-black/40 bg-black/60 shadow-md outline-none"
                        >
                          <img
                            src={src}
                            alt={`Customer view ${i + 1}`}
                            className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>

                {/* desktop column */}
                <div className="mt-4 hidden flex-col gap-3 lg:flex">
                  {galleryImages.map((src, i) =>
                    i === heroIndex ? null : (
                      <div
                        key={i}
                        className="tooltip"
                        data-tip="Click me"
                      >
                        <button
                          type="button"
                          onClick={() => setHeroIndex(i)}
                          className="group relative h-28 w-40 overflow-hidden rounded-2xl border border-black/40 bg-black/60 shadow-lg outline-none sm:h-32 sm:w-48"
                        >
                          <img
                            src={src}
                            alt={`Customer view ${i + 1}`}
                            className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
