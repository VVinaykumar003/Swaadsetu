// components/legal/TermsConditions.tsx
import React from "react";

const TermsConditions: React.FC = () => {
  return (
    <section
      id="terms"
      className="rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
    >
      <span className="mb-4 inline-block rounded bg-[#FFBE00] px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-[#0F0F0F]">
        Usage Terms
      </span>
      <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
        Terms and Conditions – Swaad Setu
      </h2>
      <p className="mb-6 text-sm font-semibold text-[#555555]">
        Last Updated: December 22, 2025
      </p>

      {/* 1. Acceptance of Terms */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        1. Acceptance of Terms
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of
        Swaad Setu, provided by Zager Digital Services (&quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;). By creating an account or using any part of the Swaad Setu
        Platform, you agree to be bound by these Terms. If you do not agree,
        you must not use the Platform.
      </p>

      {/* 2. Definitions */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        2. Definitions
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          <strong>&quot;Platform&quot;</strong> means the Swaad Setu website, web
          applications, QR ordering interfaces, and related services.
        </li>
        <li>
          <strong>&quot;Restaurant Partner&quot; or &quot;Restaurant&quot;</strong> means a food
          business entity that registers to use Swaad Setu.
        </li>
        <li>
          <strong>&quot;Customer&quot;</strong> means an end-user who places an order through
          a Swaad Setu QR or interface.
        </li>
        <li>
          <strong>&quot;Services&quot;</strong> means features provided via the Platform,
          including QR ordering, menu display, order management, payment
          integration, and basic analytics.
        </li>
        <li>
          <strong>&quot;Content&quot;</strong> means all text, images, software, graphics,
          and materials made available by Swaad Setu.
        </li>
        <li>
          <strong>&quot;Your Content&quot; or &quot;Restaurant Content&quot;</strong> means menus,
          images, branding, text, pricing, and any information you upload or
          configure.
        </li>
      </ul>

      {/* 3. Eligibility */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        3. Eligibility
      </h3>
      <p className="mb-2 text-sm text-[#555555]">To become a Restaurant Partner, you confirm that:</p>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          You are a legally registered business and hold all licenses required
          to operate (including FSSAI and GST registration, where applicable).
        </li>
        <li>You have the authority to bind the business to these Terms.</li>
        <li>
          The information you provide during onboarding is accurate, complete,
          and kept up to date.
        </li>
      </ul>

      {/* 4. License and Use */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        4. License and Use of the Platform
      </h3>
      <p className="mb-3 text-sm text-[#555555] text-justify">
        Subject to these Terms, we grant you a limited, non-exclusive,
        non-transferable, revocable license to access and use the Platform for
        your internal business operations.
      </p>
      <p className="mb-2 text-sm font-semibold text-[#555555]">
        You agree not to:
      </p>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Copy, modify, adapt, translate, or reverse engineer any part of the
          Platform except as permitted by law.
        </li>
        <li>
          Attempt to gain unauthorized access to our systems or other users’
          accounts.
        </li>
        <li>
          Use the Platform for any unlawful activity or in violation of
          applicable laws.
        </li>
        <li>
          Resell, sublicense, or make the Platform available to third parties
          outside your restaurant operations.
        </li>
      </ul>

      {/* 5. Restaurant Obligations */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        5. Restaurant Obligations
      </h3>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        5.1 Compliance
      </h4>
      <p className="mb-2 text-sm text-[#555555]">
        Restaurants are solely responsible for:
      </p>
      <ul className="mb-4 space-y-2 text-sm text-[#555555]">
        <li>Maintaining valid FSSAI, GST, and other regulatory licenses.</li>
        <li>
          Complying with all food safety, hygiene, and labeling standards.
        </li>
        <li>
          Ensuring that all taxes, fees, and charges applied in the menu and
          invoices are correct and lawful.
        </li>
      </ul>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        5.2 Service Quality
      </h4>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>Display accurate menu items, pricing, and availability on Swaad Setu.</li>
        <li>Update menu and prices promptly when changes occur.</li>
        <li>Prepare and serve food in a timely and safe manner.</li>
        <li>
          Handle customer complaints related to food, service, and
          in-restaurant experience.
        </li>
      </ul>

      {/* 6. Subscription, Fees, Trials */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        6. Subscription, Fees, and Trials
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Swaad Setu may be offered with a free trial period; eligibility and
          duration will be communicated during signup.
        </li>
        <li>
          After the trial, paid subscriptions (typically annual) will be charged
          as per the chosen plan.
        </li>
        <li>
          Subscription fees are generally non-refundable, except as specified in
          the Cancellation &amp; Refund Policy.
        </li>
        <li>
          Fees and plans may change; any changes will apply from the next
          billing term, with reasonable notice where practicable.
        </li>
      </ul>

      {/* 7. Third-Party Services */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        7. Third-Party Services
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          The Platform may integrate with third-party services such as payment
          gateways, SMS/email providers, analytics tools, or other external
          systems.
        </li>
        <li>
          Your use of such services may be subject to their own terms and
          privacy policies.
        </li>
        <li>
          We are not responsible for the availability, performance, or conduct
          of third-party services.
        </li>
        <li>
          We may add, modify, or discontinue integrations at our discretion.
        </li>
      </ul>

      {/* 8. Content & IP */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        8. Content and Intellectual Property
      </h3>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        8.1 Our IP
      </h4>
      <ul className="mb-4 space-y-2 text-sm text-[#555555]">
        <li>
          The Platform, including all software, interfaces, designs, and
          Content, is owned by or licensed to Zager Digital Services.
        </li>
        <li>All rights not expressly granted to you are reserved.</li>
      </ul>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        8.2 Your Content
      </h4>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          You retain ownership of your menus, branding, images, and business
          data.
        </li>
        <li>
          You grant us a non-exclusive, royalty-free license to use, reproduce,
          display, and process Your Content solely for operating and improving
          the Platform and services.
        </li>
        <li>
          You represent that you have the necessary rights to upload and use
          Your Content and that it does not infringe third-party rights.
        </li>
      </ul>

      {/* 9. Disclaimer & Liability */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        9. Disclaimer and Limitation of Liability
      </h3>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        9.1 Platform Disclaimer
      </h4>
      <p className="mb-3 text-sm text-[#555555] text-justify">
        The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis,
        without any warranties of any kind, whether express or implied. We do
        not guarantee that the Platform will be uninterrupted, error-free, or
        completely secure.
      </p>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        9.2 No Liability for Restaurant Operations
      </h4>
      <ul className="mb-3 space-y-2 text-sm text-[#555555]">
        <li>Food quality, safety, taste, or portion sizes.</li>
        <li>Restaurant staff behaviour or in-venue service.</li>
        <li>
          Accuracy of restaurant menus, pricing, or tax calculations configured
          by the restaurant.
        </li>
        <li>
          Delivery logistics, if any, managed directly by restaurants or third
          parties.
        </li>
      </ul>

      <h4 className="mt-1 mb-2 text-sm font-semibold text-[#555555]">
        9.3 Exclusions and Cap
      </h4>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          To the maximum extent allowed by law, we are not liable for indirect,
          incidental, special, or consequential losses (including loss of
          profits, revenue, goodwill, or data).
        </li>
        <li>
          We are not liable for issues arising from third-party services or
          external network failures.
        </li>
        <li>
          Our total aggregate liability for all claims arising out of or related
          to the Platform will not exceed the subscription fees paid by the
          Restaurant Partner to us in the preceding 12 months.
        </li>
      </ul>

      {/* 10. Indemnity */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        10. Indemnity
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        You agree to indemnify and hold harmless Zager Digital Services from
        any claims, damages, losses, and expenses (including legal fees) arising
        from your violation of these Terms or applicable law, any claim relating
        to Your Content (including IP or privacy violations), or any regulatory
        or legal action related to your restaurant’s licenses, food safety, tax
        compliance, or service to customers.
      </p>

      {/* 11. Termination */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        11. Termination and Suspension
      </h3>
      <p className="mb-2 text-sm text-[#555555] text-justify">
        We may suspend or terminate your access to the Platform, in whole or in
        part, if you breach these Terms or applicable law, fail to pay
        subscription fees after a grace period, or where fraud, security risk,
        or misuse of the Platform is detected. You may terminate your
        subscription as described in the Cancellation &amp; Refund Policy.
      </p>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        Upon termination, access to the Platform will cease and outstanding fees
        remain payable. We may retain certain data as required by law or for
        legitimate business purposes, in accordance with the Privacy Policy.
      </p>

      {/* 12. Changes */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        12. Changes to the Terms
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        We may revise these Terms from time to time. When we do, we will update
        the &quot;Last Updated&quot; date and may provide additional notice for material
        changes. Continued use of the Platform after changes become effective
        constitutes acceptance of the revised Terms.
      </p>

      {/* 13. Governing law */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        13. Governing Law and Jurisdiction
      </h3>
      <p className="text-sm text-[#555555] text-justify">
        These Terms are governed by the laws of India. Any disputes will be
        subject to the exclusive jurisdiction of the courts in{" "}
        <strong>Durg, Chhattisgarh</strong>.
      </p>
    </section>
  );
};

export default TermsConditions;
