import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { PageHeader } from '@/components/PageHeader';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useProperties } from '@/hooks/useProperties';
import { usePlacements } from '@/hooks/usePlacements';
import { useTransactions } from '@/hooks/useTransactions';
import {
  Users,
  Briefcase,
  Home,
  TrendingUp,
  ArrowRight,
  Trophy,
  Receipt,
  Target,
  Clock,
  CheckCircle2,
  UserPlus,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { SkillTagList } from '@/components/SkillTag';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { candidates, isLoading: candidatesLoading } = useCandidates();
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { placements, isLoading: placementsLoading } = usePlacements();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  const recentCandidates = candidates.slice(0, 3);
  const recentJobs = jobs.filter((j) => j.status === 'Open').slice(0, 3);
  const vacantProperties = properties.filter((p) => p.status === 'Vacant').slice(0, 3);
  const recentPlacements = placements.slice(0, 3);
  const recentTransactions = transactions.slice(0, 5);

  const isLoading = statsLoading || candidatesLoading || jobsLoading || propertiesLoading || placementsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's an overview of your agency operations."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your agency operations."
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link
          to="/candidates?action=add"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Add Candidate</p>
            <p className="text-xs text-muted-foreground">New job seeker</p>
          </div>
        </Link>
        <Link
          to="/jobs?action=add"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-success hover:shadow-md transition-all group"
        >
          <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
            <Briefcase className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-medium text-foreground">Add Vacancy</p>
            <p className="text-xs text-muted-foreground">New job opening</p>
          </div>
        </Link>
        <Link
          to="/properties?action=add"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-warning hover:shadow-md transition-all group"
        >
          <div className="p-2 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
            <Building2 className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="font-medium text-foreground">Add Property</p>
            <p className="text-xs text-muted-foreground">New rental listing</p>
          </div>
        </Link>
        <Link
          to="/tenants?action=add"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
        >
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Add Tenant</p>
            <p className="text-xs text-muted-foreground">New renter</p>
          </div>
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Active Job Seekers"
          value={stats?.activeJobSeekers || 0}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Open Positions"
          value={stats?.openJobPositions || 0}
          icon={Briefcase}
          variant="success"
        />
        <StatCard
          title="Vacant Properties"
          value={stats?.vacantProperties || 0}
          icon={Home}
          variant="warning"
        />
        <StatCard
          title="Total Revenue"
          value={`NPR ${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Trophy className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.placedCandidates || 0}</p>
              <p className="text-xs text-muted-foreground">Job Placements</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.successfulRentals || 0}</p>
              <p className="text-xs text-muted-foreground">Rentals Closed</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                NPR {(stats?.pendingCommissions || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Pending Commissions</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Target className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats ? Math.round(
                  ((stats.placedCandidates) /
                    (stats.activeJobSeekers + stats.placedCandidates)) *
                    100
                ) || 0 : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Placement Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Recent Candidates */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Candidates</h3>
            <Link
              to="/candidates"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentCandidates.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No candidates yet</div>
            ) : (
              recentCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{candidate.full_name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.address}</p>
                    </div>
                    <StatusBadge
                      status={candidate.status}
                      variant={getStatusVariant(candidate.status)}
                    />
                  </div>
                  <SkillTagList skills={candidate.skills || []} max={3} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Open Positions</h3>
            <Link
              to="/jobs"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentJobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No open positions</div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{job.role_title}</p>
                      <p className="text-sm text-muted-foreground">{job.company_name}</p>
                    </div>
                    <span className="text-sm font-medium text-success">
                      NPR {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.timing}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vacant Properties */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Vacant Properties</h3>
            <Link
              to="/properties"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {vacantProperties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No vacant properties</div>
            ) : (
              vacantProperties.map((property) => (
                <div key={property.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{property.type}</p>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      NPR {property.rent_amount.toLocaleString()}/mo
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {property.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Placements & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Placements */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-success" />
              Recent Placements
            </h3>
            <Link
              to="/placements"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPlacements.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No placements yet
              </div>
            ) : (
              recentPlacements.map((placement) => (
                <div key={placement.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{placement.candidate_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {placement.job_title} at {placement.employer_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {placement.commission_paid ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                      <span className="text-sm font-medium text-success">
                        +NPR {placement.commission_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(placement.placed_date), 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Transactions
            </h3>
            <Link
              to="/accounting"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions yet</div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.related_name}</p>
                    </div>
                    <span className="text-sm font-medium text-success">
                      +NPR {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
