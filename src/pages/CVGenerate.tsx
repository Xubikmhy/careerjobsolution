import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Users } from 'lucide-react';
import { useCandidates } from '@/hooks/useCandidates';
import { generateCandidateCV } from '@/utils/pdfGenerator';
import { Candidate } from '@/types';
import { toast } from 'sonner';

const CVGenerate = () => {
  const { candidates, isLoading } = useCandidates();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  const handleGenerateCV = () => {
    if (!selectedCandidateId) {
      toast.error('Please select a candidate first');
      return;
    }

    const candidateDB = candidates.find(c => c.id === selectedCandidateId);
    if (candidateDB) {
      // Convert DB format to Candidate type for PDF generator
      const candidateForPDF: Candidate = {
        id: candidateDB.id,
        fullName: candidateDB.full_name,
        phone: candidateDB.phone,
        address: candidateDB.address || '',
        skills: candidateDB.skills || [],
        experienceYears: candidateDB.experience_years,
        educationLevel: candidateDB.education_level || '',
        expectedSalary: candidateDB.expected_salary,
        cvUrl: candidateDB.cv_url || undefined,
        status: candidateDB.status as 'Active' | 'Placed',
        references: candidateDB.reference_info || undefined,
        remarks: candidateDB.remarks || undefined,
        createdAt: new Date(candidateDB.created_at),
        dateOfBirth: candidateDB.date_of_birth || undefined,
        nationality: candidateDB.nationality || undefined,
        maritalStatus: candidateDB.marital_status || undefined,
        languages: candidateDB.languages || [],
        careerObjective: candidateDB.career_objective || undefined,
      };
      generateCandidateCV(candidateForPDF);
      toast.success(`CV generated for ${candidateDB.full_name}`);
    }
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="CV Generate"
          description="Generate professional CVs for candidates"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="CV Generate"
        description="Generate professional CVs for candidates"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* CV Generation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate CV
            </CardTitle>
            <CardDescription>
              Select a candidate to generate their professional CV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Candidate</label>
              <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a candidate..." />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.full_name} - {(candidate.skills || [])[0] || 'No skills listed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateCV} 
              disabled={!selectedCandidateId}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate & Download CV
            </Button>
          </CardContent>
        </Card>

        {/* Candidate Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Candidate Preview
            </CardTitle>
            <CardDescription>
              Preview candidate details before generating
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCandidate ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedCandidate.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{selectedCandidate.experience_years} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p className="font-medium">{selectedCandidate.education_level || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedCandidate.skills || []).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Salary</p>
                  <p className="font-medium">NPR {selectedCandidate.expected_salary.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a candidate to preview their details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CV Generation Stats</CardTitle>
          <CardDescription>Overview of available candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{candidates.length}</p>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {candidates.filter(c => c.status === 'Active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">NPR 150</p>
              <p className="text-sm text-muted-foreground">CV Fee</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CVGenerate;
