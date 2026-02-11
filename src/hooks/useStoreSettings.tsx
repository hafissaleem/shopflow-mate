import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StoreSettings {
  whatsapp_admin_number: string;
  whatsapp_customer_care_number: string;
  whatsapp_admin_label: string;
  whatsapp_customer_care_label: string;
  shipping_enable_free: string;
  shipping_free_threshold: string;
  shipping_flat_rate: string;
  shipping_processing_time: string;
  tax_enabled: string;
  tax_rate: string;
  tax_name: string;
  tax_included_in_price: string;
  [key: string]: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp_admin_number: '',
  whatsapp_customer_care_number: '',
  whatsapp_admin_label: 'Send Order via WhatsApp',
  whatsapp_customer_care_label: 'Customer Care',
  shipping_enable_free: 'true',
  shipping_free_threshold: '1000',
  shipping_flat_rate: '50',
  shipping_processing_time: '1-2 business days',
  tax_enabled: 'true',
  tax_rate: '18',
  tax_name: 'GST',
  tax_included_in_price: 'false',
};

export function useStoreSettings() {
  const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching store settings:', error);
        return DEFAULT_SETTINGS;
      }

      const settingsMap = { ...DEFAULT_SETTINGS };
      data?.forEach((row: { key: string; value: string }) => {
        settingsMap[row.key] = row.value;
      });
      return settingsMap as StoreSettings;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { settings, isLoading };
}
