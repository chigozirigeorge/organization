import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getContract, signContract } from '../../services/labour';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Loader2, FileText, ArrowLeft } from 'lucide-react';
import { TransactionPinModal } from '../shared/TransactionPinModal';
import { TransactionPinSetup } from '../shared/TransactionPinSetup';

interface ContractSignProps {
  contractId: string;
}

export const ContractSign = ({ contractId }: ContractSignProps) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [contract, setContract] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    if (!contractId) return;
    fetchContract();
  }, [contractId, token]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await getContract(contractId);
      const data = res.data || res;
      setContract(data);
    } catch (err: any) {
      console.error('Failed to load contract:', err);
      toast.error(err?.message || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!contractId) return;

    // If user doesn't have a transaction PIN set, prompt setup
    if (!user?.transaction_pin_set) {
      setShowPinSetup(true);
      toast.info('You need to set up a transaction PIN before signing contracts');
      return;
    }

    // Open the PIN verification modal. After successful verification the onVerify handler
    // will call the actual sign endpoint (so we return early here).
    setShowPinModal(true);
  };

  const requestOtp = async () => {
    if (!contractId) return;
    setInfoMessage('Requesting OTP...');
    try {
      // Ask server to send OTP. server may accept { request_otp: true } on sign endpoint.
      await signContract(contractId, { request_otp: true });
      setInfoMessage('OTP sent. Check your phone or email.');
      setOtpRequired(true);
      toast.success('OTP sent');
    } catch (err: any) {
      console.error('Request OTP failed:', err);
      setInfoMessage('Failed to request OTP. Please try again.');
      toast.error('Failed to request OTP');
    }
  };

  const submitOtp = async () => {
    if (!contractId) return;
    setSigning(true);
    try {
      await signContract(contractId, { otp_code: otp });
      toast.success('Contract signed successfully');
      navigate('/dashboard/contracts');
    } catch (err: any) {
      console.error('Submit OTP failed:', err);
      let parsed = null;
      try { parsed = typeof err.message === 'string' ? JSON.parse(err.message) : null; } catch (e) { parsed = null; }
      if (parsed && parsed.body && parsed.body.message) {
        toast.error(parsed.body.message);
      } else {
        toast.error(err?.message || 'Failed to sign contract');
      }
    } finally {
      setSigning(false);
    }
  };

  // Called after TransactionPinModal verifies the PIN (or OTP) successfully
  const handlePinVerified = async (pinOrFlag: string) => {
    if (!contractId) return;
    setShowPinModal(false);
    setSigning(true);
    try {
      const res = await signContract(contractId);
      const payload = res.data || res;
      toast.success('Contract signed successfully');
      navigate('/dashboard/contracts');
    } catch (err: any) {
      console.error('Sign contract failed after PIN verification:', err);
      // If still unauthorized because verification expired, re-open PIN modal
      if (err?.message && String(err.message).toLowerCase().includes('pin') || String(err.message).toLowerCase().includes('transaction pin not verified')) {
        toast.error('PIN verification expired. Please verify again.');
        setShowPinModal(true);
        return;
      }

      // Handle legacy OTP requirement
      let parsed: any = null;
      try { parsed = typeof err.message === 'string' ? JSON.parse(err.message) : null; } catch (e) { parsed = null; }
      if (parsed && parsed.body && parsed.body.message && String(parsed.body.message).toLowerCase().includes('otp')) {
        setOtpRequired(true);
        setInfoMessage('An OTP is required to sign this contract. Please request an OTP and enter it below.');
        toast.info('OTP required to sign contract. Enter the code to continue.');
        return;
      }

      toast.error(err?.message || 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contract not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">We couldn't find that contract.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate('/dashboard/contracts')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"> 
          <FileText className="h-5 w-5" /> Contract: {contract.id}
        </h1>
      </div>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">Job: {contract.job?.title || contract.job_id}</p>
          <p className="text-sm mb-4">Terms:</p>
          <pre className="bg-slate-50 p-3 rounded text-sm whitespace-pre-wrap">{contract.terms || 'No terms provided'}</pre>

          <div className="flex gap-3 mt-4 items-center">
            <Button onClick={() => navigate(`/dashboard/jobs/${contract.job_id}`)} variant="outline">
              View Job
            </Button>
            {!otpRequired ? (
              <>
                  <Button onClick={handleSign} disabled={signing}>
                  {signing ? 'Signing...' : 'Sign Contract'}
                </Button>
                <Button variant="outline" onClick={requestOtp}>
                  Request OTP
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button onClick={submitOtp} disabled={signing || otp.length === 0}>
                  {signing ? 'Verifying...' : 'Verify & Sign'}
                </Button>
              </div>
            )}
          </div>
          {infoMessage && <p className="text-sm text-muted-foreground mt-2">{infoMessage}</p>}
        </CardContent>
      </Card>
      {/* Transaction PIN modals */}
      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerify={handlePinVerified}
        transactionType="contract_sign"
        amount={contract?.agreed_rate || contract?.job?.budget || 0}
      />

      <TransactionPinSetup
        isOpen={showPinSetup}
        onClose={() => setShowPinSetup(false)}
        onSetupComplete={() => {
          setShowPinSetup(false);
          // Refresh contract and user state if needed
          fetchContract();
          toast.success('Transaction PIN set up. Please verify to continue signing.');
        }}
      />
    </div>
  );
};

export default ContractSign;
