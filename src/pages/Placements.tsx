import { useState } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Building2,
  Home,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { usePlacements } from '@/hooks/usePlacements';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useTenants } from '@/hooks/useTenants';
import { useProperties } from '@/hooks/useProperties';
import { FEES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Placements = () => {
  const { placements, isLoading: placementsLoading, addPlacement, updatePlacement } = usePlacements();
  const { candidates } = useCandidates();
  const { jobs } = useJobs();
  const { tenants } = useTenants();
  const { properties } = useProperties();
  
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isRentalFormOpen, setIsRentalFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');

  const [jobFormData, setJobFormData] = useState({
    candidateId: '',
    jobId: '',
    agreedSalary: '',
    notes: '',
  });

  const [rentalFormData, setRentalFormData] = useState({
    tenantId: '',
    propertyId: '',
    commissionAmount: '',
    notes: '',
  });

  const activeCandidates = candidates.filter((c) => c.status === 'Active');
  const openJobs = jobs.filter((j) => j.status === 'Open');
  const vacantProperties = properties.filter((p) => p.status === 'Vacant');

  const handleAddJobPlacement = () => {
    if (!jobFormData.candidateId || !jobFormData.jobId || !jobFormData.agreedSalary) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const candidate = candidates.find((c) => c.id === jobFormData.candidateId);
    const job = jobs.find((j) => j.id === jobFormData.jobId);
    const salary = parseFloat(jobFormData.agreedSalary);
    const commission = Math.round(salary * (FEES.JOB_COMMISSION_PERCENT / 100));

    addPlacement.mutate({
      candidate_id: jobFormData.candidateId,
      job_id: jobFormData.jobId,
      candidate_name: candidate?.full_name || null,
      job_title: job?.role_title || null,
      employer_name: job?.company_name || null,
      placed_date: new Date().toISOString().split('T')[0],
      agreed_salary: salary,
      commission_amount: commission,
      commission_paid: false,
      notes: jobFormData.notes || null,
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    setIsJobFormOpen(false);
    setJobFormData({ candidateId: '', jobId: '', agreedSalary: '', notes: '' });
  };

  const handleAddRentalPlacement = () => {
    if (!rentalFormData.tenantId || !rentalFormData.propertyId || !rentalFormData.commissionAmount) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const tenant = tenants.find((t) => t.id === rentalFormData.tenantId);
    const property = properties.find((p) => p.id === rentalFormData.propertyId);

    // For now, we'll store rental placements in the same placements table
    // In a full implementation, you might want a separate rental_placements table
    addPlacement.mutate({
      candidate_id: null,
      job_id: null,
      candidate_name: tenant?.full_name || null,
      job_title: `${property?.type} at ${property?.location}` || null,
      employer_name: property?.landlord_name || null,
      placed_date: new Date().toISOString().split('T')[0],
      agreed_salary: property?.rent_amount || 0,
      commission_amount: parseFloat(rentalFormData.commissionAmount),
      commission_paid: false,
      notes: rentalFormData.notes || null,
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    setIsRentalFormOpen(false);
    setRentalFormData({ tenantId: '', propertyId: '', commissionAmount: '', notes: '' });
  };

  const toggleCommissionPaid = (id: string, currentPaid: boolean) => {
    updatePlacement.mutate({
      id,
      commission_paid: !currentPaid,
    });
  };

  if (placementsLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Placements"
          description="Track successful job and rental placements"
          icon={Trophy}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // Separate job placements (those with job_id) and rental placements
  const jobPlacements = placements.filter(p => p.job_id);
  const rentalPlacements = placements.filter(p => !p.job_id);

  return (
    <DashboardLayout>
      <PageHeader
        title="Placements"
        description="Track successful job and rental placements"
        icon={Trophy}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="jobs" className="gap-2">
              <Building2 className="h-4 w-4" />
              Job Placements
            </TabsTrigger>
            <TabsTrigger value="rentals" className="gap-2">
              <Home className="h-4 w-4" />
              Rental Placements
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() =>
              activeTab === 'jobs' ? setIsJobFormOpen(true) : setIsRentalFormOpen(true)
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'jobs' ? 'Job' : 'Rental'} Placement
          </Button>
        </div>

        {/* Job Placements */}
        <TabsContent value="jobs" className="space-y-4">
          {jobPlacements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              No job placements recorded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobPlacements.map((placement, index) => (
                <div
                  key={placement.id}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{placement.candidate_name}</h3>
                      <p className="text-sm text-muted-foreground">{placement.job_title}</p>
                    </div>
                    <StatusBadge
                      status={placement.commission_paid ? 'Paid' : 'Pending'}
                      variant={placement.commission_paid ? 'success' : 'warning'}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{placement.employer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(placement.placed_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Salary: NPR {placement.agreed_salary.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-success/10 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">Commission (30%)</p>
                    <p className="text-lg font-bold text-success">
                      NPR {placement.commission_amount.toLocaleString()}
                    </p>
                  </div>

                  {placement.notes && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {placement.notes}
                    </p>
                  )}

                  <Button
                    variant={placement.commission_paid ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCommissionPaid(placement.id, placement.commission_paid)}
                    disabled={updatePlacement.isPending}
                  >
                    {placement.commission_paid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Commission Paid
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Rental Placements */}
        <TabsContent value="rentals" className="space-y-4">
          {rentalPlacements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              No rental placements recorded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rentalPlacements.map((rental, index) => (
                <div
                  key={rental.id}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{rental.candidate_name}</h3>
                      <p className="text-sm text-muted-foreground">{rental.job_title}</p>
                    </div>
                    <StatusBadge
                      status={rental.commission_paid ? 'Paid' : 'Pending'}
                      variant={rental.commission_paid ? 'success' : 'warning'}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{rental.employer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(rental.placed_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Rent: NPR {rental.agreed_salary.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="text-lg font-bold text-primary">
                      NPR {rental.commission_amount.toLocaleString()}
                    </p>
                  </div>

                  {rental.notes && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {rental.notes}
                    </p>
                  )}

                  <Button
                    variant={rental.commission_paid ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCommissionPaid(rental.id, rental.commission_paid)}
                    disabled={updatePlacement.isPending}
                  >
                    {rental.commission_paid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Commission Paid
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Job Placement Modal */}
      <Dialog open={isJobFormOpen} onOpenChange={setIsJobFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Job Placement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select
                value={jobFormData.candidateId}
                onValueChange={(v) => setJobFormData((prev) => ({ ...prev, candidateId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {activeCandidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Job Position</Label>
              <Select
                value={jobFormData.jobId}
                onValueChange={(v) => setJobFormData((prev) => ({ ...prev, jobId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {openJobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.role_title} - {j.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Agreed Salary (NPR)</Label>
              <Input
                type="number"
                value={jobFormData.agreedSalary}
                onChange={(e) =>
                  setJobFormData((prev) => ({ ...prev, agreedSalary: e.target.value }))
                }
                placeholder="e.g., 20000"
              />
              {jobFormData.agreedSalary && (
                <p className="text-sm text-success">
                  Commission (30%): NPR{' '}
                  {Math.round(
                    parseFloat(jobFormData.agreedSalary) * (FEES.JOB_COMMISSION_PERCENT / 100)
                  ).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={jobFormData.notes}
                onChange={(e) => setJobFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsJobFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddJobPlacement} disabled={addPlacement.isPending}>
                {addPlacement.isPending ? 'Recording...' : 'Record Placement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rental Placement Modal */}
      <Dialog open={isRentalFormOpen} onOpenChange={setIsRentalFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Rental Placement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select
                value={rentalFormData.tenantId}
                onValueChange={(v) => setRentalFormData((prev) => ({ ...prev, tenantId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Property</Label>
              <Select
                value={rentalFormData.propertyId}
                onValueChange={(v) => setRentalFormData((prev) => ({ ...prev, propertyId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {vacantProperties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.type} - {p.location} (NPR {p.rent_amount.toLocaleString()}/mo)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Commission Amount (NPR)</Label>
              <Input
                type="number"
                value={rentalFormData.commissionAmount}
                onChange={(e) =>
                  setRentalFormData((prev) => ({ ...prev, commissionAmount: e.target.value }))
                }
                placeholder="Enter commission amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={rentalFormData.notes}
                onChange={(e) =>
                  setRentalFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsRentalFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRentalPlacement} disabled={addPlacement.isPending}>
                {addPlacement.isPending ? 'Recording...' : 'Record Placement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Placements;
