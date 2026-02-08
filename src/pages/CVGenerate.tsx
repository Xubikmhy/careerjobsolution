import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Users, Sparkles, Eye, Loader2 } from 'lucide-react';
import { useCandidates, CandidateDB } from '@/hooks/useCandidates';
import { CVData, TemplateId, TEMPLATES, generateCV } from '@/components/CVTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const CVGenerate = () => {
  const { candidates, isLoading } = useCandidates();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('professional');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<Partial<CVData> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  const buildCVData = (candidate: CandidateDB, enhanced?: Partial<CVData> | null): CVData => ({
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

  const handleEnhanceWithAI = async () => {
    if (!selectedCandidate) return;
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-cv', {
        body: {
          candidate: {
            fullName: selectedCandidate.full_name,
            phone: selectedCandidate.phone,
            address: selectedCandidate.address,
            experienceYears: selectedCandidate.experience_years,
            educationLevel: selectedCandidate.education_level,
            skills: selectedCandidate.skills,
            expectedSalary: selectedCandidate.expected_salary,
            nationality: selectedCandidate.nationality,
            languages: selectedCandidate.languages,
            careerObjective: selectedCandidate.career_objective,
            dateOfBirth: selectedCandidate.date_of_birth,
            maritalStatus: selectedCandidate.marital_status,
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
    if (!selectedCandidate) return;
    const cvData = buildCVData(selectedCandidate, enhancedData);
    const doc = generateCV(cvData, selectedTemplate);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const handleDownload = () => {
    if (!selectedCandidate) return;
    const cvData = buildCVData(selectedCandidate, enhancedData);
    const doc = generateCV(cvData, selectedTemplate);
    doc.save(`CV_${selectedCandidate.full_name.replace(/\s+/g, '_')}.pdf`);
    toast.success(`CV downloaded for ${selectedCandidate.full_name}`);
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Select Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                disabled={!selectedCandidateId || isEnhancing}
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
                disabled={!selectedCandidateId}
                variant="outline"
                className="w-full gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview CV
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!selectedCandidateId}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
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
                {selectedCandidate ? (
                  <motion.div
                    key={selectedCandidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-foreground">{selectedCandidate.full_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{selectedCandidate.experience_years} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Education</p>
                        <p className="font-medium">{selectedCandidate.education_level || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(selectedCandidate.skills || []).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Salary</p>
                      <p className="font-semibold text-success">NPR {selectedCandidate.expected_salary.toLocaleString()}</p>
                    </div>

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
                    <p>Select a candidate to preview</p>
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
