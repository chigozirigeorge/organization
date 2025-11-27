// components/WalletManagement.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { TransactionPinModal } from './TransactionPinModal';
import { TransactionPinSetup } from './TransactionPinSetup';
import { 
  ArrowDown, 
  ArrowUp, 
  Award,
  Building,
  Calendar,
  CreditCard,
  History,
  Plus,
  RefreshCw, 
  Send, 
  Shield,
  Star,
  TrendingUp,
  User,
  Wallet
} from 'lucide-react';

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
  const [showPinDialog, setShowPinDialog] = useState(false);
  //
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
  type: 'transfer' | 'withdrawal';
  data: any;
  callback: (pin: string) => Promise<void>;
  } | null>(null);
//
  const [currentTransaction, setCurrentTransaction] = useState<{
    type: 'transfer' | 'withdrawal';
    data: any;
  } | null>(null);

  // Form states
  const [depositData, setDepositData] = useState({
    amount: '',
    payment_method: 'Card' as 'Card' | 'BankTransfer' | 'USSD',
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

  const navigate = useNavigate();

  // Add this function to check if user has transaction PIN
  const checkTransactionPin = async (): Promise<boolean> => {
      if (!user?.transaction_pin_set) {
        // User doesn't have PIN set up
        const setupPin = window.confirm(
          'You need to set up a transaction PIN to perform financial transactions. Would you like to set it up now?'
        );
        if (setupPin) {
          setShowPinSetup(true);
        }
        return false;
      }
      return true;
  };

  const checkWalletStatus = async () => {
    setFetching(true);
    try {
      
      const walletResponse = await fetch('https://verinest.up.railway.app/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        
        if (walletData.data) {
          const newWalletData = {
            ...walletData.data,
            wallet_created: true
          };
          setWalletData(newWalletData);
          
          await fetchBankAccounts();
          await fetchTransactions();
        } else {
          setWalletData({
            id: '',
            balance: 0,
            currency: 'NGN',
            wallet_created: false
          });
        }
      } else if (walletResponse.status === 404) {
        setWalletData({
          id: '',
          balance: 0,
          currency: 'NGN',
          wallet_created: false
        });
      } else {
        const errorText = await walletResponse.text();
        setWalletData({
          id: '',
          balance: 0,
          currency: 'NGN',
          wallet_created: false
        });
      }
    } catch (error) {
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

  const fetchBankAccounts = async () => {
    try {
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/bank-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });
      
      if (response.ok) {
        const data = await response.json();
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
        
        setBankAccounts(accountsData);
      } else {
        const errorText = await response.text();
        setBankAccounts([]);
      }
    } catch (error) {
      setBankAccounts([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });
      
      if (response.ok) {
        const data = await response.json();
        
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
          transactionsData = [];
        }
        
        const uniqueTransactions = new Map();
        
        transactionsData.forEach((tx: any) => {
          const txId = tx.id || tx.transaction_id || tx.reference || `tx_${Date.now()}_${Math.random()}`;
          
          if (!uniqueTransactions.has(txId)) {
            uniqueTransactions.set(txId, {
              id: txId,
              reference: tx.reference || tx.id || `ref_${txId}`,
              amount: parseFloat(tx.amount) || 0,
              type: mapTransactionType(tx.type || tx.transaction_type || tx.transactionType),
              status: mapTransactionStatus(tx.status || tx.transaction_status),
              description: tx.description || tx.narration || tx.purpose || 'Transaction',
              created_at: tx.created_at || tx.createdAt || tx.date || new Date().toISOString(),
              metadata: tx.metadata || {}
            });
          }
        });
        
        const transformedTransactions = Array.from(uniqueTransactions.values());
        
        transformedTransactions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setTransactions(transformedTransactions);
        
      } else if (response.status === 500) {
        const errorText = await response.text();
        
        if (errorText.includes('transaction_type')) {
          await useFallbackTransactions();
        } else {
          setTransactions([]);
          toast.error('Temporarily unable to load transactions');
        }
        
      } else {
        const errorText = await response.text();
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    }
  };

  const mapTransactionType = (type: any): 'deposit' | 'withdrawal' | 'transfer' => {
    if (!type) return 'transfer';
    
    const typeString = String(type).toLowerCase().trim();
    
    if (typeString.includes('deposit') || typeString.includes('credit')) return 'deposit';
    if (typeString.includes('withdraw') || typeString.includes('debit')) return 'withdrawal';
    
    return 'transfer';
  };

  const mapTransactionStatus = (status: any): 'pending' | 'success' | 'failed' => {
    if (!status) return 'pending';
    
    const statusString = String(status).toLowerCase().trim();
    
    if (statusString.includes('success') || statusString.includes('completed') || statusString.includes('approved')) 
      return 'success';
    if (statusString.includes('fail') || statusString.includes('error') || statusString.includes('rejected')) 
      return 'failed';
    
    return 'pending';
  };

  const useFallbackTransactions = async () => {
    try {
      
      const walletResponse = await fetch('https://verinest.up.railway.app/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        
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
      setTransactions([]);
    }
  };

  const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
    const uniqueTransactions = Array.from(
      new Map(transactions.map(tx => [tx.id, tx])).values()
    );
    
    return (
      <div className="space-y-4">
        {uniqueTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {getTypeIcon(transaction.type)}
              <div>
                <p className="font-medium capitalize">
                  {transaction.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transaction.description}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(transaction.created_at)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ref: {transaction.reference}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${
                transaction.type === 'deposit' ? 'text-green-600' : 
                transaction.type === 'withdrawal' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const createWallet = async () => {
    setLoading(true);
    try {
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
      });
      
      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast.success('Wallet created successfully!');
        
        if (responseData.data) {
          const newWalletData = {
            ...responseData.data,
            wallet_created: true
          };
          setWalletData(newWalletData);
          
          await fetchBankAccounts();
          await fetchTransactions();
        } else {
          await checkWalletStatus();
        }
      } else {
        if (responseData.message?.includes('already exists') || response.status === 400) {
          toast.info('Wallet already exists. Loading wallet data...');
          await checkWalletStatus();
        } else {
          throw new Error(responseData.message || 'Failed to create wallet');
        }
      }
    } catch (error: any) {
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

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDepositError('');
    
    try {
      const depositAmount = parseFloat(depositData.amount);
      
      if (isNaN(depositAmount) || depositAmount < 100) {
        toast.error('Please enter a valid amount (minimum ₦100)');
        return;
      }

      if (depositAmount > 10000000) {
        toast.error('Maximum deposit amount is ₦10,000,000');
        return;
      }

      const requestBody = {
        amount: depositAmount,
        payment_method: depositData.payment_method,
        description: depositData.description,
        metadata: {
          source: "web_app",
          user_id: user?.id,
          user_email: user?.email,
          timestamp: new Date().toISOString(),
          redirect_url: `${window.location.origin}/payment/verify`
        }
      };

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
          localStorage.setItem('pending_payment_reference', paymentData.reference);
          
          const paystackWindow = window.open(
            paymentData.payment_url,
            'paystack_payment',
            'width=600,height=700'
          );
          
          if (paystackWindow) {
            toast.success('Payment window opened. You can close this tab - we\'ll notify you when payment is confirmed.');
            startFallbackPolling(paymentData.reference);
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Deposit failed. Please try again.';
      setDepositError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startFallbackPolling = (reference: string) => {
    const pollInterval = setInterval(async () => {
      try {
        await checkWalletStatus();
        
        const stillPending = localStorage.getItem('pending_payment_reference');
        if (!stillPending || stillPending !== reference) {
          clearInterval(pollInterval);
        }
      } catch (error) {
      }
    }, 10000);

    setTimeout(() => {
      clearInterval(pollInterval);
      localStorage.removeItem('pending_payment_reference');
    }, 300000);
  };

  const handleWithdrawRequest = async (requestBody: any) => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('📨 Withdraw response status:', response.status);
      console.log('📨 Withdraw response body:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      // Handle PIN requirement first
      if (responseData?.status === "error" && responseData.message.includes("transaction_pin")) {
        setShowPinDialog(true);
        setCurrentTransaction({ 
          type: 'withdrawal', 
          data: requestBody 
        });
        return false;
      }

      if (!response.ok) {
        // Check for specific error cases
        if (response.status === 404 && responseText.includes('bank account not found')) {
          throw new Error('Bank account not found. Please check the account details.');
        } else if (response.status === 401) {
          throw new Error('Invalid PIN or OTP. Please try again.');
        } else if (response.status === 400) {
          throw new Error(responseData.message || 'Invalid withdrawal request. Please check your details.');
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions. Please verify your account.');
        } else if (response.status === 422 && responseData.errors) {
          const validationErrors = Object.values(responseData.errors).flat();
          throw new Error(validationErrors.join(', '));
        }
        
        throw new Error(responseData.message || 'Withdrawal failed. Please try again.');
      }

      toast.success('Withdrawal request submitted successfully!');
      setWithdrawData({ amount: '', bank_account_id: '' });
      await checkWalletStatus();
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw validation and specific errors
      }
      throw new Error('An unexpected error occurred during withdrawal');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user has PIN set up
    const hasPin = await checkTransactionPin();
    if (!hasPin) return;

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

      // await handleWithdrawRequest(requestBody);
      // Set up pending transaction and show PIN modal
    setPendingTransaction({
      type: 'withdrawal',
      data: requestBody,
      callback: async (pin: string) => {
        await handleWithdrawRequest({ ...requestBody, transaction_pin: pin });
      }
    });
    setShowPinModal(true);
      
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast.error(error.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

// In WalletManagement.tsx
const TransactionPinDialog = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSubmit = async () => {
    if (!currentTransaction) return;

    try {
      const data = {
        ...currentTransaction.data,
        transaction_pin: pin
      };

      if (currentTransaction.type === 'transfer') {
        await handleTransferRequest(data);
      } else {
        await handleWithdrawRequest(data);
      }
      setShowPinDialog(false);
    } catch (error) {
      setError('Invalid PIN. Please try again.');
    }
  };

  const handleRequestOtp = async () => {
    setSendingOtp(true);
    try {
      if (currentTransaction) {
        // Try the transaction without PIN to trigger OTP send
        if (currentTransaction.type === 'transfer') {
          await handleTransferRequest(currentTransaction.data);
        } else {
          await handleWithdrawRequest(currentTransaction.data);
        }
      }
    } finally {
      setSendingOtp(false);
      setShowPinDialog(false);
    }
  };

  return (
    <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Transaction PIN</DialogTitle>
          <DialogDescription>
            Please enter your 4-digit transaction PIN to continue
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Transaction PIN</Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter className="flex-col space-y-2">
          <Button onClick={handleSubmit} disabled={pin.length !== 4}>
            Confirm Transaction
          </Button>
          <Button
            variant="outline"
            onClick={handleRequestOtp}
            disabled={sendingOtp}
          >
            {sendingOtp ? 'Sending OTP...' : 'Use Email OTP Instead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const handleTransferRequest = async (requestBody: any) => {
  const response = await fetch('https://verinest.up.railway.app/api/wallet/transfer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { message: responseText };
  }

  if (response.ok) {
    toast.success('Transfer completed successfully!');
    setTransferData({ amount: '', recipient_identifier: '', description: '' });
    await checkWalletStatus(); // Refresh wallet data
    return true;
  } else {
    // Handle specific error cases
    if (responseData.status === "error" && responseData.message.includes("transaction_pin")) {
      setShowPinDialog(true);
      setCurrentTransaction({ 
        type: 'transfer', 
        data: requestBody 
      });
      return false;
    }
    
    if (response.status === 404 && responseData.message === "Recipient not found") {
      throw new Error('Recipient not found. Please check the email address.');
    } else if (response.status === 404) {
      throw new Error('Transfer service is currently unavailable. Please try again later.');
    } else if (response.status === 400) {
      throw new Error(responseData.message || 'Invalid transfer request');
    } else if (response.status === 422) {
      throw new Error('Validation failed. Please check the recipient details.');
    } else {
      throw new Error(responseData.message || `Transfer failed: ${response.status}`);
    }
  }
};

const handleTransfer = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check if user has PIN set up
  const hasPin = await checkTransactionPin();
  if (!hasPin) return;

  setLoading(true);
  try {
    const transferAmount = parseFloat(transferData.amount);
    
    if (isNaN(transferAmount) || transferAmount < 1) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (transferAmount > (walletData?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!transferData.recipient_identifier) {
      toast.error('Please enter recipient email or username');
      return;
    }

    const requestBody = {
      amount: transferAmount,
      recipient_identifier: transferData.recipient_identifier.trim(),
      description: transferData.description || 'Fund transfer'
    };

    // await handleTransferRequest(requestBody);
    setPendingTransaction({
      type: 'transfer',
      data: requestBody,
      callback: async (pin: string) => {
        await handleTransferRequest({ ...requestBody, transaction_pin: pin });
      }
    });
    setShowPinModal(true);

  } catch (error: any) {
    toast.error(error.message || 'Transfer failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Add the PIN verification handler
const handlePinVerify = async (pin: string) => {
  if (pendingTransaction) {
    try {
      await pendingTransaction.callback(pin);
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed');
    }
  }
  setPendingTransaction(null);
};

// Add the PIN setup completion handler
const handlePinSetupComplete = () => {
  toast.success('Transaction PIN set up successfully!');
  setShowPinSetup(false);
};

/////

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      const response = await fetch('https://verinest.up.railway.app/api/wallet/bank-accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } as HeadersInit,
        body: JSON.stringify(bankAccountData),
      });
      
      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast.success('Bank account added successfully!');
        setBankAccountData({ account_name: '', account_number: '', bank_code: '' });
        
        await fetchBankAccounts();
        
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

  const refreshTransactions = async () => {
    await fetchTransactions();
    toast.success('Transactions refreshed');
  };

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

  return (
    <div className="space-y-6">
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* UPDATED: Added trust_point tab to the TabsList */}
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="banks">Bank Accounts</TabsTrigger>
          <TabsTrigger value="trust_point">Trust Score</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your funds quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
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

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Transactions
                  </CardTitle>
                  {/* <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshTransactions}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button> */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/dashboard/wallet/transactions')} // or your preferred navigation
                  >
                    View All Transactions
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
                  <TransactionList transactions={transactions.slice(0, 5)} />
                )}
                
                {transactions.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab('transactions')}
                  >
                    View All Transactions
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Bank Accounts
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshBankAccounts}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <CardDescription>
                  {bankAccounts.length === 0 
                    ? "Add bank accounts to withdraw funds" 
                    : `Your linked bank accounts (${bankAccounts.length})`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No bank accounts linked</p>
                    <Button onClick={() => setActiveTab('banks')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bank Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{account.account_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.account_number} • {account.bank_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {account.is_primary && (
                                <Badge variant="default">Primary</Badge>
                              )}
                              {account.verified ? (
                                <Badge variant="default">Verified</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </div>
                          </div>
                        </div>
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
                    ))}
                  </div>
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
              <CardDescription>Add money to your wallet using any payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={depositData.amount}
                    onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                    min="100"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum deposit: ₦100
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Card">Card Payment</SelectItem>
                      <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                      <SelectItem value="USSD">USSD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Deposit description"
                    value={depositData.description}
                    onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                  />
                </div>

                {depositError && (
                  <Alert variant="destructive">
                    <AlertDescription>{depositError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>Transfer money from your wallet to your bank account</CardDescription>
            </CardHeader>
            <CardContent>
              {bankAccounts.length === 0 ? (
                <div className="text-center space-y-4 py-4">
                  <Alert>
                    <AlertDescription>
                      You need to add a bank account before you can withdraw funds.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={() => setActiveTab('banks')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (₦)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawData.amount}
                      onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                      min="100"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Available balance: {formatCurrency(walletData.balance || 0)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank-account">Bank Account</Label>
                    <Select
                      value={withdrawData.bank_account_id}
                      onValueChange={(value) => setWithdrawData({ ...withdrawData, bank_account_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_name} - {account.account_number} ({account.bank_name})
                            {account.is_primary && ' (Primary)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : 'Withdraw Funds'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Tab */}
        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Funds</CardTitle>
              <CardDescription>Send money to another user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">Amount (₦)</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    min="1"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Available balance: {formatCurrency(walletData.balance || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email or Username</Label>
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="Enter recipient's email or username"
                    value={transferData.recipient_identifier}
                    onChange={(e) => setTransferData({ ...transferData, recipient_identifier: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-description">Description (Optional)</Label>
                  <Input
                    id="transfer-description"
                    placeholder="Transfer description"
                    value={transferData.description}
                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
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
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Bank Account</CardTitle>
                <CardDescription>Link a bank account to withdraw funds</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBankAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_name">Account Name</Label>
                    <Input
                      id="account_name"
                      placeholder="Enter account name as it appears on bank records"
                      value={bankAccountData.account_name}
                      onChange={(e) => setBankAccountData({ ...bankAccountData, account_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      placeholder="Enter 10-digit account number"
                      value={bankAccountData.account_number}
                      onChange={(e) => setBankAccountData({ ...bankAccountData, account_number: e.target.value })}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                    />
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
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Bank Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Bank Accounts</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshBankAccounts}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <CardDescription>
                  {bankAccounts.length === 0 
                    ? "No bank accounts linked yet" 
                    : `Manage your linked bank accounts`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bank accounts added yet</p>
                    <p className="text-sm">Add a bank account to withdraw funds from your wallet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{account.account_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.account_number} • {account.bank_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {account.is_primary && (
                                <Badge variant="default">Primary</Badge>
                              )}
                              {account.verified ? (
                                <Badge variant="default">Verified</Badge>
                              ) : (
                                <Badge variant="secondary">Pending Verification</Badge>
                              )}
                            </div>
                          </div>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NEW: Trust Score Tab */}
        <TabsContent value="trust_point">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Trust Score
              </CardTitle>
              <CardDescription>
                Your financial trustworthiness and reliability rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Trust Score Overview */}
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">85%</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Excellent</h3>
                    <p className="text-sm text-muted-foreground">
                      Your trust score is in the top 20% of users
                    </p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-medium">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span>Profile Completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">95%</span>
                        <Badge variant="default">Excellent</Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-blue-600" />
                        <span>Transaction History</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">80%</span>
                        <Badge variant="default">Good</Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>Account Age</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">75%</span>
                        <Badge variant="secondary">Average</Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <span>Activity Level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">90%</span>
                        <Badge variant="default">Excellent</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h4 className="font-medium">Your Benefits</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Higher Transaction Limits</p>
                        <p className="text-sm text-muted-foreground">Up to ₦5,000,000 per transaction</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Star className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Priority Support</p>
                        <p className="text-sm text-muted-foreground">24/7 dedicated customer service</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Better Rates</p>
                        <p className="text-sm text-muted-foreground">Preferred exchange rates and fees</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvement Tips */}
                <div className="space-y-4">
                  <h4 className="font-medium">Improve Your Score</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Complete your profile verification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Maintain consistent transaction activity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Keep your account in good standing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Add multiple verification methods</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction PIN Dialog
      <TransactionPinDialog /> */}
      <TransactionPinModal
      isOpen={showPinModal}
      onClose={() => {
        setShowPinModal(false);
        setPendingTransaction(null);
      }}
      onVerify={handlePinVerify}
      transactionType={pendingTransaction?.type || 'payment'}
      transactionData={pendingTransaction?.data}
      amount={parseFloat(pendingTransaction?.data.amount || '0')}
    />

    {/* Transaction PIN Setup Modal */}
    <TransactionPinSetup
      isOpen={showPinSetup}
      onClose={() => setShowPinSetup(false)}
      onSetupComplete={handlePinSetupComplete}
    />
    </div>
  );
};