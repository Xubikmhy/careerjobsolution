// Agency Settings utility for managing logo and branding
export interface AgencySettings {
  agencyName: string;
  logoUrl: string | null;
  logoBase64: string | null;
  phone: string;
  address: string;
  email: string;
}

const STORAGE_KEY = 'career_job_solution_settings';

const defaultSettings: AgencySettings = {
  agencyName: 'Career Job Solution',
  logoUrl: null,
  logoBase64: null,
  phone: '+977-61-XXXXXX',
  address: 'Pokhara, Nepal',
  email: 'info@careerjobsolution.com',
};

export const getAgencySettings = (): AgencySettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load agency settings:', e);
  }
  return defaultSettings;
};

export const saveAgencySettings = (settings: Partial<AgencySettings>): void => {
  try {
    const current = getAgencySettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save agency settings:', e);
  }
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
