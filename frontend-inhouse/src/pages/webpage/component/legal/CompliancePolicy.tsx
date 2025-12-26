// components/legal/ComplianceSecurity.tsx
import React from "react";

const ComplianceSecurity: React.FC = () => {
  return (
    <section
      id="compliance"
      className="rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
    >
      <span className="mb-4 inline-block rounded bg-[#FFBE00] px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-[#0F0F0F]">
        Security Protocol
      </span>
      <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
        Compliance &amp; Security – Swaad Setu
      </h2>

      {/* 1. Overview */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        1. Overview
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        Swaad Setu is designed as a reliable, secure QR-based restaurant
        ordering and management platform. This section explains our approach to
        security, compliance, and data protection.
      </p>

      {/* 2. Infrastructure & Hosting */}
      <h3 className="mt-4 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        2. Infrastructure &amp; Hosting
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Hosted on secure cloud infrastructure with industry-standard physical
          and network security.
        </li>
        <li>
          Firewalls, access controls, and network segmentation help protect
          against unauthorized access.
        </li>
        <li>
          Regular backups are maintained to aid disaster recovery and business
          continuity.
        </li>
      </ul>

      {/* 3. Application Security */}
      <h3 className="mt-4 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        3. Application Security
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>All dashboard and critical routes are served over HTTPS/TLS.</li>
        <li>Role-based access control for restaurant staff accounts.</li>
        <li>
          Session management and timeouts help reduce the risk of unauthorized
          use.
        </li>
        <li>
          Regular updates to frameworks and dependencies to address
          vulnerabilities.
        </li>
      </ul>

      {/* 4. Data Protection & Privacy */}
      <h3 className="mt-4 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        4. Data Protection &amp; Privacy
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Personal data is processed in accordance with our Privacy Policy and
          applicable Indian IT laws, including reasonable security practices.
        </li>
        <li>
          Only limited staff have access to production systems and data, strictly
          on a need-to-know basis.
        </li>
        <li>
          Access and actions may be logged for audit and security purposes.
        </li>
      </ul>

      {/* 5. Payment & PCI */}
      <h3 className="mt-4 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        5. Payment &amp; PCI Compliance
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Swaad Setu integrates with third-party payment gateways (for example,
          UPI and card processors) that are PCI-DSS compliant.
        </li>
        <li>
          Card and sensitive payment data are handled by these gateways; Swaad
          Setu does not store full card or UPI credentials.
        </li>
      </ul>

      {/* 6. Restaurant responsibilities */}
      <h3 className="mt-4 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        6. Restaurant Regulatory Responsibilities
      </h3>
      <p className="mb-3 text-sm text-[#555555] text-justify">
        Restaurants remain solely responsible for compliance with FSSAI, GST,
        local municipal rules, and any licenses required for operating a food
        business.
      </p>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        Swaad Setu provides tools for menu display, ordering, and invoicing but
        does not operate as a food business operator.
      </p>

      {/* 7. Logging & Monitoring */}
      <h3 className="mt-4 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        7. Logging &amp; Monitoring
      </h3>
      <p className="mb-2 text-sm text-[#555555] text-justify">
        System and access logs may be collected for troubleshooting, security
        investigations, and performance monitoring.
      </p>
      <p className="text-sm text-[#555555] text-justify">
        Logs are retained for a limited period and then deleted or anonymized.
      </p>
    </section>
  );
};

export default ComplianceSecurity;
