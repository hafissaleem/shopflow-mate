import { useState, useEffect } from 'react';
import { 
  Store, Users, CreditCard, Truck, Receipt, Bell, Shield, Palette, Save,
  Trash2, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Hasna Cycle Center',
    storeEmail: 'support@hasnacyclecenter.com',
    storePhone: '+1 (234) 567-890',
    storeAddress: '123 Commerce Street, New York, NY 10001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  // WhatsApp settings state
  const [whatsappSettings, setWhatsappSettings] = useState({
    adminNumber: '',
    customerCareNumber: '',
    adminLabel: 'Send Order via WhatsApp',
    customerCareLabel: 'Customer Care',
  });

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    enableCOD: true,
    enableBankTransfer: true,
    enableUPI: true,
    enableOnlinePayment: false,
    codExtraCharge: 0,
    bankDetails: 'Bank Name: Example Bank\nAccount: 1234567890\nIFSC: EXMP0001234',
  });

  // Shipping settings state
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 1000,
    flatShippingRate: 50,
    enableFreeShipping: true,
    processingTime: '1-2 business days',
  });

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState({
    enableTax: true,
    taxRate: 18,
    taxName: 'GST',
    taxIncludedInPrice: false,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewOrder: true,
    emailOnLowStock: true,
    emailOnNewCustomer: false,
    lowStockThreshold: 5,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: 60,
  });

  // Fetch WhatsApp settings from database
  const { data: dbSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');
      if (error) throw error;
      return data;
    },
  });

  // Load WhatsApp settings from DB
  useEffect(() => {
    if (dbSettings) {
      const settingsMap: Record<string, string> = {};
      dbSettings.forEach((row: { key: string; value: string }) => {
        settingsMap[row.key] = row.value;
      });
      setWhatsappSettings({
        adminNumber: settingsMap['whatsapp_admin_number'] || '',
        customerCareNumber: settingsMap['whatsapp_customer_care_number'] || '',
        adminLabel: settingsMap['whatsapp_admin_label'] || 'Send Order via WhatsApp',
        customerCareLabel: settingsMap['whatsapp_customer_care_label'] || 'Customer Care',
      });
    }
  }, [dbSettings]);

  // Fetch admin users
  const { data: adminUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');
      
      if (error) throw error;
      
      if (!roles?.length) return [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', roles.map(r => r.user_id));
      
      return (profiles || []).map(p => ({
        id: p.user_id,
        email: p.email || '',
        full_name: p.full_name,
        role: 'admin' as const,
      }));
    },
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save WhatsApp settings to database
      const whatsappUpdates = [
        { key: 'whatsapp_admin_number', value: whatsappSettings.adminNumber },
        { key: 'whatsapp_customer_care_number', value: whatsappSettings.customerCareNumber },
        { key: 'whatsapp_admin_label', value: whatsappSettings.adminLabel },
        { key: 'whatsapp_customer_care_label', value: whatsappSettings.customerCareLabel },
      ];

      for (const update of whatsappUpdates) {
        const { error } = await supabase
          .from('store_settings')
          .update({ value: update.value })
          .eq('key', update.key);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Settings saved successfully!');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Save settings error:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAdminRole = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'customer' })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Admin role removed');
    },
    onError: () => {
      toast.error('Failed to remove admin role');
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'tax', label: 'Tax', icon: Receipt },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-bold">Settings</h1>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="btn-accent gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-lg border border-border data-[state=active]:border-accent"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={storeSettings.currency} onValueChange={(v) => setStoreSettings({ ...storeSettings, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={storeSettings.timezone} onValueChange={(v) => setStoreSettings({ ...storeSettings, timezone: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings - NEW */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" style={{ color: '#25D366' }} />
                WhatsApp Integration
              </CardTitle>
              <CardDescription>
                Configure WhatsApp numbers for order submissions and customer support.
                Customers will send their orders via WhatsApp after placing them on the website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="font-medium text-sm mb-2">📋 How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Customer places an order on the website (no online payment)</li>
                  <li>Order is saved and a formatted summary is generated</li>
                  <li>Customer clicks "Send to Admin via WhatsApp" to confirm</li>
                  <li>You receive the order details on WhatsApp and process manually</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-destructive">Admin WhatsApp (Order Submissions)</h3>
                <div className="space-y-2">
                  <Label htmlFor="adminNumber">Admin WhatsApp Number</Label>
                  <Input
                    id="adminNumber"
                    value={whatsappSettings.adminNumber}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, adminNumber: e.target.value })}
                    placeholder="+919876543210"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +91 for India). Confirmed orders will be sent here.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLabel">Button Label</Label>
                  <Input
                    id="adminLabel"
                    value={whatsappSettings.adminLabel}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, adminLabel: e.target.value })}
                    placeholder="Send Order via WhatsApp"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold" style={{ color: '#25D366' }}>Customer Care WhatsApp (Inquiries)</h3>
                <div className="space-y-2">
                  <Label htmlFor="customerCareNumber">Customer Care WhatsApp Number</Label>
                  <Input
                    id="customerCareNumber"
                    value={whatsappSettings.customerCareNumber}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, customerCareNumber: e.target.value })}
                    placeholder="+919876543210"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code. A floating button will appear on the website for customer inquiries.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerCareLabel">Button Label</Label>
                  <Input
                    id="customerCareLabel"
                    value={whatsappSettings.customerCareLabel}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, customerCareLabel: e.target.value })}
                    placeholder="Customer Care"
                    maxLength={50}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage administrators with access to this panel</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <p className="text-muted-foreground">Loading users...</p>
              ) : adminUsers.length === 0 ? (
                <p className="text-muted-foreground">No admin users found.</p>
              ) : (
                <div className="space-y-3">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="font-semibold text-accent">
                            {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Admin</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeAdminRole.mutate(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                To add a new admin, update the user's role in the database directly or create an invite system.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure accepted payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cash on Delivery (COD)</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to pay when they receive the order</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableCOD}
                    onCheckedChange={(v) => setPaymentSettings({ ...paymentSettings, enableCOD: v })}
                  />
                </div>
                {paymentSettings.enableCOD && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="codCharge">COD Extra Charge (₹)</Label>
                    <Input
                      id="codCharge"
                      type="number"
                      value={paymentSettings.codExtraCharge}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, codExtraCharge: Number(e.target.value) })}
                      className="max-w-[200px]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bank Transfer</Label>
                    <p className="text-sm text-muted-foreground">Accept direct bank transfers</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableBankTransfer}
                    onCheckedChange={(v) => setPaymentSettings({ ...paymentSettings, enableBankTransfer: v })}
                  />
                </div>
                {paymentSettings.enableBankTransfer && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="bankDetails">Bank Account Details</Label>
                    <Textarea
                      id="bankDetails"
                      value={paymentSettings.bankDetails}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankDetails: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>UPI Payment</Label>
                    <p className="text-sm text-muted-foreground">Accept UPI payments</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableUPI}
                    onCheckedChange={(v) => setPaymentSettings({ ...paymentSettings, enableUPI: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Online Payment Gateway</Label>
                    <p className="text-sm text-muted-foreground">Enable Stripe/Razorpay integration</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableOnlinePayment}
                    onCheckedChange={(v) => setPaymentSettings({ ...paymentSettings, enableOnlinePayment: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Configuration</CardTitle>
              <CardDescription>Set up shipping rates and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Free Shipping</Label>
                  <p className="text-sm text-muted-foreground">Offer free shipping above a certain order value</p>
                </div>
                <Switch
                  checked={shippingSettings.enableFreeShipping}
                  onCheckedChange={(v) => setShippingSettings({ ...shippingSettings, enableFreeShipping: v })}
                />
              </div>
              {shippingSettings.enableFreeShipping && (
                <div className="space-y-2">
                  <Label htmlFor="freeThreshold">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeThreshold"
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="max-w-[200px]"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="flatRate">Flat Shipping Rate (₹)</Label>
                <Input
                  id="flatRate"
                  type="number"
                  value={shippingSettings.flatShippingRate}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, flatShippingRate: Number(e.target.value) })}
                  className="max-w-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processingTime">Processing Time</Label>
                <Input
                  id="processingTime"
                  value={shippingSettings.processingTime}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, processingTime: e.target.value })}
                  placeholder="e.g., 1-2 business days"
                  className="max-w-[300px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>Set up tax rates for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Tax</Label>
                  <p className="text-sm text-muted-foreground">Apply tax to orders</p>
                </div>
                <Switch
                  checked={taxSettings.enableTax}
                  onCheckedChange={(v) => setTaxSettings({ ...taxSettings, enableTax: v })}
                />
              </div>
              {taxSettings.enableTax && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxName">Tax Name</Label>
                      <Input
                        id="taxName"
                        value={taxSettings.taxName}
                        onChange={(e) => setTaxSettings({ ...taxSettings, taxName: e.target.value })}
                        placeholder="e.g., GST, VAT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={taxSettings.taxRate}
                        onChange={(e) => setTaxSettings({ ...taxSettings, taxRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Prices Include Tax</Label>
                      <p className="text-sm text-muted-foreground">Product prices already include tax</p>
                    </div>
                    <Switch
                      checked={taxSettings.taxIncludedInPrice}
                      onCheckedChange={(v) => setTaxSettings({ ...taxSettings, taxIncludedInPrice: v })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure when you receive email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Order Notification</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                </div>
                <Switch
                  checked={notificationSettings.emailOnNewOrder}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, emailOnNewOrder: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Stock Alert</Label>
                  <p className="text-sm text-muted-foreground">Get notified when product stock is low</p>
                </div>
                <Switch
                  checked={notificationSettings.emailOnLowStock}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, emailOnLowStock: v })}
                />
              </div>
              {notificationSettings.emailOnLowStock && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={notificationSettings.lowStockThreshold}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockThreshold: Number(e.target.value) })}
                    className="max-w-[200px]"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Customer Notification</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a new customer signs up</p>
                </div>
                <Switch
                  checked={notificationSettings.emailOnNewCustomer}
                  onCheckedChange={(v) => setNotificationSettings({ ...notificationSettings, emailOnNewCustomer: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">New users must verify their email before signing in</p>
                </div>
                <Switch
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(v) => setSecuritySettings({ ...securitySettings, requireEmailVerification: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(v) => setSecuritySettings({ ...securitySettings, twoFactorAuth: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
                  className="max-w-[200px]"
                />
                <p className="text-sm text-muted-foreground">
                  Automatically log out inactive users after this duration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Store Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  {['#1e3a5f', '#2d5a3d', '#5a2d5a', '#5a3d2d', '#2d3d5a'].map((color) => (
                    <button
                      key={color}
                      className="h-10 w-10 rounded-lg border-2 border-transparent hover:border-accent transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  {['#d4a574', '#74b4d4', '#d474a5', '#a5d474', '#d4a5a5'].map((color) => (
                    <button
                      key={color}
                      className="h-10 w-10 rounded-lg border-2 border-transparent hover:border-accent transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Advanced theme customization is available through the Design panel.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
