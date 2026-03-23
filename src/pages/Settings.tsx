import { useState, useRef, useEffect } from 'react';
import { Upload, Save, Trash2, Building2, Download, UploadCloud, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { convertFileToBase64 } from '@/utils/agencySettings';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const { settings, isLoading, updateSettings } = useAgencySettings();
  const [localSettings, setLocalSettings] = useState({
    agencyName: '',
    phone: '',
    address: '',
    email: '',
    logoUrl: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        agencyName: settings.agency_name || 'Career Job Solution',
        phone: settings.phone || '',
        address: settings.address || '',
        email: settings.email || '',
        logoUrl: settings.logo_url || '',
      });
      setLogoPreview(settings.logo_url);
    }
  }, [settings]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setLogoPreview(base64);
      setLocalSettings((prev) => ({ ...prev, logoUrl: base64 }));
      toast({
        title: 'Logo uploaded',
        description: 'Click Save to apply changes',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to process the image',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLocalSettings((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    updateSettings.mutate({
      agency_name: localSettings.agencyName,
      phone: localSettings.phone,
      address: localSettings.address,
      email: localSettings.email,
      logo_url: localSettings.logoUrl || null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Settings"
          description="Manage your agency branding and configuration"
        />
        <div className="grid gap-6 max-w-2xl">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        description="Manage your agency branding and configuration"
      />

      <div className="grid gap-6 max-w-2xl">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Logo</CardTitle>
            <CardDescription>
              Upload your logo to display in the sidebar and embed as a watermark in generated CVs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                {logoPreview && (
                  <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: Square image, PNG or JPG, max 5MB. The logo will appear with low transparency as a watermark on CVs.
            </p>
          </CardContent>
        </Card>

        {/* Agency Information */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>
              This information will appear on generated CVs and documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                value={localSettings.agencyName}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, agencyName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={localSettings.phone}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={localSettings.email}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={localSettings.address}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
