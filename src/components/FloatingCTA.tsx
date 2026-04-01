import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const FloatingCTA = () => {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '201016111733';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    isRTL 
      ? 'مرحباً، أريد الاستفسار عن خدماتكم' 
      : 'Hello, I want to inquire about your services'
  )}`;

  return (
    <>
      {/* Floating Buttons Container */}
      <div className={`fixed bottom-4 sm:bottom-6 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 flex flex-col gap-2 sm:gap-3 safe-bottom`}>
        
        {/* Expanded Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Free Consultation Button */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <button
                  onClick={() => window.location.href = '/packages'}
                  className="flex items-center gap-3 bg-accent text-accent-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold text-sm whitespace-nowrap">
                    {isRTL ? 'استشارة مجانية' : 'Free Consultation'}
                  </span>
                </button>
              </motion.div>

              {/* Call Button */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <a
                  href="tel:+201016111733"
                  className="flex items-center gap-3 bg-secondary text-secondary-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-semibold text-sm whitespace-nowrap" dir="ltr">
                    01016111733
                  </span>
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main WhatsApp Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
          className="relative"
        >
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-pulse opacity-40" />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group touch-target"
            aria-label="WhatsApp"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="whatsapp"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Tooltip */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-full mr-3' : 'left-full ml-3'} whitespace-nowrap bg-card text-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium border border-border`}
            >
              {isRTL ? 'تواصل معنا واتساب' : 'Chat on WhatsApp'}
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? '-right-1.5' : '-left-1.5'} w-3 h-3 bg-card border-l border-b border-border transform ${isRTL ? 'rotate-[135deg]' : '-rotate-45'}`} />
            </motion.div>
          )}
        </motion.div>

        {/* Direct WhatsApp Link (shown when menu is open) */}
        <AnimatePresence>
          {isOpen && (
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm whitespace-nowrap">
                {isRTL ? 'راسلنا واتساب' : 'Chat on WhatsApp'}
              </span>
            </motion.a>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FloatingCTA;
