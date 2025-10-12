"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

interface CookieConsentProps {
  companyName?: string;
  privacyPolicyUrl?: string;
}

export default function CookieConsent({
  companyName = "AI Resume Builder",
  privacyPolicyUrl = "/privacy",
}: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    
    // Initialize analytics here
    if (typeof window !== "undefined") {
      // window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
  };

  const handleDeclineAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    
    // Update analytics consent
    if (typeof window !== "undefined" && preferences.analytics) {
      // window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Main Banner */}
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                      By clicking "Accept All", you consent to our use of cookies.{" "}
                      <Link 
                        href={privacyPolicyUrl}
                        className="text-pink-600 dark:text-pink-400 hover:underline font-medium"
                      >
                        Read our Privacy Policy
                      </Link>
                    </p>

                    {/* Customize Section */}
                    <AnimatePresence>
                      {showCustomize && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mb-4 space-y-3 overflow-hidden"
                        >
                          {/* Necessary Cookies */}
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <input
                              type="checkbox"
                              checked={preferences.necessary}
                              disabled
                              className="mt-1 w-4 h-4 text-pink-600 rounded opacity-50 cursor-not-allowed"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Necessary Cookies (Required)
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Essential for the website to function properly. Cannot be disabled.
                              </p>
                            </div>
                          </div>

                          {/* Analytics Cookies */}
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <input
                              type="checkbox"
                              checked={preferences.analytics}
                              onChange={(e) =>
                                setPreferences({ ...preferences, analytics: e.target.checked })
                              }
                              className="mt-1 w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Analytics Cookies
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Help us understand how visitors interact with our website.
                              </p>
                            </div>
                          </div>

                          {/* Marketing Cookies */}
                          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <input
                              type="checkbox"
                              checked={preferences.marketing}
                              onChange={(e) =>
                                setPreferences({ ...preferences, marketing: e.target.checked })
                              }
                              className="mt-1 w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Marketing Cookies
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Used to deliver personalized advertisements relevant to you.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {!showCustomize ? (
                        <>
                          <motion.button
                            onClick={handleAcceptAll}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
                          >
                            Accept All
                          </motion.button>
                          <motion.button
                            onClick={() => setShowCustomize(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Customize
                          </motion.button>
                          <motion.button
                            onClick={handleDeclineAll}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            Decline All
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            onClick={handleSavePreferences}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
                          >
                            Save Preferences
                          </motion.button>
                          <motion.button
                            onClick={() => setShowCustomize(false)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Back
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowBanner(false)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close cookie banner"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* GDPR Notice */}
              <div className="px-6 md:px-8 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This website is compliant with GDPR and CCPA regulations. You can change your preferences at any time.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
