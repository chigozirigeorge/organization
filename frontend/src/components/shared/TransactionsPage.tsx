// components/TransactionsPage.tsx - UPDATED
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Filter, Download, ArrowUp, ArrowDown, Send, Search, RefreshCw, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  transaction_type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'JobPayment' | 'JobRefund' | 'PlatformFee' | 'Bonus' | 'Referral' | 'Penalty';
  amount: number;
  fee_amount: number;
  balance_before: number;
  balance_after: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
  reference: string;
  external_reference?: string;
  payment_method?: 'bank_transfer' | 'card' | 'ussd' | 'bank_code' | 'qr' | 'mobile_money' | 'bvn' | 'nip_slip';
  description: string;
  recipient?: string;
  metadata?: any;
  created_at: string;
  completed_at?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface ApiResponse {
  status: string;
  data: Transaction[];
  pagination: Pagination;
}

export const TransactionsPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Filter states - use PascalCase for backend
  const [filters, setFilters] = useState({
    transaction_type: '' as '' | 'Deposit' | 'Withdrawal' | 'Transfer',
    status: '' as '' | 'pending' | 'processing' | 'completed' | 'failed',
    start_date: '',
    end_date: '',
    search: '',
    limit: 20,
    offset: 0
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filters.transaction_type, filters.status, filters.limit, filters.offset]);

  // Map frontend tab values to backend PascalCase
  const getBackendTransactionType = (tab: string): '' | 'Deposit' | 'Withdrawal' | 'Transfer' => {
    switch (tab) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'transfer': return 'Transfer';
      default: return '';
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Build query parameters with PascalCase values
      const params = new URLSearchParams();
      
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) {
        const startDate = new Date(filters.start_date);
        startDate.setHours(0, 0, 0, 0);
        params.append('start_date', startDate.toISOString());
      }
      if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        endDate.setHours(23, 59, 59, 999);
        params.append('end_date', endDate.toISOString());
      }
      params.append('limit', filters.limit.toString());
      params.append('offset', filters.offset.toString());

      console.log('🔄 Fetching transactions with params:', params.toString());

      const response = await fetch(`https://verinest.up.railway.app/api/wallet/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      console.log('📊 Transactions response status:', response.status);

      if (response.ok) {
        const data: ApiResponse = await response.json();
        console.log('✅ Transactions data received:', data);
        
        setTransactions(data.data || []);
        setPagination(data.pagination || null);
      } else if (response.status === 500) {
        // Handle schema mismatch gracefully
        console.error('❌ Server error (500) - possible schema mismatch');
        await handleSchemaFallback();
      } else if (response.status === 400) {
        const errorText = await response.text();
        console.error('❌ Bad request error:', errorText);
        
        // If it's a deserialization error, try without filters
        if (errorText.includes('Failed to deserialize') || errorText.includes('unknown variant')) {
          console.log('🔧 Deserialization error, trying without transaction_type filter');
          await fetchTransactionsWithoutTypeFilter();
        } else {
          toast.error('Failed to load transactions');
          setTransactions([]);
        }
      } else {
        console.error(`❌ Transactions API error: ${response.status}`);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setTransactions([]);
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('❌ Network error fetching transactions:', error);
      toast.error('Network error loading transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionsWithoutTypeFilter = async () => {
    try {
      console.log('🔄 Fetching all transactions without type filter...');
      
      const params = new URLSearchParams();
      params.append('limit', filters.limit.toString());
      params.append('offset', filters.offset.toString());

      const response = await fetch(`https://verinest.up.railway.app/api/wallet/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        console.log('✅ All transactions data received:', data);
        
        // Filter client-side by transaction type if needed
        let filteredData = data.data || [];
        if (filters.transaction_type) {
          filteredData = filteredData.filter(tx => 
            tx.transaction_type.toLowerCase() === filters.transaction_type.toLowerCase()
          );
        }
        
        setTransactions(filteredData);
        setPagination({
          ...data.pagination,
          total: filteredData.length
        });
      } else {
        throw new Error('Failed to fetch transactions without filter');
      }
    } catch (error) {
      console.error('❌ Error fetching without filter:', error);
      await handleSchemaFallback();
    }
  };

  const handleSchemaFallback = async () => {
    try {
      console.log('🔄 Trying fallback approach for transactions...');
      
      // Try to get wallet data as fallback
      const walletResponse = await fetch('https://verinest.up.railway.app/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        console.log('✅ Using wallet data for fallback transactions');
        
        // Create simple transaction from wallet balance
        const fallbackTransactions: Transaction[] = [];
        
        if (walletData.data?.balance > 0) {
          fallbackTransactions.push({
            id: 'fallback_balance',
            transaction_type: 'Deposit',
            amount: walletData.data.balance,
            fee_amount: 0,
            balance_before: 0,
            balance_after: walletData.data.balance,
            status: 'completed',
            reference: 'current_balance',
            description: 'Current wallet balance',
            created_at: new Date().toISOString(),
            metadata: { isFallback: true }
          });
        }
        
        setTransactions(fallbackTransactions);
        toast.info('Using simplified transaction view');
      } else {
        setTransactions([]);
        toast.error('Unable to load transaction data');
      }
    } catch (error) {
      console.error('❌ Fallback also failed:', error);
      setTransactions([]);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilters(prev => ({
      ...prev,
      transaction_type: getBackendTransactionType(tab),
      offset: 0 // Reset to first page
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      transaction_type: '',
      status: '',
      start_date: '',
      end_date: '',
      search: '',
      limit: 20,
      offset: 0
    });
    setActiveTab('all');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForStatement = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'secondary',
      reversed: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case 'deposit':
      case 'jobpayment':
      case 'bonus':
      case 'referral':
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
      case 'platformfee':
      case 'penalty':
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'transfer':
      case 'jobrefund':
        return <Send className="h-4 w-4 text-blue-600" />;
      default:
        return <Send className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      'Deposit': 'Deposit',
      'Withdrawal': 'Withdrawal',
      'Transfer': 'Transfer',
      'JobPayment': 'Job Payment',
      'JobRefund': 'Refund',
      'PlatformFee': 'Platform Fee',
      'Bonus': 'Bonus',
      'Referral': 'Referral',
      'Penalty': 'Penalty'
    };
    
    return typeMap[type] || type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const isPositiveTransaction = (type: string) => {
    const typeLower = type.toLowerCase();
    return ['deposit', 'jobpayment', 'bonus', 'referral', 'jobrefund'].includes(typeLower);
  };

  const handleExport = () => {
    // Simple CSV export implementation
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Reference', 'Description'];
    const csvData = transactions.map(tx => [
      formatDate(tx.created_at),
      getTypeDisplayName(tx.transaction_type),
      formatCurrency(tx.amount),
      tx.status,
      tx.reference,
      tx.description
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Transactions exported successfully');
  };

  const handleDownloadStatement = async () => {
    setLoading(true);
    try {
      // Get all transactions for the statement period
      const statementParams = new URLSearchParams();
      if (filters.start_date) statementParams.append('start_date', new Date(filters.start_date).toISOString());
      if (filters.end_date) statementParams.append('end_date', new Date(filters.end_date).toISOString());
      statementParams.append('limit', '1000');
      statementParams.append('offset', '0');

      const response = await fetch(`https://verinest.up.railway.app/api/wallet/transactions?${statementParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        const statementTransactions = data.data || [];
        
        if (statementTransactions.length === 0) {
          toast.error('No transactions found for the selected period');
          return;
        }
        
        // Generate comprehensive account statement
        const statementContent = generateAccountStatement(statementTransactions);
        
        // Create and download text file (PDF would require a library)
        const blob = new Blob([statementContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const startDate = filters.start_date ? new Date(filters.start_date).toISOString().split('T')[0] : 'all';
        const endDate = filters.end_date ? new Date(filters.end_date).toISOString().split('T')[0] : 'current';
        a.download = `account-statement-${startDate}-to-${endDate}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Account statement downloaded successfully');
      } else {
        throw new Error('Failed to fetch transactions for statement');
      }
    } catch (error) {
      console.error('Failed to download statement:', error);
      toast.error('Failed to download account statement');
    } finally {
      setLoading(false);
    }
  };

  const generateAccountStatement = (transactions: Transaction[]): string => {
    const statementLines = [];
    
    // Header
    statementLines.push('VERINEST - ACCOUNT STATEMENT');
    statementLines.push('='.repeat(60));
    statementLines.push(`Account Holder: ${user?.name || user?.email || 'User'}`);
    statementLines.push(`Statement Period: ${filters.start_date ? formatDateForStatement(filters.start_date) : 'All Time'} to ${filters.end_date ? formatDateForStatement(filters.end_date) : formatDateForStatement(new Date().toISOString())}`);
    statementLines.push(`Generated: ${formatDateForStatement(new Date().toISOString())}`);
    statementLines.push('');
    
    // Summary
    const totalDeposits = transactions
      .filter(t => ['Deposit', 'JobPayment', 'Bonus', 'Referral'].includes(t.transaction_type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(t => ['Withdrawal', 'PlatformFee', 'Penalty'].includes(t.transaction_type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalTransfers = transactions
      .filter(t => ['Transfer', 'JobRefund'].includes(t.transaction_type) && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    statementLines.push('SUMMARY');
    statementLines.push('-'.repeat(40));
    statementLines.push(`Total Deposits: ${formatCurrency(totalDeposits)}`);
    statementLines.push(`Total Withdrawals: ${formatCurrency(totalWithdrawals)}`);
    statementLines.push(`Total Transfers: ${formatCurrency(totalTransfers)}`);
    statementLines.push(`Number of Transactions: ${transactions.length}`);
    statementLines.push('');
    
    // Transaction Details
    statementLines.push('TRANSACTION DETAILS');
    statementLines.push('='.repeat(120));
    statementLines.push(
      'Date'.padEnd(12) + 
      'Type'.padEnd(15) + 
      'Amount'.padEnd(15) + 
      'Status'.padEnd(12) + 
      'Reference'.padEnd(20) + 
      'Description'
    );
    statementLines.push('-'.repeat(120));
    
    transactions.forEach(transaction => {
      const date = formatDateForStatement(transaction.created_at);
      const type = getTypeDisplayName(transaction.transaction_type).padEnd(15);
      const amount = formatCurrency(transaction.amount).padEnd(15);
      const status = transaction.status.padEnd(12);
      const reference = (transaction.reference || '').padEnd(20);
      const description = transaction.description || '';
      
      statementLines.push(`${date} ${type} ${amount} ${status} ${reference} ${description}`);
    });
    
    statementLines.push('');
    statementLines.push('END OF STATEMENT');
    statementLines.push('='.repeat(60));
    statementLines.push('This is an electronically generated statement.');
    statementLines.push('For any discrepancies, please contact support@verinest.com');
    
    return statementLines.join('\n');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card key={transaction.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2 rounded-full bg-muted">
              {getTypeIcon(transaction.transaction_type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{getTypeDisplayName(transaction.transaction_type)}</p>
                {getStatusBadge(transaction.status)}
              </div>
              <p className="text-sm text-muted-foreground">{transaction.description}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>Ref: {transaction.reference}</span>
                <span>{formatDate(transaction.created_at)}</span>
                {transaction.payment_method && (
                  <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-lg font-semibold ${
              isPositiveTransaction(transaction.transaction_type) 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {isPositiveTransaction(transaction.transaction_type) ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            {transaction.fee_amount > 0 && (
              <p className="text-sm text-muted-foreground">
                Fee: {formatCurrency(transaction.fee_amount)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Balance: {formatCurrency(transaction.balance_after)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">View and manage your wallet transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadStatement}
            disabled={loading || transactions.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Account Statement
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={transactions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>
              Filter transactions by date range, status, or search for specific references
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search Reference</Label>
                <Input
                  placeholder="Search references..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <div className="text-sm text-muted-foreground">
                {pagination?.total || 0} transactions found
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Type Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="deposit">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
          <TabsTrigger value="transfer">Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading transactions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && transactions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.transaction_type || filters.status || filters.start_date || filters.end_date
                    ? 'Try adjusting your filters to see more results'
                    : 'Your transaction history will appear here once you start making transactions'
                  }
                </p>
                {(filters.transaction_type || filters.status || filters.start_date || filters.end_date) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transactions List */}
          {!loading && transactions.length > 0 && (
            <div>
              {/* Summary Stats */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-xl font-semibold">{transactions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-xl font-semibold text-green-600">
                        {transactions.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xl font-semibold text-yellow-600">
                        {transactions.filter(t => t.status === 'pending' || t.status === 'processing').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-xl font-semibold text-red-600">
                        {transactions.filter(t => t.status === 'failed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {transactions.map(transaction => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, pagination.total)} of {pagination.total} transactions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={filters.offset === 0}
                      onClick={() => handleFilterChange('offset', (filters.offset - filters.limit).toString())}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={filters.offset + filters.limit >= pagination.total}
                      onClick={() => handleFilterChange('offset', (filters.offset + filters.limit).toString())}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};