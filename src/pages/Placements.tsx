import { useState, useMemo } from 'react';
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
import {
  mockPlacements,
  mockRentalPlacements,
  mockCandidates,
  mockJobReqs,
  mockTenants,
  mockProperties,
} from '@/data/mockData';
import { Placement, RentalPlacement, FEES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Placements = () => {
  const [placements, setPlacements] = useState<Placement[]>(mockPlacements);
  const [rentalPlacements, setRentalPlacements] = useState<RentalPlacement[]>(mockRentalPlacements);
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

  const activeCandidates = mockCandidates.filter((c) => c.status === 'Active');
  const openJobs = mockJobReqs.filter((j) => j.status === 'Open');
  const vacantProperties = mockProperties.filter((p) => p.status === 'Vacant');

  const handleAddJobPlacement = () => {
    if (!jobFormData.candidateId || !jobFormData.jobId || !jobFormData.agreedSalary) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const candidate = mockCandidates.find((c) => c.id === jobFormData.candidateId);
    const job = mockJobReqs.find((j) => j.id === jobFormData.jobId);
    const salary = parseFloat(jobFormData.agreedSalary);
    const commission = Math.round(salary * (FEES.JOB_COMMISSION_PERCENT / 100));

    const newPlacement: Placement = {
      id: String(Date.now()),
      candidateId: jobFormData.candidateId,
      candidateName: candidate?.fullName || '',
      jobId: jobFormData.jobId,
      jobTitle: job?.roleTitle || '',
      employerName: job?.employerInfo.companyName || '',
      placedDate: new Date(),
      agreedSalary: salary,
      commissionAmount: commission,
      commissionPaid: false,
      notes: jobFormData.notes || undefined,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
    };

    setPlacements([newPlacement, ...placements]);
    setIsJobFormOpen(false);
    setJobFormData({ candidateId: '', jobId: '', agreedSalary: '', notes: '' });

    toast({
      title: 'Placement Recorded',
      description: `${candidate?.fullName} placed at ${job?.employerInfo.companyName}. Commission: NPR ${commission.toLocaleString()}`,
    });
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

    const tenant = mockTenants.find((t) => t.id === rentalFormData.tenantId);
    const property = mockProperties.find((p) => p.id === rentalFormData.propertyId);

    const newRentalPlacement: RentalPlacement = {
      id: String(Date.now()),
      tenantId: rentalFormData.tenantId,
      tenantName: tenant?.fullName || '',
      propertyId: rentalFormData.propertyId,
      propertyType: property?.type || '',
      landlordName: property?.landlordInfo.fullName || '',
      rentStartDate: new Date(),
      monthlyRent: property?.rentAmount || 0,
      commissionAmount: parseFloat(rentalFormData.commissionAmount),
      commissionPaid: false,
      notes: rentalFormData.notes || undefined,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    setRentalPlacements([newRentalPlacement, ...rentalPlacements]);
    setIsRentalFormOpen(false);
    setRentalFormData({ tenantId: '', propertyId: '', commissionAmount: '', notes: '' });

    toast({
      title: 'Rental Recorded',
      description: `${tenant?.fullName} placed at ${property?.location}. Commission: NPR ${parseFloat(rentalFormData.commissionAmount).toLocaleString()}`,
    });
  };

  const toggleCommissionPaid = (id: string, type: 'job' | 'rental') => {
    if (type === 'job') {
      setPlacements(
        placements.map((p) =>
          p.id === id ? { ...p, commissionPaid: !p.commissionPaid } : p
        )
      );
    } else {
      setRentalPlacements(
        rentalPlacements.map((r) =>
          r.id === id ? { ...r, commissionPaid: !r.commissionPaid } : r
        )
      );
    }
    toast({
      title: 'Status Updated',
      description: 'Commission payment status updated.',
    });
  };

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
          {placements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              No job placements recorded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {placements.map((placement, index) => (
                <div
                  key={placement.id}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{placement.candidateName}</h3>
                      <p className="text-sm text-muted-foreground">{placement.jobTitle}</p>
                    </div>
                    <StatusBadge
                      status={placement.commissionPaid ? 'Paid' : 'Pending'}
                      variant={placement.commissionPaid ? 'success' : 'warning'}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{placement.employerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(placement.placedDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Salary: NPR {placement.agreedSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-success/10 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">Commission (30%)</p>
                    <p className="text-lg font-bold text-success">
                      NPR {placement.commissionAmount.toLocaleString()}
                    </p>
                  </div>

                  {placement.notes && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {placement.notes}
                    </p>
                  )}

                  <Button
                    variant={placement.commissionPaid ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCommissionPaid(placement.id, 'job')}
                  >
                    {placement.commissionPaid ? (
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
                      <h3 className="font-semibold text-foreground">{rental.tenantName}</h3>
                      <p className="text-sm text-muted-foreground">{rental.propertyType}</p>
                    </div>
                    <StatusBadge
                      status={rental.commissionPaid ? 'Paid' : 'Pending'}
                      variant={rental.commissionPaid ? 'success' : 'warning'}
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{rental.landlordName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(rental.rentStartDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Rent: NPR {rental.monthlyRent.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="text-lg font-bold text-primary">
                      NPR {rental.commissionAmount.toLocaleString()}
                    </p>
                  </div>

                  {rental.notes && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {rental.notes}
                    </p>
                  )}

                  <Button
                    variant={rental.commissionPaid ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => toggleCommissionPaid(rental.id, 'rental')}
                  >
                    {rental.commissionPaid ? (
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
                      {c.fullName}
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
                      {j.roleTitle} - {j.employerInfo.companyName}
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
              <Button onClick={handleAddJobPlacement}>Record Placement</Button>
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
                  {mockTenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName}
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
                      {p.type} - {p.location} (NPR {p.rentAmount.toLocaleString()}/mo)
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
              <p className="text-xs text-muted-foreground">
                Enter the agreed commission amount (flexible)
              </p>
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
              <Button onClick={handleAddRentalPlacement}>Record Placement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Placements;
