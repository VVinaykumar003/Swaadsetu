import { useEffect, useRef, useState } from "react";
import Navbar from "../component/Navbar";
import BackButton from "../component/ui/BackButton";
import { Footer } from "../component/Footer";
import AdminImage_1 from "../assets/Admin_Image_1.jpeg"
import AdminImage_2 from "../assets/Admin_Image_2.jpeg"
import AdminImage_3 from "../assets/Admin_Image_3.jpeg"
import StaffImage_1 from "../assets/Staff_Image_1.png"
import StaffImage_2 from "../assets/Staff_Image_2.png"
import TableImage from "../assets/TableImage.png"
// import Staff_Image_3 from "../assets/Staff_Image_3.png"



type Tab = {
  id: string;
  label: string;
  images: string[];
  detailLeft: { title: string; lines: string[] };
  detailRight: { title: string; lines: string[] }; // same length as detailLeft.lines
};

const TABS: Tab[] = [
  {
    id: "tab-1",
    label: "Admin",
    images: [
        AdminImage_1,
        AdminImage_2,
        AdminImage_3,
     
    ],
    detailLeft: {
      title: "Admin Control",
      lines: ["Table Management", "Menu Management", "Staff Management","Security Control (PIN Management)","Taxes & Discount Configuration","AI-Based Analytics","Combo & Daily Offers","Complete Order History","Dynamic Pricing Control"],
    },
    detailRight: {
      title: "Admin Insights",
      lines: [
        "	Design and customize your restaurant’s table layout digitally. Assign orders to specific tables and monitor table status (Occupied, Free, or Billed) in real-time.",

        "	Instantly update menu items, descriptions, and categories. Use the digital interface to toggle item availability (In-stock/Out-of-stock) to prevent customer disappointment.",

        "Create and manage staff user accounts with specific roles (Admin, Captain, Chef). Monitor staff activity logs and performance to ensure operational accountability.",

        "Maintain high security with the ability to change Admin and Staff access PINs at any time, ensuring sensitive business data remains protected.",

        "Flexibility to change GST/Tax percentages and apply flat or percentage-based discounts across the menu or for specific orders..",

        "Harness the power of AI to predict peak hours, identify buying patterns, and get automated recommendations on menu optimization for higher profitability.",

       `Easily create "Combo Offers" to increase average order value and set "Daily Offers" (e.g., Happy Hours or Weekend Specials) to drive traffic during slow periods.`,

        "Access a searchable archive of all past orders. Analyze historical data to understand long-term trends and handle any billing queries with transparency.",

        "Update pricing instantly across the platform to reflect seasonal changes or special promotional events."

      ],
    },
  },

  {
    id: "tab-2",
    label: "Staff",
    images: [
       StaffImage_1,
      TableImage,
      StaffImage_2,
    ],
    detailLeft: {
      title: "Staff Workflow",
      lines: ["Accept or Reject Orders", "Real-Time Status Tracking", "	Integrated Kitchen Screen" ,"Assign Waiter/Captain","Live Table Clearing","Dine-In vs. Takeout Tabs" , `Add Items or "Fine" Charges`, "	Edit & Finalize Bills","On-the-Fly Discounts"],
    },
    detailRight: {
      title: "Staff Performance",
      lines: [
        "Staff can instantly review incoming QR orders and accept them to start preparation or reject them with a reason.",
        "Change order status (e.g., Preparing, Ready, Served) in real-time, instantly notifying the customer and the admin dashboard.",
        "A dedicated kitchen view that organizes orders by time and priority, ensuring the chef always knows what to cook next.",
        "Assign specific staff names to handle individual tables for better accountability and personalized service.",
        "Update table availability with a single tap once a guest departs, allowing for faster seating of the next party.",
       ` Separate, organized tabs for "Dine-In" and "Takeaway" to help staff prioritize packaging versus table service.`,
       "Easily add more items to an ongoing table session or include specific service/fine charges as per restaurant policy.",
       "Modify order quantities or remove items before the final print to ensure 100% billing accuracy.",
       "Apply approved discounts directly from the staff portal to resolve customer issues or honor special promotions."
      ],
    },
  },


  {
    id: "tab-3",
    label: "User",
    images: [
      "https://picsum.photos/id/1050/1200/800",
      "https://picsum.photos/id/1060/1200/800",
      "https://picsum.photos/id/1062/1200/800",
    ],
    detailLeft: {
      title: "User Experience",
      lines: ["Scan & Explore", "Table-Mapped Orders", "Add Multiple Orders","Real-Time Order Tracking" ,`	"Call a Waiter" Button: ` ,"Special Instructions","Integrated Payments","Instant Bill Download"],
    },
    detailRight: {
      title: "User Retention",
      lines: [
        "Customers simply scan the table-specific QR code to launch the full, high-resolution digital menu directly on their mobile browser.",

        "Because each QR is unique to a table, orders are automatically mapped to the correct location without manual input.",

        `Diners can keep their session active and add "rounds" of multiple orders (starters first, main course later) to the same running bill.`,

        `: Once an order is placed, customers can see the live status (e.g., "Accepted," "In Preparation," or "Out for Delivery/Served") directly on their phone screen.`,

        `A dedicated button allows guests to request physical assistance at their table with a single tap, notifying the Staff Portal instantly.`,

        `	Special Instructions: Add specific notes for the chef (e.g., "Extra spicy" or "No onions") during the checkout process.`,

        " Customers can pay via UPI, cards, or wallets using integrated, PCI-DSS compliant gateways.",

        "After a successful payment, the final invoice is generated and can be downloaded instantly to the phone as a PDF for the customer's records."


      ],
    },
  },
];

const AUTO_PLAY_INTERVAL_MS = 3000;

export default function TabbedCarouselLayout(): JSX.Element {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState<boolean>(false);
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<number>(0); // 🔑 which bullet is active

  const autoplayRef = useRef<number | null>(null);

  const activeTab = TABS[activeTabIndex];
  const images = activeTab.images;
  const imageCount = images.length;

   /* 🔥 GUARANTEED SCROLL TO TOP */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);


  // Reset image + selected bullet on tab change
  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedBulletIndex(0); // reset to first point when changing tab
  }, [activeTabIndex]);

  // Auto-advance carousel
  useEffect(() => {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    if (!isHoveringCarousel && imageCount > 0) {
      autoplayRef.current = window.setInterval(() => {
        setCurrentImageIndex((i) => (i + 1) % imageCount);
      }, AUTO_PLAY_INTERVAL_MS);
    }

    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [isHoveringCarousel, imageCount]);

  function goPrev() {
    setCurrentImageIndex((i) => (i - 1 + imageCount) % imageCount);
  }

  function goNext() {
    setCurrentImageIndex((i) => (i + 1) % imageCount);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <Navbar />
        <div className="px-0 -mx-6 py-2">
          <BackButton />
        </div>
      </header>

      {/* Main content */}
      <main className="pt-28 pb-10 px-6 relative bg-white mt-5">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute -top-16 -left-16 w-96 opacity-30"
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(300,300)">
              <path
                d="M120,-170C160,-120,170,-60,170,10C170,80,160,160,110,200C60,240,-20,240,-90,210C-160,180,-210,120,-230,50C-250,-20,-240,-100,-200,-150C-160,-200,-80,-220,-10,-210C60,-200,80,-220,120,-170Z"
                fill="#FDE68A"
              />
            </g>
          </svg>
          <svg
            className="absolute -bottom-32 -right-16 w-96 opacity-10"
            viewBox="0 0 600 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(300,300)">
              <path
                d="M120,-170C160,-120,170,-60,170,10C170,80,160,160,110,200C60,240,-20,240,-90,210C-160,180,-210,120,-230,50C-250,-20,-240,-100,-200,-150C-160,-200,-80,-220,-10,-210C60,-200,80,-220,120,-170Z"
                fill="#ffffff"
              />
            </g>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* header + tab buttons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
            <div> 
              <h2 className="text-3xl sm:text-4xl font-semibold text-black ">
                <span className="block">Explore Features</span>
                <span className="block ">
                  Switch roles to preview their workspace
                </span>
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl text-sm sm:text-base">
                Click the bullets under each role to see how the right-hand insights change based on what matters most.
              </p>
            </div>

            {/* Tab buttons */}
            <div className="flex gap-3 md:justify-end">
              {TABS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTabIndex(idx)}
                  className={`rounded-full px-4 py-1 text-sm font-medium transition transform ${
                    idx === activeTabIndex
                      ? "bg-yellow-400 text-black shadow-lg scale-105"
                      : "bg-black/10 text-black hover:bg-gray-300"
                  }`}
                  aria-pressed={idx === activeTabIndex}
                  title={t.label}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1) Carousel box */}
            <div className="col-span-1">
              <div
                className="relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl"
                onMouseEnter={() => setIsHoveringCarousel(true)}
                onMouseLeave={() => setIsHoveringCarousel(false)}
              >
                <div className="w-full h-72 sm:h-96 md:h-[28rem] lg:h-[24rem]">
                  <img
                    key={images[currentImageIndex]}
                    src={images[currentImageIndex]}
                    alt={`${activeTab.label} ${currentImageIndex + 1}`}
                    className="w-full h-full object-fill transition-opacity duration-700"
                    style={{ opacity: 1 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Prev/Next */}
                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                  <button
                    onClick={goPrev}
                    className="pointer-events-auto bg-black/60 border border-white/10 text-white p-2 rounded-full hover:bg-black/80 transition"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    onClick={goNext}
                    className="pointer-events-auto bg-black/60 border border-white/10 text-white p-2 rounded-full hover:bg-black/80 transition"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>

                {/* indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-transform ${
                        i === currentImageIndex
                          ? "scale-125 bg-yellow-400"
                          : "bg-white/50"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>

                {/* badge */}
                <div className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold text-sm shadow">
                  {activeTab.label} view
                </div>
              </div>

              {/* quick metrics */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Avg. Order Value
                  </div>
                  <div className="text-lg font-bold text-yellow-500">₹420</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Daily Orders
                  </div>
                  <div className="text-lg font-bold text-yellow-500">420</div>
                </div>
              </div>
            </div>

            {/* 2) Left details — clickable bullets */}
            <div className="col-span-1">
              <div className="rounded-2xl bg-white text-black p-6 shadow-2xl border border-black/10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {activeTab.detailLeft.title}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700">
                    {activeTab.detailLeft.lines.map((line, idx) => {
                      const isActive = idx === selectedBulletIndex;
                      return (
                        <li
                          key={idx}
                          className={`flex items-start gap-3 leading-relaxed cursor-pointer rounded-lg px-2 py-1 transition ${
                            isActive
                              ? "bg-yellow-50 text-black"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedBulletIndex(idx)} // 🔥 update selected bullet
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full mt-2 ${
                              isActive ? "bg-yellow-500" : "bg-gray-400"
                            }`}
                          />
                          <div className="lg:tooltip" data-tip="click me">

                          <span className={isActive ? "font-semibold" : ""}>
                            {line}
                          </span>
                          </div>

                        </li>
                      );
                    })}
                  </ul>
                </div>
{/* 
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 bg-black text-white py-2 rounded-xl font-semibold hover:opacity-90 transition">
                    Explore This View
                  </button>
                </div> */}
              </div>
            </div>

            {/* 3) Right details — description based on selected bullet */}
            <div className="col-span-1">
              <div className="rounded-2xl bg-white text-black p-6 shadow-2xl border border-black/10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {activeTab.detailRight.title}
                  </h3>

                  {/* show the selected bullet title */}
                  <div className="text-sm font-semibold text-yellow-600 mb-2">
                    {activeTab.detailLeft.lines[selectedBulletIndex]}
                  </div>

                  {/* description mapped by index */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {activeTab.detailRight.lines[selectedBulletIndex]}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Quick stats
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg bg-black/5 p-3 text-sm">
                      <div className="text-xs text-gray-500">Conversion</div>
                      <div className="font-semibold text-yellow-500">4.2%</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-black/5 p-3 text-sm">
                      <div className="text-xs text-gray-500">Satisfaction</div>
                      <div className="font-semibold text-yellow-500">98%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
