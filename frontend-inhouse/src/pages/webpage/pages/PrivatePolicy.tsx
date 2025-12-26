import { useEffect } from "react";
import { Footer } from "../component/Footer";
import Navbar from "../component/Navbar";
import BackButton from "../component/ui/BackButton";
import PrivacyPolicy from "../component/legal/PrivacyPolicy";
import ComplianceSecurity from "../component/legal/CompliancePolicy";
import TermsConditions from "../component/legal/TermsConditions";
import CancellationRefund from "../component/legal/CancellationRefund";
import LegalSidebar from "../component/legal/LegalSidebar";
import PrivacyHeader from "../component/legal/Header";

const PrivatePolicy = () => {
  /* 🔥 GUARANTEED SCROLL TO TOP */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#333333] scroll-smooth">
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <Navbar />
        <div className="px-6  py-2">
          <BackButton />
        </div>
      </header>

      {/* Header */}
      <PrivacyHeader />

      {/* Wrapper */}
      <div className="wrapper mx-auto -mt-10 mb-16 flex max-w-6xl gap-8 px-5 lg:-mt-16 lg:gap-10">
        {/* Sidebar */}
        <LegalSidebar />

        {/* Content area */}
        <main className="flex-1 space-y-10">
          {/* Policy block helper */}
          {/* Privacy */}

          <PrivacyPolicy />
          {/* Compliance */}
          <ComplianceSecurity />

          {/* Terms */}
          <TermsConditions />

          {/*CancellationRefund */}
          <CancellationRefund />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivatePolicy;
