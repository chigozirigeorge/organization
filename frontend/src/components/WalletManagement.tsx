// components/WalletManagement.tsx (Fixed wallet detection)
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Wallet, Plus, ArrowUp, ArrowDown, Send, History, CreditCard, Building, User, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  wallet_created: boolean;
  account_number?: string;
  bank_name?: string;
}

interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  is_primary: boolean;
  verified: boolean;
}

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'success' | 'failed';
  description: string;
  created_at: string;
  metadata?: any;
}

export const WalletManagement = () => {
  const { user, token } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [depositError, setDepositError] = useState('');

  // Form states
  const [depositData, setDepositData] = useState({
    amount: '',
    payment_method: 'Card' as 'Card' | 'BankTransfer' | 'USSD', // Must match Rust enum
    description: 'Wallet deposit'
  });

  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    bank_account_id: ''
  });
  const [transferData, setTransferData] = useState({
    amount: '',
    recipient_identifier: '',
    description: ''
  });
  const [bankAccountData, setBankAccountData] = useState({
    account_name: '',
    account_number: '',
    bank_code: ''
  });

  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '023', name: 'Citibank' },
    { code: '063', name: 'Diamond Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '100', name: 'Suntrust Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' }
  ];

  useEffect(() => {
    checkWalletStatus();
  }, []);

  useEffect(() => {
    if (walletData?.wallet_created) {
      fetchBankAccounts();
      fetchTransactions();
    }
  }, [walletData?.wallet_created, token]);


 const checkWalletStatus = async () => {
    setFetching(true);
    try {
      console.log('🔄 Checking wallet status...');
      
      const walletResponse = await fetch('https://verinest.up.railway.app/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      console.log('Wallet response status:', walletResponse.status);
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        console.log('✅ Wallet data received:', walletData);
        
        if (walletData.data) {
          console.log('💰 Wallet balance:', walletData.data.balance);
          const newWalletData = {
            ...walletData.data,
            wallet_created: true
          };
          setWalletData(newWalletData);
          
          // Fetch bank accounts and transactions when wallet is found
          await fetchBankAccounts();
          await fetchTransactions();
        } else {
          console.log('❌ No wallet data in response');
          setWalletData({
            id: '',
            balance: 0,
            currency: 'NGN',
            wallet_created: false
          });
        }
      } else if (walletResponse.status === 404) {
        console.log('❌ Wallet not found (404)');
        setWalletData({
          id: '',
          balance: 0,
          currency: 'NGN',
          wallet_created: false
        });
      } else {
        console.log('❌ Wallet endpoint error:', walletResponse.status);
        const errorText = await walletResponse.text();
        console.log('Error response:', errorText);
        setWalletData({
          id: '',
          balance: 0,
          currency: 'NGN',
          wallet_created: false
        });
      }
    } catch (error) {
      console.error('❌ Failed to check wallet status:', error);
      setWalletData({
        id: '',
        balance: 0,
        currency: 'NGN',
        wallet_created: false
      });
    } finally {
      setFetching(false);
    }
  };

  const tryUserEndpointFallback = async () => {
    try {
      const userResponse = await fetch('https://verinest.up.railway.app/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data for wallet fallback:', userData);
        
        // Check if wallet info exists in user data
        if (userData.wallet_id || userData.balance !== undefined) {
          setWalletData({
            id: userData.wallet_id || '',
            balance: userData.balance || 0,
            currency: 'NGN',
            wallet_created: true
          });
        } else {
          setWalletData({
            id: '',
            balance: 0,
            currency: 'NGN',
            wallet_created: false
          });
        }
      }
    } catch (error) {
      console.error('Fallback also failed:', error);
      setWalletData({
        id: '',
        balance: 0,
        currency: 'NGN',
        wallet_created: false
      });
    }
  };

  const fetchBankAccounts = async () => {
    try {
      console.log('🔄 Fetching bank accounts...');
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/bank-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      console.log('Bank accounts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bank accounts data:', data);
        
        // Handle different response structures
        let accountsData = [];
        
        if (data.data && Array.isArray(data.data)) {
          accountsData = data.data;
        } else if (Array.isArray(data.accounts)) {
          accountsData = data.accounts;
        } else if (Array.isArray(data)) {
          accountsData = data;
        } else if (data.data && data.data.accounts) {
          accountsData = data.data.accounts;
        }
        
        console.log('🏦 Processed bank accounts:', accountsData);
        setBankAccounts(accountsData);
      } else {
        console.error('❌ Bank accounts API error:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setBankAccounts([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch bank accounts:', error);
      setBankAccounts([]);
    }
  };

////////////
  // components/WalletManagement.tsx - Fix transactions fetching
const fetchTransactions = async () => {
  try {
    console.log('🔄 Fetching transactions...');
    
    const response = await fetch('https://verinest.up.railway.app/api/wallet/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      } as HeadersInit,
    });

    console.log('Transactions response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Transactions data received:', data);
      
      // Handle different response structures
      let transactionsData = [];
      
      if (data.data && Array.isArray(data.data)) {
        transactionsData = data.data;
      } else if (Array.isArray(data.transactions)) {
        transactionsData = data.transactions;
      } else if (Array.isArray(data)) {
        transactionsData = data;
      } else if (data.data && data.data.transactions) {
        transactionsData = data.data.transactions;
      } else {
        console.warn('⚠️ Unexpected transactions response structure:', data);
      }
      
      // FIX: Transform the data to match our frontend interface
      const transformedTransactions = transactionsData.map((tx: any) => ({
        id: tx.id || tx.transaction_id || tx.reference,
        reference: tx.reference || tx.id || `tx_${Date.now()}`,
        amount: tx.amount || 0,
        // FIX: Handle different field names for transaction type
        type: (tx.type || tx.transaction_type || tx.transactionType || 'other').toLowerCase(),
        // FIX: Handle different field names for status
        status: (tx.status || tx.transaction_status || 'pending').toLowerCase(),
        description: tx.description || tx.narration || tx.purpose || 'Transaction',
        created_at: tx.created_at || tx.createdAt || tx.date || new Date().toISOString(),
        metadata: tx.metadata || {}
      }));
      
      console.log('📊 Transformed transactions:', transformedTransactions);
      setTransactions(transformedTransactions);
      
    } else if (response.status === 500) {
      console.error('❌ Server error (500) fetching transactions');
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      // Check if it's the specific schema error
      if (errorText.includes('transaction_type')) {
        console.log('🔧 Detected schema mismatch, using fallback data');
        await useFallbackTransactions();
      } else {
        setTransactions([]);
        toast.error('Temporarily unable to load transactions');
      }
      
    } else {
      console.error(`❌ Transactions API error: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      setTransactions([]);
    }
  } catch (error) {
    console.error('❌ Network error fetching transactions:', error);
    setTransactions([]);
  }
};

// Fallback function when the main endpoint has schema issues
const useFallbackTransactions = async () => {
  try {
    console.log('🔄 Trying fallback transactions approach...');
    
    // Try to get transactions from a different endpoint or use wallet data
    const walletResponse = await fetch('https://verinest.up.railway.app/api/wallet', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      } as HeadersInit,
    });

    if (walletResponse.ok) {
      const walletData = await walletResponse.json();
      console.log('✅ Using wallet data for fallback transactions');
      
      // Create a simple transaction from wallet balance
      const fallbackTransactions: Transaction[] = [];
      
      if (walletData.data?.balance > 0) {
        fallbackTransactions.push({
          id: 'fallback_1',
          reference: 'current_balance',
          amount: walletData.data.balance,
          type: 'deposit',
          status: 'success',
          description: 'Current wallet balance',
          created_at: new Date().toISOString(),
          metadata: { isFallback: true }
        });
      }
      
      setTransactions(fallbackTransactions);
      toast.info('Using simplified transaction view');
    } else {
      setTransactions([]);
    }
  } catch (error) {
    console.error('❌ Fallback also failed:', error);
    setTransactions([]);
  }
};

// FIX: Update the transaction display to handle the schema differences
const getTransactionType = (transaction: Transaction) => {
  // Handle different possible type values
  const type = transaction.type?.toLowerCase() || 'other';
  
  if (type.includes('deposit') || type.includes('credit')) return 'deposit';
  if (type.includes('withdraw') || type.includes('debit')) return 'withdrawal';
  if (type.includes('transfer')) return 'transfer';
  
  return type as any;
};

const getTransactionStatus = (transaction: Transaction) => {
  const status = transaction.status?.toLowerCase() || 'pending';
  
  if (status.includes('success') || status.includes('completed')) return 'success';
  if (status.includes('fail') || status.includes('error')) return 'failed';
  
  return status as any;
};

///////////
const createWallet = async () => {
    setLoading(true);
    try {
      console.log('🔄 Creating wallet...');
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      console.log('Create wallet response status:', response.status);
      
      const responseText = await response.text();
      console.log('Create wallet response body:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (response.ok) {
        console.log('✅ Wallet created successfully:', responseData);
        toast.success('Wallet created successfully!');
        
        if (responseData.data) {
          const newWalletData = {
            ...responseData.data,
            wallet_created: true
          };
          setWalletData(newWalletData);
          
          // Fetch bank accounts and transactions after wallet creation
          await fetchBankAccounts();
          await fetchTransactions();
        } else {
          await checkWalletStatus();
        }
      } else {
        console.log('❌ Wallet creation failed:', responseData);
        if (responseData.message?.includes('already exists') || response.status === 400) {
          toast.info('Wallet already exists. Loading wallet data...');
          await checkWalletStatus();
        } else {
          throw new Error(responseData.message || 'Failed to create wallet');
        }
      }
    } catch (error: any) {
      console.error('❌ Wallet creation failed:', error);
      if (error.message?.includes('already exists')) {
        toast.info('Wallet already exists. Loading wallet data...');
        await checkWalletStatus();
      } else {
        toast.error(error.message || 'Failed to create wallet');
      }
    } finally {
      setLoading(false);
    }
  };

  // components/WalletManagement.tsx - Update deposit handler
const handleDeposit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setDepositError('');
  
  try {
    // Validate amount
    const depositAmount = parseFloat(depositData.amount);
    
    if (isNaN(depositAmount) || depositAmount < 100) {
      toast.error('Please enter a valid amount (minimum ₦100)');
      return;
    }

    if (depositAmount > 10000000) {
      toast.error('Maximum deposit amount is ₦10,000,000');
      return;
    }

    // Prepare the exact request structure that matches DepositRequestDto
    const requestBody = {
      amount: depositAmount,
      payment_method: depositData.payment_method,
      description: depositData.description,
      metadata: {
        source: "web_app",
        user_id: user?.id,
        user_email: user?.email,
        timestamp: new Date().toISOString(),
        redirect_url: `${window.location.origin}/payment/verify` // Add redirect URL
      }
    };

    console.log('Sending deposit request:', requestBody);
////
   const response = await fetch('https://verinest.up.railway.app/api/wallet/deposit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (response.ok) {
      const paymentData = responseData.data || responseData;
      
      if (paymentData.payment_url) {
        // Store reference for potential fallback polling
        localStorage.setItem('pending_payment_reference', paymentData.reference);
        
        // Open Paystack in new tab
        const paystackWindow = window.open(
          paymentData.payment_url,
          'paystack_payment',
          'width=600,height=700'
        );
        
        if (paystackWindow) {
          toast.success('Payment window opened. You can close this tab - we\'ll notify you when payment is confirmed.');
          
          // Start gentle polling as fallback (webhook should handle it)
          startFallbackPolling(paymentData.reference);
        }
      }
    }
////
  } catch (error: any) {
    console.error('Deposit failed:', error);
    const errorMessage = error.message || 'Deposit failed. Please try again.';
    setDepositError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

const startFallbackPolling = (reference: string) => {
  // Only poll as backup - webhooks should handle the confirmation
  const pollInterval = setInterval(async () => {
    try {
      await checkWalletStatus(); // Just refresh wallet data
      
      // Check if we should stop polling (user might have manually refreshed)
      const stillPending = localStorage.getItem('pending_payment_reference');
      if (!stillPending || stillPending !== reference) {
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('Fallback polling error:', error);
    }
  }, 10000); // Poll every 10 seconds

  // Stop after 5 minutes (webhook should have worked by then)
  setTimeout(() => {
    clearInterval(pollInterval);
    localStorage.removeItem('pending_payment_reference');
  }, 300000);
};

  /////////
  const testDepositWithExactFormat = async () => {
    setLoading(true);
    try {
      const testData = {
        amount: 1000.0, // ₦1000 exactly as f64
        payment_method: "Card", // Exact enum value
        description: "Test wallet deposit", // Required description
        metadata: {
          source: "web_app_test",
          timestamp: new Date().toISOString()
        }
      };

      console.log('Testing with exact format:', testData);

      const response = await fetch('https://verinest.up.railway.app/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
        body: JSON.stringify(testData),
      });

      const responseText = await response.text();
      console.log('Test response status:', response.status);
      console.log('Test response body:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (response.ok) {
        toast.success('✅ Deposit test successful! Format is correct.');
        console.log('✅ Successful response:', responseData);
      } else {
        toast.error(`❌ Test failed: ${response.status} ${responseData.message || ''}`);
        console.log('❌ Error response:', responseData);
        
        // Show detailed error info
        if (responseData.errors) {
          console.log('Validation errors:', responseData.errors);
        }
      }

      return { status: response.status, data: responseData };
    } catch (error: any) {
      console.error('Test failed:', error);
      toast.error(`Test error: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /////////////

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const withdrawAmount = parseFloat(withdrawData.amount);
      
      if (isNaN(withdrawAmount) || withdrawAmount < 100) {
        toast.error('Please enter a valid amount (minimum ₦100)');
        return;
      }

      if (withdrawAmount > 5000000) {
        toast.error('Maximum withdrawal amount is ₦5,000,000');
        return;
      }

      if (withdrawAmount > (walletData?.balance || 0)) {
        toast.error('Insufficient balance');
        return;
      }

      if (!withdrawData.bank_account_id) {
        toast.error('Please select a bank account');
        return;
      }

      const requestBody = {
        amount: withdrawAmount,
        bank_account_id: withdrawData.bank_account_id,
        description: 'Wallet withdrawal',
        metadata: {
          source: "web_app",
          timestamp: new Date().toISOString()
        }
      };

      console.log('Withdraw request:', requestBody);

      const response = await fetch('https://verinest.up.railway.app/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Withdraw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast.success('Withdrawal request submitted successfully!');
        setWithdrawData({ amount: '', bank_account_id: '' });
        await checkWalletStatus();
      } else {
        if (response.status === 422 && responseData.errors) {
          const validationErrors = Object.values(responseData.errors).flat();
          throw new Error(validationErrors.join(', '));
        } else {
          throw new Error(responseData.message || `Withdrawal failed (${response.status})`);
        }
      }
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast.error(error.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };


  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/wallet/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
        body: JSON.stringify({
          amount: parseFloat(transferData.amount),
          recipient_identifier: transferData.recipient_identifier,
          description: transferData.description || 'Fund transfer'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Transfer completed successfully!');
        setTransferData({ amount: '', recipient_identifier: '', description: '' });
        await checkWalletStatus();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Transfer failed:', error);
      toast.error(error.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('🔄 Adding bank account...', bankAccountData);
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/bank-accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
        body: JSON.stringify(bankAccountData),
      });

      console.log('Add bank account response status:', response.status);
      
      const responseText = await response.text();
      console.log('Add bank account response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast.success('Bank account added successfully!');
        setBankAccountData({ account_name: '', account_number: '', bank_code: '' });
        
        // Refresh the bank accounts list
        await fetchBankAccounts();
        
        // Switch to withdraw tab if this was the first account
        if (bankAccounts.length === 0) {
          setActiveTab('withdraw');
        }
      } else {
        if (response.status === 422 && responseData.errors) {
          const validationErrors = Object.values(responseData.errors).flat();
          throw new Error(validationErrors.join(', '));
        } else {
          throw new Error(responseData.message || `Failed to add bank account (${response.status})`);
        }
      }
    } catch (error: any) {
      console.error('Failed to add bank account:', error);
      toast.error(error.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryAccount = async (accountId: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/wallet/bank-accounts/${accountId}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      if (response.ok) {
        toast.success('Primary account updated successfully!');
        await fetchBankAccounts();
      } else {
        throw new Error('Failed to set primary account');
      }
    } catch (error: any) {
      console.error('Failed to set primary account:', error);
      toast.error(error.message || 'Failed to set primary account');
    }
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


const refreshBankAccounts = async () => {
    await fetchBankAccounts();
    toast.success('Bank accounts refreshed');
  };

  // FIX: Add a manual refresh function for transactions
  const refreshTransactions = async () => {
    await fetchTransactions();
    toast.success('Transactions refreshed');
  };

  // Fix the helper functions
const getStatusBadge = (status: any) => {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;
  
  const statusString = typeof status === 'string' ? status.toLowerCase() : 'pending';
  
  const variants = {
    pending: 'secondary',
    success: 'default',
    completed: 'default',
    failed: 'destructive',
    error: 'destructive',
  } as const;

  return (
    <Badge variant={variants[statusString as keyof typeof variants] || 'secondary'}>
      {statusString}
    </Badge>
  );
};

const getTypeIcon = (type: any) => {
  if (!type) return <Wallet className="h-4 w-4 text-gray-600" />;
  
  const typeString = typeof type === 'string' ? type.toLowerCase() : 'other';
  
  switch (typeString) {
    case 'deposit':
      return <ArrowDown className="h-4 w-4 text-green-600" />;
    case 'withdrawal':
      return <ArrowUp className="h-4 w-4 text-red-600" />;
    case 'transfer':
      return <Send className="h-4 w-4 text-blue-600" />;
    default:
      return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

   // Show loading state
    if (fetching) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet
            </CardTitle>
            <CardDescription>Loading wallet information...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      );
    }

  // Show wallet setup if not created
  if (!walletData?.wallet_created) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Setup
            </CardTitle>
            <CardDescription>
              Create your wallet to start managing funds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You need to create a wallet to deposit, withdraw, and transfer funds.
                Your wallet will be securely created and ready to use.
              </AlertDescription>
            </Alert>
            <Button onClick={createWallet} disabled={loading} className="w-full">
              {loading ? 'Creating Wallet...' : 'Create Wallet'}
            </Button>
          </CardContent>
        </Card>

        {/* Debug info */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Wallet created: {walletData?.wallet_created ? 'Yes' : 'No'}<br />
              Wallet ID: {walletData?.id || 'Not set'}<br />
              Balance: {formatCurrency(walletData?.balance || 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  // Show full wallet interface if wallet exists
  return (
    <div className="space-y-6">
      {/* Wallet Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and transactions</p>
        </div>
        <Button variant="outline" onClick={checkWalletStatus} disabled={fetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(walletData.balance || 0)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Available balance
          </p>
          {walletData.account_number && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Wallet Details</p>
              <p className="text-sm text-muted-foreground">
                Account: {walletData.account_number} • {walletData.bank_name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Wallet Actions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="banks">Bank Accounts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your funds quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('deposit')}
                  >
                    <ArrowDown className="h-6 w-6 mb-2 text-green-600" />
                    <span>Deposit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('withdraw')}
                  >
                    <ArrowUp className="h-6 w-6 mb-2 text-red-600" />
                    <span>Withdraw</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('transfer')}
                  >
                    <Send className="h-6 w-6 mb-2 text-blue-600" />
                    <span>Transfer</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                    Recent Transactions
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshTransactions}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardDescription>
                {transactions.length === 0 
                  ? "Your transaction history will appear here" 
                  : `Your recent wallet activity (${transactions.length} transactions)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your transaction history will appear here once you make transactions</p>
                  {walletData?.balance && walletData.balance > 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('deposit')}
                    >
                      Make Your First Deposit
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(transaction.type || transaction.type)}
                        <div>
                          <p className="font-medium capitalize">
                            {transaction.type || transaction.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          (transaction.type || transaction.type) === 'deposit' ? 'text-green-600' : 
                          (transaction.type || transaction.type) === 'withdrawal' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {(transaction.type || transaction.type) === 'deposit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {transactions.length > 5 && (
                <Button variant="outline" className="w-full mt-4">
                  View All Transactions ({transactions.length})
                </Button>
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* Deposit Tab */}
       <TabsContent value="deposit">
        <Card>
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>
              Add money to your wallet. Minimum: ₦100, Maximum: ₦10,000,000
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Debug button for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={testDepositWithExactFormat}
                  disabled={loading}
                  className="w-full"
                >
                  Test Deposit with Exact Format
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Tests with: amount=1000, payment_method="Card", description="Test wallet deposit"
                </p>
              </div>
            )}

            {depositError && (
              <Alert variant="destructive">
                <AlertDescription>{depositError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  max="10000000"
                  step="0.01"
                  required
                  value={depositData.amount}
                  onChange={(e) => {
                    setDepositData({ ...depositData, amount: e.target.value });
                    setDepositError('');
                  }}
                  placeholder="Enter amount (e.g., 1000.50)"
                />
                <p className="text-sm text-muted-foreground">
                  Enter amount in Naira. Decimals allowed.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select 
                  value={depositData.payment_method} 
                  onValueChange={(value: 'Card' | 'BankTransfer' | 'USSD') => 
                    setDepositData({ ...depositData, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card Payment
                      </div>
                    </SelectItem>
                    <SelectItem value="BankTransfer">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="USSD">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                          <line x1="12" y1="18" x2="12" y2="18"></line>
                        </svg>
                        USSD
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  required
                  value={depositData.description}
                  onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                  placeholder="Enter deposit description"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-sm text-blue-800 mb-2">Request Format Being Sent:</h4>
                <pre className="text-xs bg-white p-2 rounded border text-blue-700 overflow-x-auto">
                        {`{
                        "amount": ${parseFloat(depositData.amount || '0')},
                        "payment_method": "${depositData.payment_method}",
                        "description": "${depositData.description}",
                        "metadata": {
                            "source": "web_app",
                            "user_id": "${user?.id}",
                            "timestamp": "${new Date().toISOString()}"
                        }
                        }`}
                </pre>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !depositData.amount || !depositData.description}
                size="lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  `Deposit ₦${parseFloat(depositData.amount || '0').toLocaleString()}`
                )}
              </Button>
            </form>

            {/* Additional debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Backend Expectations:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>amount</strong>: f64 (100.0 to 10,000,000.0)</li>
                  <li>• <strong>payment_method</strong>: "Card" | "BankTransfer" | "USSD"</li>
                  <li>• <strong>description</strong>: String (required, min length 1)</li>
                  <li>• <strong>metadata</strong>: Optional JSON object</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw">
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>
              Transfer money to your bank account. Minimum: ₦100, Maximum: ₦5,000,000
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw_amount">Amount (₦)</Label>
                <Input
                  id="withdraw_amount"
                  type="number"
                  min="100"
                  max="5000000"
                  step="0.01"
                  required
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                  placeholder="Enter amount"
                />
                <p className="text-sm text-muted-foreground">
                  Available: {formatCurrency(walletData?.balance || 0)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank_account">Bank Account</Label>
                <Select 
                  value={withdrawData.bank_account_id} 
                  onValueChange={(value) => setWithdrawData({ ...withdrawData, bank_account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.length === 0 ? (
                      <SelectItem value="no-accounts" disabled>
                        No bank accounts added
                      </SelectItem>
                    ) : (
                      bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <div>
                              <div>{account.account_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {account.account_number} • {account.bank_name}
                                {account.is_primary && ' • Primary'}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {bankAccounts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Please add a bank account first in the "Bank Accounts" tab
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || bankAccounts.length === 0 || !withdrawData.amount}
              >
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </form>

            {bankAccounts.length === 0 && (
              <div className="mt-4 p-4 border border-dashed rounded-lg text-center">
                <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No bank accounts added yet. Add a bank account to enable withdrawals.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setActiveTab('banks')}
                >
                  Add Bank Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Transfer Tab */}
      <TabsContent value="transfer">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Funds</CardTitle>
            <CardDescription>Send money to another VeriNest user</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer_amount">Amount (₦)</Label>
                <Input
                  id="transfer_amount"
                  type="number"
                  min="10"
                  max="1000000"
                  step="0.01"
                  required
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  placeholder="Enter amount"
                />
                <p className="text-sm text-muted-foreground">
                  Available: {formatCurrency(walletData?.balance || 0)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient (Email or Username)</Label>
                <Input
                  id="recipient"
                  type="text"
                  required
                  value={transferData.recipient_identifier}
                  onChange={(e) => setTransferData({ ...transferData, recipient_identifier: e.target.value })}
                  placeholder="Enter recipient's email or username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer_description">Description</Label>
                <Input
                  id="transfer_description"
                  type="text"
                  required
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                  placeholder="Enter transfer description"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Transfer Funds'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bank Accounts Tab */}
     <TabsContent value="banks">
        <Card>
            <CardHeader>
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Manage your linked bank accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Bank Account Form - Only show if no accounts or explicitly adding */}
              {(bankAccounts.length === 0 || activeTab === 'banks') && (
                <form onSubmit={handleAddBankAccount} className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">
                    {bankAccounts.length === 0 ? 'Add Your First Bank Account' : 'Add Another Bank Account'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_name">Account Name</Label>
                      <Input
                        id="account_name"
                        type="text"
                        required
                        value={bankAccountData.account_name}
                        onChange={(e) => setBankAccountData({ ...bankAccountData, account_name: e.target.value })}
                        placeholder="Enter account name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        type="text"
                        required
                        value={bankAccountData.account_number}
                        onChange={(e) => setBankAccountData({ ...bankAccountData, account_number: e.target.value })}
                        placeholder="Enter 10-digit account number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_code">Bank</Label>
                    <Select 
                      value={bankAccountData.bank_code} 
                      onValueChange={(value) => setBankAccountData({ ...bankAccountData, bank_code: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {bank.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Adding...' : 'Add Bank Account'}
                  </Button>
                </form>
              )}

              {/* Bank Accounts List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Your Bank Accounts</h3>
                  {bankAccounts.length > 0 && (
                    <Badge variant="secondary">
                      {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bank accounts added yet</p>
                    <p className="text-sm">Add a bank account to enable withdrawals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{account.account_name}</p>
                              {account.is_primary && (
                                <Badge variant="default" className="ml-2">Primary</Badge>
                              )}
                              {!account.verified && (
                                <Badge variant="outline" className="ml-2">Pending Verification</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {account.account_number} • {account.bank_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!account.is_primary && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSetPrimaryAccount(account.id)}
                              >
                                Set Primary
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Tab */}

        {/* Bank Accounts Tab */}
      </Tabs>
    </div>
  );
};