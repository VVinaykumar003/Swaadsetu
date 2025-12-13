import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAsAdmin } from "../api/admin/admin.login";

/**
 * AdminLogin (Clone of Staff PinLogin with admin-specific logic)
 * - Back button navigates to root ('/').
 * - Uses loginAsAdmin() and redirects to /admin-dashboard on success.
 */

export default function AdminLogin() {
  const navigate = useNavigate();
  const rid = import.meta.env.VITE_RID || "restro10";

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const hasSubmittedRef = useRef(false);

  const pin = digits.join("");

  const focusInput = (idx: number) => {
    inputsRef.current[idx]?.focus();
    inputsRef.current[idx]?.select();
  };

  const handleDigitChange = (idx: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, "");

    if (!cleaned) {
      setDigits((d) => {
        const copy = [...d];
        copy[idx] = "";
        return copy;
      });
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.split("");
      setDigits((d) => {
        const copy = [...d];
        for (let i = 0; i < chars.length && idx + i < 4; i++) {
          copy[idx + i] = chars[i];
        }
        return copy;
      });
      const nextIdx = Math.min(3, idx + cleaned.length - 1);
      focusInput(nextIdx + 1 > 3 ? 3 : nextIdx + 1);
      return;
    }

    setDigits((d) => {
      const copy = [...d];
      copy[idx] = cleaned;
      return copy;
    });

    if (cleaned && idx < 3) focusInput(idx + 1);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        setDigits((d) => {
          const copy = [...d];
          copy[idx] = "";
          return copy;
        });
      } else if (idx > 0) {
        focusInput(idx - 1);
        setDigits((d) => {
          const copy = [...d];
          copy[idx - 1] = "";
          return copy;
        });
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      focusInput(idx - 1);
    } else if (e.key === "ArrowRight" && idx < 3) {
      e.preventDefault();
      focusInput(idx + 1);
    }
  };

  const doAutoLogin = async (currentPin: string) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setIsLogging(true);
    setError(null);
    setSuccess(false);

    try {
      await new Promise((r) => setTimeout(r, 160));
      const res = await loginAsAdmin(currentPin, rid);
      console.log("AdminLogin: login response:", res);

      if (res === true) {
        setSuccess(true);
        await new Promise((r) => setTimeout(r, 300));
        navigate("/admin-dashboard", { replace: true });
      } else {
        throw new Error("Invalid PIN");
      }
    } catch (err: any) {
      console.warn("AdminLogin: login failed:", err);
      setError(err?.message || "Invalid PIN");

      inputsRef.current.forEach((el) => {
        if (!el) return;
        el.classList.remove("animate-shake");
        el.offsetWidth;
        el.classList.add("animate-shake");
      });

      hasSubmittedRef.current = false;
      setSuccess(false);
    } finally {
      setIsLogging(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4 && !hasSubmittedRef.current && !isLogging) {
      doAutoLogin(pin);
    }
  }, [pin]);

  useEffect(() => {
    const firstEmpty = digits.findIndex((d) => d === "");
    focusInput(firstEmpty === -1 ? 3 : firstEmpty);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="bg-gray-800 rounded-2xl shadow-2xl ring-2 ring-gray-700 overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 sm:px-8 sm:py-6 flex items-center justify-center relative border-b border-gray-700">
            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              aria-label="Go to Landing Page"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Icon */}
            <div className="absolute left-14 sm:left-16 w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-semibold hidden sm:flex">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* Title */}
            <div className="text-center">
              <div className="text-xl font-extrabold text-gray-100 tracking-wide">
                Admin Login
              </div>
            </div>
          </div>

          {/* PIN Input Area */}
          <div className="px-8 py-8 sm:px-12 sm:py-12">
            <p className="text-center text-gray-400 mb-6 text-base font-medium">
              Enter your 4-digit Admin PIN
            </p>
            <label className="sr-only" htmlFor="pin-input-0">
              4 digit Admin PIN
            </label>

            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <input
                  key={i}
                  id={`pin-input-${i}`}
                  ref={(el) => (inputsRef.current[i] = el)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="password"
                  maxLength={1}
                  value={digits[i]}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("Text") || "";
                    handleDigitChange(i, pasted);
                    e.preventDefault();
                  }}
                  disabled={isLogging}
                  className={`
                    w-16 h-16 text-3xl 
                    sm:w-20 sm:h-20 sm:text-4xl 
                    text-center font-extrabold rounded-xl py-2 px-2 
                    bg-gray-700 text-white border transition duration-150
                    hover:border-emerald-500 
                    focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:border-emerald-500
                    ${
                      error
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-gray-600"
                    }
                  `}
                  aria-label={`Digit ${i + 1} of 4`}
                />
              ))}
            </div>

            {/* Status */}
            <div className="mt-8 flex items-center justify-center h-6">
              {isLogging ? (
                <div
                  className="w-5 h-5 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin"
                  aria-hidden
                />
              ) : error ? (
                <div
                  className="text-sm text-red-400 font-medium"
                  role="status"
                  aria-live="polite"
                >
                  {error}
                </div>
              ) : success ? (
                <div
                  className="text-sm text-emerald-400 font-medium"
                  role="status"
                  aria-live="polite"
                >
                  Signing in...
                </div>
              ) : (
                <div className="text-sm text-emerald-600 invisible">ok</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 sm:px-8 bg-gray-700/60 text-center border-t border-gray-700">
            <div className="text-xs text-gray-400">
              Trouble logging in? Contact your restaurant owner.
            </div>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 420ms cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}
