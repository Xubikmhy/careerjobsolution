import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Users, Sparkles, Eye, Loader2, UserPlus } from 'lucide-react';
import { useCandidates, CandidateDB } from '@/hooks/useCandidates';
import { CVData, TemplateId, TEMPLATES, generateCV } from '@/components/CVTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewCandidateCVForm, defaultNewCandidate, NewCandidateData } from '@/components/NewCandidateCVForm';

const CVGenerate = () => {
  const { candidates, isLoading, addCandidate } = useCandidates();
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('professional');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<Partial<CVData> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCandidateData, setNewCandidateData] = useState<NewCandidateData>({ ...defaultNewCandidate });
  const [isSaving, setIsSaving] = useState(false);

  const selectedCandidate = mode === 'existing' ? candidates.find(c => c.id === selectedCandidateId) : null;

  const isNewCandidateValid = mode === 'new' && newCandidateData.full_name.length >= 2 && newCandidateData.phone.length >= 10;
  const canAct = mode === 'existing' ? !!selectedCandidateId : isNewCandidateValid;

  const buildCVDataFromCandidate = (candidate: CandidateDB, enhanced?: Partial<CVData> | null): CVData => ({
    fullName: candidate.full_name,
    phone: candidate.phone,
    address: candidate.address || '',
    dateOfBirth: candidate.date_of_birth || undefined,
    nationality: candidate.nationality || 'Nepali',
    maritalStatus: candidate.marital_status || undefined,
    languages: candidate.languages || [],
    educationLevel: candidate.education_level || '',
    experienceYears: candidate.experience_years,
    expectedSalary: candidate.expected_salary,
    skills: enhanced?.enhancedSkills || candidate.skills || [],
    careerObjective: enhanced?.careerObjective || candidate.career_objective || undefined,
    professionalSummary: enhanced?.professionalSummary || undefined,
    workExperiences: enhanced?.workExperiences || undefined,
    declaration: enhanced?.declaration || undefined,
    references: candidate.reference_info || undefined,
  });

  const buildCVDataFromNew = (d: NewCandidateData, enhanced?: Partial<CVData> | null): CVData => ({
    fullName: d.full_name,
    phone: d.phone,
    address: d.address || '',
    dateOfBirth: d.date_of_birth || undefined,
    nationality: d.nationality || 'Nepali',
    maritalStatus: d.marital_status || undefined,
    languages: d.languages || [],
    educationLevel: d.education_level || '',
    experienceYears: d.experience_years,
    expectedSalary: d.expected_salary,
    skills: enhanced?.enhancedSkills || d.skills || [],
    careerObjective: enhanced?.careerObjective || d.career_objective || undefined,
    professionalSummary: enhanced?.professionalSummary || undefined,
    workExperiences: enhanced?.workExperiences || undefined,
    declaration: enhanced?.declaration || undefined,
    references: d.reference_info || undefined,
  });

  const getCVData = (enhanced?: Partial<CVData> | null): CVData | null => {
    if (mode === 'existing' && selectedCandidate) return buildCVDataFromCandidate(selectedCandidate, enhanced);
    if (mode === 'new' && isNewCandidateValid) return buildCVDataFromNew(newCandidateData, enhanced);
    return null;
  };

  const getCandidatePayload = (): any => {
    if (mode === 'existing' && selectedCandidate) return selectedCandidate;
    if (mode === 'new') return newCandidateData;
    return null;
  };

  const handleEnhanceWithAI = async () => {
    const payload = getCandidatePayload();
    if (!payload) return;
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-cv', {
        body: {
          candidate: {
            fullName: payload.full_name,
            phone: payload.phone,
            address: payload.address,
            experienceYears: payload.experience_years,
            educationLevel: payload.education_level,
            skills: payload.skills,
            expectedSalary: payload.expected_salary,
            nationality: payload.nationality,
            languages: payload.languages,
            careerObjective: payload.career_objective,
            dateOfBirth: payload.date_of_birth,
            maritalStatus: payload.marital_status,
          },
          template: selectedTemplate,
        },
      });

      if (error) throw error;
      setEnhancedData(data);
      toast.success('CV content enhanced with AI!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to enhance CV with AI');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePreview = () => {
    const cvData = getCVData(enhancedData);
    if (!cvData) return;
    const doc = generateCV(cvData, selectedTemplate);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const handleDownload = async () => {
    const cvData = getCVData(enhancedData);
    if (!cvData) return;
    const doc = generateCV(cvData, selectedTemplate);
    const name = cvData.fullName;
    doc.save(`CV_${name.replace(/\s+/g, '_')}.pdf`);
    toast.success(`CV downloaded for ${name}`);

    // Auto-save new candidate to database
    if (mode === 'new' && isNewCandidateValid) {
      setIsSaving(true);
      try {
        await addCandidate.mutateAsync(newCandidateData);
        toast.success(`${newCandidateData.full_name} has been added as a candidate!`);
        setNewCandidateData({ ...defaultNewCandidate });
        setMode('existing');
        setEnhancedData(null);
        setPreviewUrl(null);
      } catch (e: any) {
        toast.error(`CV downloaded but failed to save candidate: ${e.message}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="AI CV Builder" description="Generate professional CVs with AI enhancement" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="AI CV Builder" description="Generate professional CVs with AI-powered content enhancement" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Config */}
        <div className="space-y-6">
          {/* Candidate Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={(v) => { setMode(v as 'existing' | 'new'); setEnhancedData(null); setPreviewUrl(null); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing" className="gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> Existing
                  </TabsTrigger>
                  <TabsTrigger value="new" className="gap-1.5 text-xs">
                    <UserPlus className="h-3.5 w-3.5" /> New
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <AnimatePresence mode="wait">
                {mode === 'existing' ? (
                  <motion.div key="existing" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Select value={selectedCandidateId} onValueChange={(v) => { setSelectedCandidateId(v); setEnhancedData(null); setPreviewUrl(null); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a candidate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name} — {(c.skills || [])[0] || 'No skills'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                ) : (
                  <motion.div key="new" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <NewCandidateCVForm data={newCandidateData} onChange={setNewCandidateData} />
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <UserPlus className="h-3 w-3" />
                      Candidate will be auto-saved on download
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Template</CardTitle>
              <CardDescription>Select a CV design style</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TEMPLATES.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedTemplate(t.id); setPreviewUrl(null); }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === t.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <div>
                        <p className="font-medium text-sm text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={handleEnhanceWithAI}
                disabled={!canAct || isEnhancing}
                className="w-full gap-2"
                variant="outline"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Enhance with AI
                  </>
                )}
              </Button>
              <Button
                onClick={handlePreview}
                disabled={!canAct}
                variant="outline"
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview CV
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!canAct || isSaving}
                className="w-full gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Candidate...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {mode === 'new' ? 'Download & Save Candidate' : 'Download PDF'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle: Candidate Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Candidate Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {(selectedCandidate || (mode === 'new' && isNewCandidateValid)) ? (
                  <motion.div
                    key={mode === 'new' ? 'new-candidate' : selectedCandidate?.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {(() => {
                      const c = mode === 'existing' && selectedCandidate
                        ? selectedCandidate
                        : { ...newCandidateData, id: 'new' } as CandidateDB & { id: string };
                      return (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="font-semibold text-foreground">{c.full_name}</p>
                            {mode === 'new' && <Badge variant="outline" className="text-xs mt-1">New Candidate</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Experience</p>
                              <p className="font-medium">{c.experience_years} years</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Education</p>
                              <p className="font-medium">{c.education_level || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Skills</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(c.skills || []).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                              ))}
                              {(c.skills || []).length === 0 && <p className="text-xs text-muted-foreground">No skills added</p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expected Salary</p>
                            <p className="font-semibold text-success">NPR {c.expected_salary.toLocaleString()}</p>
                          </div>
                        </>
                      );
                    })()}

                    {enhancedData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20"
                      >
                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          AI Enhancement Applied
                        </p>
                        {enhancedData.careerObjective && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                            <strong>Objective:</strong> {enhancedData.careerObjective}
                          </p>
                        )}
                        {enhancedData.enhancedSkills && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Skills:</strong> {enhancedData.enhancedSkills.length} skills identified
                          </p>
                        )}
                        {enhancedData.workExperiences && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <strong>Experience:</strong> {enhancedData.workExperiences.length} entries generated
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{mode === 'new' ? 'Fill in candidate details' : 'Select a candidate to preview'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-primary">{candidates.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-success">{candidates.filter(c => c.status === 'Active').length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-primary">NPR 150</p>
                  <p className="text-xs text-muted-foreground">CV Fee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live PDF Preview */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Live Preview
            </CardTitle>
            <CardDescription>Preview your CV before downloading</CardDescription>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-border rounded-lg overflow-hidden"
              >
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px]"
                  title="CV Preview"
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">Click "Preview CV" to see</p>
                <p className="text-muted-foreground text-xs mt-1">your generated document here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CVGenerate;
