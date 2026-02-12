import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { generateWhatsAppLink, generateInquiryMessage } from '@/lib/whatsapp';

export function WhatsAppFloatingButton() {
  const { settings } = useStoreSettings();
  const customerCareNumber = settings.whatsapp_customer_care_number;
  const whatsappLink = customerCareNumber
    ? generateWhatsAppLink(customerCareNumber, generateInquiryMessage())
    : '';

  if (!whatsappLink) return null;

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-4 right-3 sm:bottom-6 sm:right-5 z-50 flex items-center justify-center h-11 w-11 sm:h-13 sm:w-13 rounded-full shadow-lg active:scale-95 transition-transform"
      style={{ backgroundColor: '#25D366' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="white" />
    </motion.a>
  );
}
