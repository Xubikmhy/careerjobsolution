import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Candidate, WorkExperience } from '@/types';
import { SkillTag } from '@/components/SkillTag';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const candidateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  address: z.string().min(2, 'Address is required'),
  educationLevel: z.string().min(1, 'Select education level'),
  experienceYears: z.coerce.number().min(0, 'Experience must be 0 or more'),
  expectedSalary: z.coerce.number().min(1000, 'Enter expected salary'),
  references: z.string().optional(),
  remarks: z.string().optional(),
  // Enhanced CV fields
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  careerObjective: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface CandidateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Candidate, 'id' | 'createdAt'>) => void;
  initialData?: Candidate;
}

const educationOptions = [
  'Below SLC',
  'SLC',
  'Class 10',
  'Class 12 / +2',
  'Bachelor',
  'Master',
  'Other',
];

const maritalStatusOptions = ['Single', 'Married', 'Widowed', 'Divorced'];

const commonSkills = [
  'Cooking',
  'Customer Service',
  'English',
  'Hindi',
  'Driving',
  'Computer',
  'Cleaning',
  'Security',
  'Receptionist',
  'Waiter',
  'Housekeeping',
  'Laundry',
  'Mechanic',
  'Delivery',
  'Sales',
];

const commonLanguages = ['Nepali', 'English', 'Hindi', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];

interface ReferenceContact {
  name: string;
  company: string;
  phone: string;
  relationship: string;
}

export function CandidateFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CandidateFormModalProps) {
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(initialData?.languages || ['Nepali']);
  const [workHistory, setWorkHistory] = useState<WorkExperience[]>(initialData?.workHistory || []);
  const [referenceContacts, setReferenceContacts] = useState<ReferenceContact[]>(
    initialData?.referenceContacts || []
  );

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      educationLevel: initialData?.educationLevel || '',
      experienceYears: initialData?.experienceYears || 0,
      expectedSalary: initialData?.expectedSalary || 15000,
      references: initialData?.references || '',
      remarks: initialData?.remarks || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      nationality: initialData?.nationality || 'Nepali',
      maritalStatus: initialData?.maritalStatus || '',
      careerObjective: initialData?.careerObjective || '',
    },
  });

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const addWorkExperience = () => {
    setWorkHistory([
      ...workHistory,
      { company: '', position: '', duration: '', responsibilities: '' },
    ]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setWorkHistory(updated);
  };

  const removeWorkExperience = (index: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };

  const addReferenceContact = () => {
    setReferenceContacts([
      ...referenceContacts,
      { name: '', company: '', phone: '', relationship: '' },
    ]);
  };

  const updateReferenceContact = (index: number, field: keyof ReferenceContact, value: string) => {
    const updated = [...referenceContacts];
    updated[index] = { ...updated[index], [field]: value };
    setReferenceContacts(updated);
  };

  const removeReferenceContact = (index: number) => {
    setReferenceContacts(referenceContacts.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: CandidateFormData) => {
    if (skills.length === 0) {
      toast({
        title: 'Skills required',
        description: 'Please add at least one skill',
        variant: 'destructive',
      });
      return;
    }

    const candidateData: Omit<Candidate, 'id' | 'createdAt'> = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      educationLevel: formData.educationLevel,
      experienceYears: formData.experienceYears,
      expectedSalary: formData.expectedSalary,
      references: formData.references,
      remarks: formData.remarks,
      skills,
      status: 'Active',
      // Enhanced CV fields
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      maritalStatus: formData.maritalStatus,
      careerObjective: formData.careerObjective,
      languages,
      workHistory: workHistory.filter((w) => w.company && w.position),
      referenceContacts: referenceContacts.filter((r) => r.name && r.phone),
    };

    onSubmit(candidateData);

    form.reset();
    setSkills([]);
    setLanguages(['Nepali']);
    setWorkHistory([]);
    setReferenceContacts([]);
    onOpenChange(false);

    toast({
      title: 'Success',
      description: 'Candidate added successfully',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Candidate' : 'Add New Candidate'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ram Bahadur Gurung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+977-98XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lakeside, Pokhara" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Nepali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatusOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {educationOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (Years) *</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Salary (NPR) *</FormLabel>
                        <FormControl>
                          <Input type="number" min={1000} step={1000} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="careerObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Career Objective</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief career objective statement for the CV..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Internal Notes)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any internal notes about this candidate..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-4 mt-4">
                {/* Languages */}
                <div className="space-y-3">
                  <FormLabel>Languages Spoken</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {commonLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          languages.includes(lang)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <FormLabel>Skills *</FormLabel>

                  {/* Quick Add Common Skills */}
                  <div className="flex flex-wrap gap-2">
                    {commonSkills
                      .filter((s) => !skills.includes(s))
                      .slice(0, 10)
                      .map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="px-2.5 py-1 text-xs rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>

                  {/* Custom Skill Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSkill(skillInput)}
                      disabled={!skillInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Selected Skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                      {skills.map((skill) => (
                        <SkillTag
                          key={skill}
                          skill={skill}
                          onRemove={() => removeSkill(skill)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-base">Work Experience</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>

                {workHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                    No work experience added yet. Click "Add Experience" to add.
                  </p>
                )}

                {workHistory.map((work, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive"
                      onClick={() => removeWorkExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <FormLabel className="text-sm">Company Name</FormLabel>
                        <Input
                          placeholder="e.g., Hotel Mountain View"
                          value={work.company}
                          onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-sm">Position/Role</FormLabel>
                        <Input
                          placeholder="e.g., Cook, Waiter"
                          value={work.position}
                          onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <FormLabel className="text-sm">Duration</FormLabel>
                      <Input
                        placeholder="e.g., 2021 - 2023 or 2 years"
                        value={work.duration}
                        onChange={(e) => updateWorkExperience(index, 'duration', e.target.value)}
                      />
                    </div>

                    <div>
                      <FormLabel className="text-sm">Responsibilities</FormLabel>
                      <Textarea
                        placeholder="Describe main duties and responsibilities..."
                        value={work.responsibilities}
                        onChange={(e) =>
                          updateWorkExperience(index, 'responsibilities', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* References Tab */}
              <TabsContent value="references" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="references"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quick Reference Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Hotel Barahi - Mr. Sharma (+977-9841234567)"
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center pt-4">
                  <FormLabel className="text-base">Detailed Reference Contacts</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addReferenceContact}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Reference
                  </Button>
                </div>

                {referenceContacts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
                    No reference contacts added. Click "Add Reference" for detailed entries.
                  </p>
                )}

                {referenceContacts.map((ref, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive"
                      onClick={() => removeReferenceContact(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <FormLabel className="text-sm">Name</FormLabel>
                        <Input
                          placeholder="Reference person name"
                          value={ref.name}
                          onChange={(e) => updateReferenceContact(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-sm">Phone</FormLabel>
                        <Input
                          placeholder="+977-98XXXXXXXX"
                          value={ref.phone}
                          onChange={(e) => updateReferenceContact(index, 'phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <FormLabel className="text-sm">Company/Organization</FormLabel>
                        <Input
                          placeholder="e.g., Hotel Barahi"
                          value={ref.company}
                          onChange={(e) => updateReferenceContact(index, 'company', e.target.value)}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-sm">Relationship</FormLabel>
                        <Input
                          placeholder="e.g., Former Manager"
                          value={ref.relationship}
                          onChange={(e) =>
                            updateReferenceContact(index, 'relationship', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
