import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Eye, Trash2, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { CandidateFormModal } from '@/components/CandidateFormModal';
import { Button } from '@/components/ui/button';
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
import { mockCandidates } from '@/data/mockData';
import { Candidate } from '@/types';
import { generateCandidateCV } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

const Candidates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
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
        candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || candidate.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  const handleAddCandidate = (data: Omit<Candidate, 'id' | 'createdAt'>) => {
    const newCandidate: Candidate = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date(),
    };
    setCandidates([newCandidate, ...candidates]);
  };

  const handleGenerateCV = (candidate: Candidate) => {
    generateCandidateCV(candidate);
    toast({
      title: 'CV Generated',
      description: `CV for ${candidate.fullName} has been downloaded.`,
    });
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
    toast({
      title: 'Candidate Deleted',
      description: 'The candidate has been removed.',
    });
  };

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{candidate.fullName}</p>
                      <p className="text-sm text-muted-foreground md:hidden">{candidate.address}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {candidate.address}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <SkillTagList skills={candidate.skills} max={3} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {candidate.experienceYears} yrs
                  </TableCell>
                  <TableCell className="font-medium">
                    NPR {candidate.expectedSalary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={candidate.status}
                      variant={getStatusVariant(candidate.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
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
                    {selectedCandidate.fullName}
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
                  <p className="font-medium">{selectedCandidate.educationLevel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{selectedCandidate.experienceYears} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Salary</p>
                  <p className="font-medium">NPR {selectedCandidate.expectedSalary.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Skills</p>
                <SkillTagList skills={selectedCandidate.skills} max={10} />
              </div>

              {selectedCandidate.references && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">References</p>
                  <p className="text-foreground">{selectedCandidate.references}</p>
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
