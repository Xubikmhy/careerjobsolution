import { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  TrendingUp,
  FileText,
  Briefcase,
  Home,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionType, FEES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const transactionTypeLabels: Record<TransactionType, string> = {
  form_fee: 'Form Fee',
  cv_fee: 'CV Fee',
  job_commission: 'Job Commission',
  rental_commission: 'Rental Commission',
};

const transactionTypeIcons: Record<TransactionType, React.ElementType> = {
  form_fee: FileText,
  cv_fee: FileText,
  job_commission: Briefcase,
  rental_commission: Home,
};

const Accounting = () => {
  const { transactions, isLoading, addTransaction } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    type: 'form_fee' as TransactionType,
    description: '',
    amount: '',
    relatedName: '',
    notes: '',
  });

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesSearch =
          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (t.related_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesType && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, searchQuery]);

  const totalByType = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        acc[t.type as TransactionType] = (acc[t.type as TransactionType] || 0) + t.amount;
        return acc;
      },
      {} as Record<TransactionType, number>
    );
  }, [transactions]);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.relatedName) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    addTransaction.mutate({
      type: formData.type,
      description: formData.description || transactionTypeLabels[formData.type],
      amount: parseFloat(formData.amount),
      related_name: formData.relatedName,
      related_id: null,
      date: new Date().toISOString().split('T')[0],
      notes: formData.notes || null,
    });

    setIsFormOpen(false);
    setFormData({
      type: 'form_fee',
      description: '',
      amount: '',
      relatedName: '',
      notes: '',
    });
  };

  const handleTypeChange = (type: TransactionType) => {
    let defaultAmount = '';
    if (type === 'form_fee') defaultAmount = String(FEES.FORM_FEE);
    if (type === 'cv_fee') defaultAmount = String(FEES.CV_FEE);

    setFormData((prev) => ({
      ...prev,
      type,
      amount: defaultAmount,
      description: transactionTypeLabels[type],
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Accounting"
          description="Track all agency revenue and transactions"
          icon={Receipt}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Accounting"
        description="Track all agency revenue and transactions"
        icon={Receipt}
        action={{
          label: 'Add Transaction',
          onClick: () => setIsFormOpen(true),
          icon: Plus,
        }}
      />

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={`NPR ${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Form Fees"
          value={`NPR ${(totalByType.form_fee || 0).toLocaleString()}`}
          icon={FileText}
          variant="default"
          trend={`@ NPR ${FEES.FORM_FEE} each`}
        />
        <StatCard
          title="CV Fees"
          value={`NPR ${(totalByType.cv_fee || 0).toLocaleString()}`}
          icon={FileText}
          variant="default"
          trend={`@ NPR ${FEES.CV_FEE} each`}
        />
        <StatCard
          title="Commissions"
          value={`NPR ${((totalByType.job_commission || 0) + (totalByType.rental_commission || 0)).toLocaleString()}`}
          icon={Briefcase}
          variant="success"
          trend="Jobs + Rentals"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-card">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="form_fee">Form Fees</SelectItem>
            <SelectItem value="cv_fee">CV Fees</SelectItem>
            <SelectItem value="job_commission">Job Commissions</SelectItem>
            <SelectItem value="rental_commission">Rental Commissions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                const Icon = transactionTypeIcons[transaction.type as TransactionType] || FileText;
                return (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'p-1.5 rounded-md',
                            transaction.type === 'job_commission' && 'bg-success/10',
                            transaction.type === 'rental_commission' && 'bg-primary/10',
                            transaction.type === 'form_fee' && 'bg-muted',
                            transaction.type === 'cv_fee' && 'bg-muted'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              transaction.type === 'job_commission' && 'text-success',
                              transaction.type === 'rental_commission' && 'text-primary',
                              transaction.type === 'form_fee' && 'text-muted-foreground',
                              transaction.type === 'cv_fee' && 'text-muted-foreground'
                            )}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {transactionTypeLabels[transaction.type as TransactionType] || transaction.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.related_name || '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      +NPR {transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 flex justify-between items-center p-4 bg-card rounded-xl border border-border">
        <span className="text-muted-foreground">
          Showing {filteredTransactions.length} transaction(s)
        </span>
        <div className="text-lg font-bold text-foreground">
          Total:{' '}
          <span className="text-success">
            NPR {filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleTypeChange(v as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form_fee">Form Fee (NPR {FEES.FORM_FEE})</SelectItem>
                  <SelectItem value="cv_fee">CV Fee (NPR {FEES.CV_FEE})</SelectItem>
                  <SelectItem value="job_commission">Job Commission (30%)</SelectItem>
                  <SelectItem value="rental_commission">Rental Commission (Flexible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Related Person/Entity</Label>
              <Input
                placeholder="e.g., Ram Bahadur Gurung"
                value={formData.relatedName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, relatedName: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (NPR)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder={
                    formData.type === 'job_commission'
                      ? 'Enter 30% of salary'
                      : formData.type === 'rental_commission'
                        ? 'Enter commission amount'
                        : ''
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction} disabled={addTransaction.isPending}>
                {addTransaction.isPending ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Accounting;
