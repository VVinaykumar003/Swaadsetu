// components/legal/PrivacyPolicy.tsx
import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <section
      id="privacy"
      className="relative rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
    >
      <span className="mb-4 inline-block rounded bg-[#FFBE00] px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-[#0F0F0F]">
        Effective Date: Dec 2025
      </span>
      <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
        Privacy Policy – Swaad Setu
      </h2>
      <p className="mb-6 text-sm font-semibold text-[#555555]">
        Last Updated: December 22, 2025
      </p>

      {/* 1. Introduction */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        1. Introduction
      </h3>
      <p className="mb-4 text-sm text-[#555555] text-justify">
        This Privacy Policy describes how Zager Digital Services (&quot;we&quot;,
        &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, and protects your personal
        information when you use Swaad Setu, our QR-based restaurant ordering
        and management platform. This Policy applies to restaurant owners, their
        staff, and customers who access our website, web application, and
        QR-based ordering interfaces (collectively, the &quot;Swaad Setu
        Platform&quot;).
      </p>
      <p className="mb-4 text-sm text-[#555555] text-justify">
        By accessing or using the Swaad Setu Platform, you agree to this Privacy
        Policy and consent to the collection and use of your information as
        described here.
      </p>

      {/* 2. Information We Collect */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        2. Information We Collect
      </h3>

      {/* 2.1 Owners */}
      <h4 className="mt-4 mb-2 text-sm font-semibold text-[#555555]">
        2.1 For Restaurant Owners/Partners
      </h4>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>Business name, legal entity name, and trade name</li>
        <li>Business address and contact address</li>
        <li>GST number, FSSAI license number</li>
        <li>Owner/authorized person’s name, email, and phone number</li>
        <li>Billing and settlement information (bank details, billing address)</li>
        <li>Menu items, categories, pricing, taxes, and availability details</li>
        <li>
          Restaurant configuration (table layout, order routing, printer
          settings, etc.)
        </li>
        <li>Staff user accounts, roles, and activity logs</li>
      </ul>

      {/* 2.2 Customers */}
      <h4 className="mt-4 mb-2 text-sm font-semibold text-[#555555]">
        2.2 For End Customers
      </h4>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>Name and contact details (if provided for order or billing)</li>
        <li>Table number or order location details</li>
        <li>Order items, special instructions, and order history</li>
        <li>
          Payment method details as forwarded to payment gateways (we do not
          store card/UPI credentials)
        </li>
        <li>Device information, browser type, operating system, and IP address</li>
        <li>
          Approximate location (for delivery orders, if enabled by restaurant)
        </li>
      </ul>

      {/* 2.3 Auto data */}
      <h4 className="mt-4 mb-2 text-sm font-semibold text-[#555555]">
        2.3 Automatically Collected Data
      </h4>
      <p className="mb-3 text-sm text-[#555555] text-justify">
        When you use the Swaad Setu Platform, we automatically collect device
        identifiers, IP address, browser type and version, operating system,
        device type, date/time stamps, session duration, interaction events, QR
        scan metadata, usage patterns, and log data (request URLs, response
        codes, performance metrics).
      </p>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        We may use cookies, local storage, and similar technologies for
        authentication, security, and analytics.
      </p>

      {/* 3. Use of info */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        3. How We Use Your Information
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>To register and manage restaurant accounts and staff access</li>
        <li>To enable QR-based ordering and manage orders in real time</li>
        <li>
          To facilitate secure payment processing through integrated payment
          gateways
        </li>
        <li>
          To generate business reports, sales analytics, and operational
          insights for restaurants
        </li>
        <li>
          To improve the performance, security, and user experience of the Swaad
          Setu Platform
        </li>
        <li>
          To provide customer support, resolve queries, and handle disputes
        </li>
        <li>
          To send transactional notifications (order confirmations, status
          updates, billing alerts)
        </li>
        <li>
          To comply with applicable laws, regulations, and tax/accounting
          requirements
        </li>
        <li>
          We may also use aggregated, anonymized data for product improvement,
          statistics, and benchmarking.
        </li>
      </ul>

      {/* 4. Legal basis */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        4. Legal Basis for Processing
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        Depending on the situation, we process personal data on the basis of
        performance of a contract (providing Swaad Setu services), legitimate
        interests (security, fraud prevention, analytics, improvement),
        compliance with legal obligations (tax, accounting, regulatory
        requirements), and consent where required.
      </p>

      <div className="my-6 rounded-r-lg border-l-4 border-[#FFBE00] bg-[#F8F9FA] p-4 text-sm italic text-[#555555]">
        You may withdraw consent at any time for consent-based processing
        without affecting the lawfulness of processing prior to withdrawal.
      </div>

      {/* 5. Sharing */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        5. Data Sharing and Disclosure
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          <strong>Restaurants:</strong> Customer order details, including items,
          instructions, and contact information (where provided), are shared
          with the respective restaurant to fulfill the order.
        </li>
        <li>
          <strong>Payment Gateways:</strong> Payment details are processed by
          PCI-DSS compliant payment service providers; Swaad Setu does not store
          full card or UPI credentials.
        </li>
        <li>
          <strong>Service Providers:</strong> Cloud hosting, analytics,
          communication, and support tools that process data on our behalf under
          contractual obligations.
        </li>
        <li>
          <strong>Professional Advisors and Authorities:</strong> Where required
          to comply with legal obligations, court orders, or to protect our
          rights.
        </li>
        <li>
          <strong>Business Transfers:</strong> In case of merger, acquisition,
          or restructuring, data may be transferred as part of business assets,
          subject to continuity of protection.
        </li>
        <li>We do not sell your personal information to third parties.</li>
      </ul>

      {/* 6. International transfers */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        6. International Transfers
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        If data is stored or processed on servers located outside India, we
        ensure that appropriate safeguards are in place to protect your
        information, consistent with this Policy and applicable laws.
      </p>

      {/* 7. Security */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        7. Data Security
      </h3>
      <ul className="mb-3 space-y-2 text-sm text-[#555555]">
        <li>HTTPS/TLS encryption for data in transit</li>
        <li>Restricted access to production systems on a need-to-know basis</li>
        <li>Secure server environments and regular backups</li>
        <li>Access controls for restaurant and staff accounts</li>
        <li>Periodic reviews of logs and security configurations</li>
      </ul>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        No method of transmission or storage is completely secure, and we cannot
        guarantee absolute security.
      </p>

      {/* 8. Retention */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        8. Data Retention
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Customer order data: typically retained for 1 year, or longer where
          required by law or legitimate business needs.
        </li>
        <li>
          Restaurant account and configuration data: retained for the duration
          of the active subscription and for a limited period after termination
          for legal and accounting purposes.
        </li>
        <li>
          Payment transaction records: retained as required by law (for example,
          tax and regulatory rules, often up to 7 years).
        </li>
        <li>
          Logs and analytics: retained for operational, security, and analytical
          purposes, then anonymized or deleted.
        </li>
      </ul>

      {/* 9. Rights */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        9. Your Rights
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>Right of access to your personal data.</li>
        <li>Right to rectification of inaccurate or incomplete data.</li>
        <li>
          Right to deletion where data is no longer required or consent is
          withdrawn, subject to legal retention obligations.
        </li>
        <li>Right to restriction of processing in certain circumstances.</li>
        <li>
          Right to data portability where technically feasible and applicable.
        </li>
        <li>
          Right to object to certain processing, including direct marketing.
        </li>
        <li>
          Right to withdraw consent at any time where processing is based on
          consent.
        </li>
      </ul>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        We may need to verify your identity before acting on requests and may
        not always be able to comply where legal or contractual obligations
        require continued processing.
      </p>

      {/* 10. Cookies */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        10. Cookies and Tracking
      </h3>
      <p className="mb-4 text-sm text-[#555555] text-justify">
        We use cookies and similar technologies to keep you logged in and secure
        your sessions, remember preferences, analyze usage and performance of
        the Swaad Setu Platform, and improve features and user experience. You
        can manage cookies through your browser settings, but disabling certain
        cookies may impact functionality.
      </p>

      {/* 11. Third-party links */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        11. Third-Party Links
      </h3>
      <p className="mb-4 text-sm text-[#555555] text-justify">
        The Swaad Setu Platform may contain links or integrations to third-party
        websites or services. Those sites and services are governed by their own
        privacy policies, and we are not responsible for their practices.
      </p>

      {/* 12. Changes */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        12. Changes to This Policy
      </h3>
      <p className="mb-4 text-sm text-[#555555] text-justify">
        We may update this Privacy Policy from time to time. Any material
        changes will be communicated via the Platform or email, and the &quot;Last
        Updated&quot; date will be revised. Continued use of the Swaad Setu
        Platform after such changes constitutes acceptance of the updated
        Policy.
      </p>

      {/* 13. Contact */}
      <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        13. Contact and Grievance
      </h3>
      <p className="mb-2 text-sm text-[#555555]">
        For privacy-related questions, concerns, or grievances, please contact:
      </p>
      <p className="text-sm text-[#555555]">
        <strong>Zager Digital Services</strong>, Startup Enclave, CSIT, Durg,
        Chhattisgarh, India
        <br />
        Email:{" "}
        <a
          href="mailto:contact@zager.in"
          className="text-[#FFBE00] underline"
        >
          contact@zager.in
        </a>{" "}
        | Support:{" "}
        <a
          href="mailto:connect@swaadsetu.com"
          className="text-[#FFBE00] underline"
        >
          connect@swaadsetu.com
        </a>
      </p>
    </section>
  );
};

export default PrivacyPolicy;
