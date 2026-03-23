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

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const [candidates, jobs, properties, tenants, placements, transactions, agencySettings, workExperiences] = await Promise.all([
        supabase.from('candidates').select('*'),
        supabase.from('job_requirements').select('*'),
        supabase.from('properties').select('*'),
        supabase.from('tenants').select('*'),
        supabase.from('placements').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('agency_settings').select('*'),
        supabase.from('work_experiences').select('*'),
      ]);

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        candidates: candidates.data || [],
        job_requirements: jobs.data || [],
        properties: properties.data || [],
        tenants: tenants.data || [],
        placements: placements.data || [],
        transactions: transactions.data || [],
        agency_settings: agencySettings.data || [],
        work_experiences: workExperiences.data || [],
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career-job-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Backup downloaded successfully' });
    } catch (err) {
      toast({ title: 'Backup failed', description: String(err), variant: 'destructive' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreLoading(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.version || !backup.candidates) {
        throw new Error('Invalid backup file');
      }

      // Clear existing data in order (respect foreign keys)
      await supabase.from('work_experiences').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('placements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('job_requirements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert backup data
      if (backup.candidates?.length) await supabase.from('candidates').insert(backup.candidates);
      if (backup.job_requirements?.length) await supabase.from('job_requirements').insert(backup.job_requirements);
      if (backup.properties?.length) await supabase.from('properties').insert(backup.properties);
      if (backup.tenants?.length) await supabase.from('tenants').insert(backup.tenants);
      if (backup.placements?.length) await supabase.from('placements').insert(backup.placements);
      if (backup.transactions?.length) await supabase.from('transactions').insert(backup.transactions);
      if (backup.work_experiences?.length) await supabase.from('work_experiences').insert(backup.work_experiences);

      toast({ title: 'Data restored successfully', description: 'Please refresh the page to see updated data.' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast({ title: 'Restore failed', description: String(err), variant: 'destructive' });
    } finally {
      setRestoreLoading(false);
      if (restoreInputRef.current) restoreInputRef.current.value = '';
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

        {/* Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>
              Download all your data as a JSON file or restore from a previous backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleBackup} disabled={backupLoading} className="flex-1">
                {backupLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {backupLoading ? 'Preparing...' : 'Download Backup'}
              </Button>
              <input
                ref={restoreInputRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
              />
              <Button variant="outline" onClick={() => restoreInputRef.current?.click()} disabled={restoreLoading} className="flex-1">
                {restoreLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                {restoreLoading ? 'Restoring...' : 'Restore from Backup'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Backup includes all candidates, jobs, properties, tenants, placements, transactions, and settings.
              Restoring will replace all existing data.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
