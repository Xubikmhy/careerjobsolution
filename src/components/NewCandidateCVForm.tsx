import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { CandidateDB } from '@/hooks/useCandidates';

export type NewCandidateData = Omit<CandidateDB, 'id' | 'created_at'>;

interface NewCandidateCVFormProps {
  data: NewCandidateData;
  onChange: (data: NewCandidateData) => void;
}

const educationOptions = ['Below SLC', 'SLC', 'Class 10', 'Class 12 / +2', 'Bachelor', 'Master', 'Other'];
const maritalStatusOptions = ['Single', 'Married', 'Widowed', 'Divorced'];
const commonSkills = ['Cooking', 'Customer Service', 'English', 'Hindi', 'Driving', 'Computer', 'Cleaning', 'Security', 'Housekeeping', 'Sales'];
const commonLanguages = ['Nepali', 'English', 'Hindi', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];

export const defaultNewCandidate: NewCandidateData = {
  full_name: '',
  phone: '',
  address: null,
  skills: [],
  experience_years: 0,
  education_level: null,
  expected_salary: 15000,
  cv_url: null,
  status: 'Active',
  date_of_birth: null,
  nationality: 'Nepali',
  marital_status: null,
  languages: ['Nepali'],
  career_objective: null,
  reference_info: null,
  remarks: null,
};

export function NewCandidateCVForm({ data, onChange }: NewCandidateCVFormProps) {
  const [skillInput, setSkillInput] = useState('');

  const update = (partial: Partial<NewCandidateData>) => onChange({ ...data, ...partial });

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !(data.skills || []).includes(s)) {
      update({ skills: [...(data.skills || []), s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => update({ skills: (data.skills || []).filter(s => s !== skill) });

  const toggleLanguage = (lang: string) => {
    const langs = data.languages || [];
    update({ languages: langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang] });
  };

  return (
    <div className="space-y-4">
      {/* Name & Phone */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label className="text-xs">Full Name *</Label>
          <Input placeholder="e.g., Ram Bahadur Gurung" value={data.full_name} onChange={e => update({ full_name: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Phone *</Label>
          <Input placeholder="+977-98XXXXXXXX" value={data.phone} onChange={e => update({ phone: e.target.value })} />
        </div>
      </div>

      {/* Address */}
      <div>
        <Label className="text-xs">Address</Label>
        <Input placeholder="e.g., Lakeside, Pokhara" value={data.address || ''} onChange={e => update({ address: e.target.value })} />
      </div>

      {/* DOB, Nationality, Marital */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Date of Birth</Label>
          <Input type="date" value={data.date_of_birth || ''} onChange={e => update({ date_of_birth: e.target.value || null })} />
        </div>
        <div>
          <Label className="text-xs">Nationality</Label>
          <Input value={data.nationality || ''} onChange={e => update({ nationality: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Marital Status</Label>
          <Select value={data.marital_status || ''} onValueChange={v => update({ marital_status: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {maritalStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Education, Experience, Salary */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Education *</Label>
          <Select value={data.education_level || ''} onValueChange={v => update({ education_level: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {educationOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Experience (Years)</Label>
          <Input type="number" min={0} value={data.experience_years} onChange={e => update({ experience_years: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Expected Salary</Label>
          <Input type="number" min={0} step={1000} value={data.expected_salary} onChange={e => update({ expected_salary: Number(e.target.value) })} />
        </div>
      </div>

      {/* Languages */}
      <div>
        <Label className="text-xs">Languages</Label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {commonLanguages.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                (data.languages || []).includes(lang)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label className="text-xs">Skills</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {commonSkills.filter(s => !(data.skills || []).includes(s)).slice(0, 8).map(skill => (
            <button key={skill} type="button" onClick={() => addSkill(skill)}
              className="px-2 py-0.5 text-xs rounded border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + {skill}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input placeholder="Custom skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
            className="h-8 text-xs" />
          <Button type="button" size="sm" variant="outline" onClick={() => addSkill(skillInput)} className="h-8">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {(data.skills || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(data.skills || []).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs gap-1">
                {skill}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Career Objective */}
      <div>
        <Label className="text-xs">Career Objective</Label>
        <Textarea placeholder="Brief career objective..." className="min-h-[60px] text-xs"
          value={data.career_objective || ''} onChange={e => update({ career_objective: e.target.value || null })} />
      </div>

      {/* Reference */}
      <div>
        <Label className="text-xs">Reference Info</Label>
        <Input placeholder="e.g., Mr. Sharma, +977-98XXXXXXXX" value={data.reference_info || ''}
          onChange={e => update({ reference_info: e.target.value || null })} />
      </div>
    </div>
  );
}
