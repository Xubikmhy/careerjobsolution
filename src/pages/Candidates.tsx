import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Eye, Trash2, Plus, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { CandidateFormModal } from '@/components/CandidateFormModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCandidates, CandidateDB } from '@/hooks/useCandidates';
import { Candidate } from '@/types';
import { generateCandidateCV } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Candidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { candidates, isLoading, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDB | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Auto-open form when action=add is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsFormOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (candidate.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || candidate.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  const handleAddCandidate = (data: Omit<Candidate, 'id' | 'createdAt'>) => {
    addCandidate.mutate({
      full_name: data.fullName,
      phone: data.phone,
      address: data.address || null,
      skills: data.skills,
      experience_years: data.experienceYears,
      education_level: data.educationLevel || null,
      expected_salary: data.expectedSalary,
      cv_url: data.cvUrl || null,
      status: data.status,
      date_of_birth: data.dateOfBirth || null,
      nationality: data.nationality || null,
      marital_status: data.maritalStatus || null,
      languages: data.languages || [],
      career_objective: data.careerObjective || null,
      reference_info: data.references || null,
      remarks: data.remarks || null,
    });
    setIsFormOpen(false);
  };

  const handleGenerateCV = (candidate: CandidateDB) => {
    // Convert DB format to Candidate type for PDF generator
    const candidateForPDF: Candidate = {
      id: candidate.id,
      fullName: candidate.full_name,
      phone: candidate.phone,
      address: candidate.address || '',
      skills: candidate.skills || [],
      experienceYears: candidate.experience_years,
      educationLevel: candidate.education_level || '',
      expectedSalary: candidate.expected_salary,
      cvUrl: candidate.cv_url || undefined,
      status: candidate.status as 'Active' | 'Placed',
      references: candidate.reference_info || undefined,
      remarks: candidate.remarks || undefined,
      createdAt: new Date(candidate.created_at),
      dateOfBirth: candidate.date_of_birth || undefined,
      nationality: candidate.nationality || undefined,
      maritalStatus: candidate.marital_status || undefined,
      languages: candidate.languages || [],
      careerObjective: candidate.career_objective || undefined,
    };
    generateCandidateCV(candidateForPDF);
    toast({
      title: 'CV Generated',
      description: `CV for ${candidate.full_name} has been downloaded.`,
    });
  };

  const handleDeleteCandidate = (id: string) => {
    deleteCandidate.mutate(id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Candidates"
          description="Manage job seekers and generate CVs"
          icon={Users}
        />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Candidates"
        description="Manage job seekers and generate CVs"
        icon={Users}
        action={{
          label: 'Add Candidate',
          onClick: () => setIsFormOpen(true),
          icon: Plus,
        }}
      />

      <SearchFilterBar
        searchPlaceholder="Search by name, location, or skill..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'Active', label: 'Active' },
              { value: 'Sent for Interview', label: 'Sent for Interview' },
              { value: 'Placed', label: 'Placed' },
            ],
          },
        ]}
        className="mb-6"
      />

      {/* Candidates Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead className="hidden lg:table-cell">Skills</TableHead>
              <TableHead className="hidden sm:table-cell">Experience</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{candidate.full_name}</p>
                      <p className="text-sm text-muted-foreground md:hidden">{candidate.address}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {candidate.address}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <SkillTagList skills={candidate.skills || []} max={3} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {candidate.experience_years} yrs
                  </TableCell>
                  <TableCell className="font-medium">
                    NPR {candidate.expected_salary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={candidate.status}
                      variant={getStatusVariant(candidate.status)}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {candidate.created_at ? format(new Date(candidate.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center justify-end gap-1">
                      {candidate.status === 'Active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            updateCandidate.mutate({ id: candidate.id, status: 'Sent for Interview' });
                          }}
                          title="Send for Interview"
                          className="text-warning hover:text-warning"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setIsViewOpen(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateCV(candidate)}
                        title="Generate CV"
                        className="text-primary hover:text-primary"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Candidate Modal */}
      <CandidateFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddCandidate}
      />

      {/* View Candidate Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedCandidate.full_name}
                  </h3>
                  <p className="text-muted-foreground">{selectedCandidate.address}</p>
                </div>
                <StatusBadge
                  status={selectedCandidate.status}
                  variant={getStatusVariant(selectedCandidate.status)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedCandidate.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Education</p>
                  <p className="font-medium">{selectedCandidate.education_level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{selectedCandidate.experience_years} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Salary</p>
                  <p className="font-medium">NPR {selectedCandidate.expected_salary.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Skills</p>
                <SkillTagList skills={selectedCandidate.skills || []} max={10} />
              </div>

              {selectedCandidate.reference_info && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">References</p>
                  <p className="text-foreground">{selectedCandidate.reference_info}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  onClick={() => handleGenerateCV(selectedCandidate)}
                  className="flex-1 gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Generate CV
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Candidates;
