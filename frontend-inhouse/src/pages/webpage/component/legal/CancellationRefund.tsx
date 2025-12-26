// components/legal/CancellationRefund.tsx
import React from "react";

const CancellationRefund: React.FC = () => {
  return (
    <section
      id="refund"
      className="rounded-2xl border-t-8 border-[#0F0F0F] bg-white p-6 md:p-10 shadow-sm transition-colors duration-200 hover:border-[#FFBE00]"
    >
      <span className="mb-4 inline-block rounded bg-[#FFBE00] px-2 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-[#0F0F0F]">
        Refund Policy
      </span>
      <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-[#0F0F0F]">
        Cancellation &amp; Refund Policy – Swaad Setu
      </h2>
      <p className="mb-6 text-sm font-semibold text-[#555555]">
        Last Updated: December 22, 2025
      </p>

      {/* 1. Scope */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        1. Scope
      </h3>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        This Cancellation &amp; Refund Policy applies only to restaurant
        subscriptions to the Swaad Setu Platform and does not cover customer
        payments for food orders made at restaurants.
      </p>

      {/* 2. Free Trial */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        2. Free Trial
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>
          Where a free trial is offered, you may use Swaad Setu during the trial
          without being charged subscription fees.
        </li>
        <li>
          If you do not wish to continue, you must cancel before the trial ends.
        </li>
        <li>
          If not cancelled, your paid subscription will begin automatically as
          per the plan selected.
        </li>
      </ul>

      {/* 3. Annual Subscription */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        3. Annual Subscription
      </h3>
      <ul className="mb-5 space-y-2 text-sm text-[#555555]">
        <li>Subscription fees for annual plans are generally non-refundable.</li>
        <li>
          Cancellation will take effect at the end of the current billing cycle.
          You may continue using the Platform until that date.
        </li>
        <li>
          No refunds are issued for partial periods or unused time, except where
          required by law.
        </li>
      </ul>

      {/* 4. Exceptions */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        4. Exceptions
      </h3>
      <p className="mb-2 text-sm text-[#555555] text-justify">
        In rare cases, we may, at our sole discretion, offer credits or partial
        refunds, for example where:
      </p>
      <ul className="mb-3 space-y-2 text-sm text-[#555555]">
        <li>
          There has been a verified, continuous technical outage on our side for
          an extended period severely affecting your use.
        </li>
        <li>There is a clear billing error.</li>
      </ul>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        Such decisions are made case-by-case and do not create a continuing
        obligation.
      </p>

      {/* 5. Cancellation Process */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        5. Cancellation Process
      </h3>
      <p className="mb-2 text-sm text-[#555555]">
        To cancel your subscription:
      </p>
      <ul className="mb-3 space-y-2 text-sm text-[#555555]">
        <li>
          Contact us via email at{" "}
          <a
            href="mailto:contact@zager.in"
            className="text-[#FFBE00] underline"
          >
            contact@zager.in
          </a>{" "}
          or{" "}
          <a
            href="mailto:connect@swaadsetu.com"
            className="text-[#FFBE00] underline"
          >
            connect@swaadsetu.com
          </a>
          , or
        </li>
        <li>
          Use any in-app/account management cancellation option if available.
        </li>
      </ul>
      <p className="mb-5 text-sm text-[#555555] text-justify">
        We will confirm cancellation via email to your registered address.
      </p>

      {/* 6. Food Orders */}
      <h3 className="mt-2 mb-4 flex items-center text-lg font-bold text-[#0F0F0F]">
        <span className="mr-2 text-2xl leading-none text-[#FFBE00]">•</span>
        6. Food Orders
      </h3>
      <p className="mb-3 text-sm text-[#555555] text-justify">
        Swaad Setu does not manage or control refunds related to food orders
        placed at restaurants. All issues related to order quality, incorrect
        items, delays, or dissatisfaction are between the customer and the
        restaurant.
      </p>
      <p className="text-sm text-[#555555] text-justify">
        Restaurants determine their own cancellation and refund policies for
        food orders.
      </p>
    </section>
  );
};

export default CancellationRefund;
