import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { generateWhatsAppLink, generateInquiryMessage } from '@/lib/whatsapp';

export function WhatsAppFloatingButton() {
  const { settings } = useStoreSettings();
  const [isHovered, setIsHovered] = useState(false);

  const customerCareNumber = settings.whatsapp_customer_care_number;
  const label = settings.whatsapp_customer_care_label || 'Customer Care';

  const whatsappLink = customerCareNumber
    ? generateWhatsAppLink(customerCareNumber, generateInquiryMessage())
    : '';

  // Don't render if no valid link
  if (!whatsappLink) return null;

  return (
    <motion.div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-card shadow-lg rounded-lg px-4 py-2 border border-border whitespace-nowrap pointer-events-none"
          >
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">Chat with us on WhatsApp</p>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contact ${label} on WhatsApp`}
        className="relative z-10 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
        style={{ backgroundColor: '#25D366' }}
      >
        <MessageCircle className="h-7 w-7 text-white" fill="white" />
      </a>
    </motion.div>
  );
}
