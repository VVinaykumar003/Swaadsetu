import { Footer } from "../component/Footer";
import Navbar from "../component/Navbar";
import BackButton from "../component/ui/BackButton";




const PrivatePolicy = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#333333] scroll-smooth">
       <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <Navbar />
        <div className="px-6  py-2">
          <BackButton />
        </div>
      </header>

      {/* Header */}
      <header className="relative overflow-hidden bg-[#0F0F0F] px-5 py-20 text-center text-white">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
          LEGAL HUB
        </h1>
        <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#FFBE00] opacity-90">
          Swaad Setu • Zager Digital Services
        </p>
        <span className="absolute bottom-0 left-1/2 h-1 w-24 -translate-x-1/2 bg-[#FFBE00]" />
      </header>

      {/* Wrapper */}
      <div className="wrapper mx-auto -mt-10 mb-16 flex max-w-6xl gap-8 px-5 lg:-mt-16 lg:gap-10">
        {/* Sidebar */}
        <aside className="hidden w-80 shrink-0 lg:block sticky top-8 h-fit">
          <div className="rounded-2xl bg-[#0F0F0F] p-7 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
            <h4 className="mb-6 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Documents
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#privacy"
                  className="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-[rgba(255,190,0,0.12)] hover:text-[#FFBE00]"
                >
                  <i className="fa-solid fa-fingerprint mr-3 text-base transition-transform group-hover:scale-110" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#compliance"
                  className="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-[rgba(255,190,0,0.12)] hover:text-[#FFBE00]"
                >
                  <i className="fa-solid fa-shield-virus mr-3 text-base" />
                  Compliance &amp; Security
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-[rgba(255,190,0,0.12)] hover:text-[#FFBE00]"
                >
                  <i className="fa-solid fa-file-invoice mr-3 text-base" />
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a
                  href="#refund"
                  className="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-[rgba(255,190,0,0.12)] hover:text-[#FFBE00]"
                >
                  <i className="fa-solid fa-wallet mr-3 text-base" />
                  Refund &amp; Cancellation
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-all duration-300 hover:bg-[rgba(255,190,0,0.12)] hover:text-[#FFBE00]"
                >
                  <i className="fa-solid fa-comment-dots mr-3 text-base" />
                  Grievance Support
                </a>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFBE00] px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-[#0F0F0F] shadow-[0_10px_20px_rgba(255,190,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              <i className="fa-solid fa-cloud-download-alt" />
              Print Legal PDF
            </button>
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 space-y-10">
          {/* Policy block helper */}
          {/* Privacy */}
          <section
            id="privacy"
            className="relative rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
          >
            <span className="mb-4 inline-block rounded px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide bg-[#FFBE00] text-[#0F0F0F]">
              Effective Date: Dec 2025
            </span>
            <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
              Privacy Policy – Swaad Setu
            </h2>
            <p className="mb-6 text-sm font-semibold text-[#555555]">
              Last Updated: December 22, 2025
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              1. Introduction
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              This Privacy Policy describes how Zager Digital Services
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, and protects your
              personal information when you use Swaad Setu, our QR-based
              restaurant ordering and management platform. This Policy applies
              to restaurant owners, their staff, and customers who access our
              website, web application, and QR-based ordering interfaces
              (collectively, the &quot;Swaad Setu Platform&quot;).
            </p>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              By accessing or using the Swaad Setu Platform, you agree to this
              Privacy Policy and consent to the collection and use of your
              information as described here.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              2. Information We Collect
            </h3>

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
              <li>Restaurant configuration (table layout, order routing, printer settings, etc.)</li>
              <li>Staff user accounts, roles, and activity logs</li>
            </ul>

            <h4 className="mt-4 mb-2 text-sm font-semibold text-[#555555]">
              2.2 For End Customers
            </h4>
            <ul className="mb-5 space-y-2 text-sm text-[#555555]">
              <li>Name and contact details (if provided for order or billing)</li>
              <li>Table number or order location details</li>
              <li>Order items, special instructions, and order history</li>
              <li>
                Payment method details as forwarded to payment gateways (we do
                not store card/UPI credentials)
              </li>
              <li>Device information, browser type, operating system, and IP address</li>
              <li>Approximate location (for delivery orders, if enabled by restaurant)</li>
            </ul>

            <h4 className="mt-4 mb-2 text-sm font-semibold text-[#555555]">
              2.3 Automatically Collected Data
            </h4>
            <p className="mb-3 text-sm text-[#555555] text-justify">
              When you use the Swaad Setu Platform, we automatically collect
              device identifiers, IP address, browser type and version,
              operating system, device type, date/time stamps, session duration,
              interaction events, QR scan metadata, usage patterns, and log data
              (request URLs, response codes, performance metrics).
            </p>
            <p className="mb-5 text-sm text-[#555555] text-justify">
              We may use cookies, local storage, and similar technologies for
              authentication, security, and analytics.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
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
                To improve the performance, security, and user experience of the
                Swaad Setu Platform
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
            </ul>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              4. Legal Basis for Processing
            </h3>
            <p className="mb-5 text-sm text-[#555555] text-justify">
              Depending on the situation, we process personal data on the basis
              of performance of a contract, legitimate interests, compliance
              with legal obligations, and consent.
            </p>

            <div className="my-6 rounded-r-lg border-l-4 border-[#FFBE00] bg-[#F8F9FA] p-4 text-sm italic text-[#555555]">
              You may withdraw consent at any time for consent-based processing
              without affecting the lawfulness of processing prior to withdrawal.
            </div>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              5. Data Sharing and Disclosure
            </h3>
            <ul className="mb-5 space-y-2 text-sm text-[#555555]">
              <li>
                <strong>Restaurants:</strong> Customer order details are shared
                with the respective restaurant to fulfill the order.
              </li>
              <li>
                <strong>Payment Gateways:</strong> Payment details are processed
                by PCI-DSS compliant providers; Swaad Setu does not store
                credentials.
              </li>
              <li>
                <strong>Service Providers:</strong> Cloud hosting, analytics,
                and communication tools.
              </li>
              <li>
                <strong>Professional Advisors:</strong> Compliance with legal
                obligations and court orders.
              </li>
              <li>
                <strong>Business Transfers:</strong> Merger or acquisition data
                transfer.
              </li>
            </ul>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              7. Data Security
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              We use reasonable technical and organizational measures to protect
              your data, including HTTPS/TLS encryption, restricted production
              access, secure servers, and regular backups.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              8. Data Retention
            </h3>
            <ul className="mb-5 space-y-2 text-sm text-[#555555]">
              <li>Customer order data: Typically 1 year.</li>
              <li>Restaurant data: Duration of active subscription.</li>
              <li>Payment records: Up to 7 years for tax compliance.</li>
              <li>Logs: Retained for operational purposes, then anonymized.</li>
            </ul>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              13. Contact and Grievance
            </h3>
            <p className="mb-2 text-sm text-[#555555]">
              For privacy-related questions, concerns, or grievances, please
              contact:
            </p>
            <p className="text-sm text-[#555555]">
              <strong>Zager Digital Services</strong>, Startup Enclave, CSIT,
              Durg, Chhattisgarh, India
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

          {/* Compliance */}
          <section
            id="compliance"
            className="rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
          >
            <span className="mb-4 inline-block rounded px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide bg-[#FFBE00] text-[#0F0F0F]">
              Security Protocol
            </span>
            <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
              Compliance &amp; Security – Swaad Setu
            </h2>
            <p className="mb-4 text-sm text-[#555555]">
              Swaad Setu explains our approach to security, compliance, and data
              protection.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              2. Infrastructure &amp; Hosting
            </h3>
            <ul className="mb-5 space-y-2 text-sm text-[#555555]">
              <li>
                Hosted on secure cloud infrastructure with industry-standard
                physical security.
              </li>
              <li>Firewalls, access controls, and network segmentation.</li>
              <li>Regular backups for disaster recovery.</li>
            </ul>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              3. Application Security
            </h3>
            <ul className="mb-5 space-y-2 text-sm text-[#555555]">
              <li>All critical routes served over HTTPS/TLS.</li>
              <li>Role-based access control for staff.</li>
              <li>
                Regular updates to frameworks to address vulnerabilities.
              </li>
            </ul>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              6. Restaurant Regulatory Responsibilities
            </h3>
            <p className="text-sm text-[#555555] text-justify">
              Restaurants remain solely responsible for compliance with FSSAI,
              GST, local municipal rules, and any licenses required for
              operating a food business.
            </p>
          </section>

          {/* Terms */}
          <section
            id="terms"
            className="rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
          >
            <span className="mb-4 inline-block rounded px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide bg-[#FFBE00] text-[#0F0F0F]">
              Usage Terms
            </span>
            <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
              Terms and Conditions – Swaad Setu
            </h2>
            <p className="mb-6 text-sm font-semibold text-[#555555]">
              Last Updated: December 22, 2025
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              1. Acceptance of Terms
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              By creating an account or using any part of the Swaad Setu
              Platform, you agree to be bound by these Terms. If you do not
              agree, you must not use the Platform.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              2. Definitions
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              <strong>Platform:</strong> Swaad Setu website and apps.{" "}
              <strong>Restaurant Partner:</strong> Food business entity.{" "}
              <strong>Customer:</strong> End-user. <strong>Content:</strong> All
              text, images, and software.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              3. Eligibility
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              To become a Restaurant Partner, you confirm you are a legally
              registered business holding all licenses (FSSAI/GST) and have
              authority to bind the business.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              5. Restaurant Obligations
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              Maintaining valid licenses, food safety standards, accurate menu
              pricing, and handling customer complaints related to
              in-restaurant experience.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              9. Disclaimer and Limitation of Liability
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              The Platform is provided &quot;as is&quot;. Swaad Setu is not
              responsible for food quality, staff behavior, or pricing accuracy.
              Liability is capped at subscription fees paid in the last 12
              months.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              13. Governing Law
            </h3>
            <p className="text-sm text-[#555555] text-justify">
              These Terms are governed by the laws of India. Jurisdiction:{" "}
              <strong>Durg, Chhattisgarh</strong>.
            </p>
          </section>

          {/* Refund */}
          <section
            id="refund"
            className="rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00] mb-10"
          >
            <span className="mb-4 inline-block rounded px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide bg-[#FFBE00] text-[#0F0F0F]">
              Refund Policy
            </span>
            <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
              Cancellation &amp; Refund Policy – Swaad Setu
            </h2>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              2. Free Trial
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              You may use Swaad Setu during the trial without charge. You must
              cancel before the trial ends to avoid automatic paid subscription.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              3. Annual Subscription
            </h3>
            <p className="mb-4 text-sm text-[#555555] text-justify">
              Fees are generally non-refundable. Cancellation takes effect at
              the end of the billing cycle. No refunds for partial periods.
            </p>

            <h3 className="mt-6 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
              <span className="mr-2 text-2xl leading-none text-[#FFBE00]">
                •
              </span>
              7. Food Orders
            </h3>
            <p className="mb-2 text-sm text-[#555555] text-justify">
              <strong>Swaad Setu does not manage refunds for food orders.</strong>{" "}
              All quality and delay issues are between the customer and the
              restaurant.
            </p>
            <p className="text-sm text-[#555555]">
              <strong>Phone:</strong> +91-9407655717
            </p>
          </section>

          {/* Grievance form */}
          {/* <section
            id="contact"
            className="rounded-3xl bg-[#0F0F0F] p-6 md:p-12 text-white"
          >
            <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight">
              Grievance &amp; Legal Support
            </h2>
            <p className="mb-8 text-sm text-gray-400">
              If you have any questions regarding these policies, please fill
              out the specialized form below.
            </p>

            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#FFBE00]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-[#FFBE00] focus:bg-[#252525]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#FFBE00]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-[#FFBE00] focus:bg-[#252525]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#FFBE00]">
                  Concern Category
                </label>
                <select className="w-full rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-[#FFBE00] focus:bg-[#252525]">
                  <option>Privacy &amp; Data Concern</option>
                  <option>Terms &amp; Service Issue</option>
                  <option>Billing / Refund Support</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#FFBE00]">
                  Message Detail
                </label>
                <textarea
                  rows={6}
                  placeholder="Please provide details of your concern..."
                  className="w-full rounded-xl border border-[#333333] bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-[#FFBE00] focus:bg-[#252525]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#FFBE00] px-4 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-[#0F0F0F] transition-transform duration-200 hover:scale-[1.02] hover:bg-white"
              >
                Send Legal Inquiry
              </button>
            </form>
          </section> */}
        </main>
      </div>

      {/* Footer */}
      {/* <footer className="border-t border-[#E0E0E0] bg-white px-5 py-10 text-center">
        <h2 className="text-xl font-semibold text-[#0F0F0F]">
          Zager Digital Services
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-10 text-sm">
          <div className="f-item flex flex-col items-center">
            <i className="fa-solid fa-map-marker-alt mb-2 text-xl text-[#FFBE00]" />
            <p className="font-semibold text-[#333333]">Durg, Chhattisgarh</p>
          </div>
          <div className="f-item flex flex-col items-center">
            <i className="fa-solid fa-envelope mb-2 text-xl text-[#FFBE00]" />
            <p className="font-semibold text-[#333333]">contact@zager.in</p>
          </div>
          <div className="f-item flex flex-col items-center">
            <i className="fa-solid fa-phone mb-2 text-xl text-[#FFBE00]" />
            <p className="font-semibold text-[#333333]">+91-9407655717</p>
          </div>
        </div>
        <p className="mt-10 text-[0.75rem] text-gray-500">
          © 2025 Swaad Setu. All rights reserved. Intellectual Property of Zager
          Digital Services.
        </p>
      </footer> */}
      <Footer/>
    </div>
  );
};

export default PrivatePolicy;
