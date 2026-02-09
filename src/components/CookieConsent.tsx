import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'alligator_cookie_consent';

export type ConsentStatus = 'pending' | 'accepted' | 'rejected';

// Get consent status from localStorage
export const getConsentStatus = (): ConsentStatus => {
  if (typeof window === 'undefined') return 'pending';
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === 'accepted' || stored === 'rejected') return stored;
  return 'pending';
};

// Set consent status
export const setConsentStatus = (status: 'accepted' | 'rejected') => {
  localStorage.setItem(CONSENT_KEY, status);
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: status }));
};

// Check if analytics/tracking is allowed
export const isTrackingAllowed = (): boolean => {
  return getConsentStatus() === 'accepted';
};

const CookieConsent = () => {
  const { isRTL } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has been given
    const status = getConsentStatus();
    if (status === 'pending') {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsentStatus('accepted');
    setShowBanner(false);
    // Reload to activate tracking
    window.location.reload();
  };

  const handleReject = () => {
    setConsentStatus('rejected');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-foreground text-base md:text-lg mb-1 flex items-center gap-2">
                        <Cookie className="h-5 w-5 text-primary sm:hidden" />
                        {isRTL ? 'نستخدم ملفات تعريف الارتباط' : 'We use cookies'}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {isRTL 
                          ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع. بالنقر على "موافق"، أنت توافق على استخدامنا لهذه التقنيات.'
                          : 'We use cookies to enhance your experience and analyze site usage. By clicking "Accept", you consent to our use of these technologies.'
                        }
                        {' '}
                        <Link 
                          to="/privacy" 
                          className="text-primary hover:underline font-medium"
                        >
                          {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                        </Link>
                      </p>
                    </div>
                    
                    {/* Close button (mobile) */}
                    <button
                      onClick={handleReject}
                      className="sm:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4">
                    <Button
                      onClick={handleAccept}
                      className="order-1 sm:order-2"
                      size="sm"
                    >
                      <Shield className="h-4 w-4 mr-1.5" />
                      {isRTL ? 'موافق' : 'Accept'}
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      className="order-2 sm:order-1"
                      size="sm"
                    >
                      {isRTL ? 'رفض' : 'Decline'}
                    </Button>
                    <span className="hidden sm:inline-flex items-center text-xs text-muted-foreground order-3">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      {isRTL ? 'بياناتك محمية' : 'Your data is protected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
