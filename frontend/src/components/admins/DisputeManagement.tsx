// components/DisputeManagement.tsx (Updated with role-based access)
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, FileText, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Dispute, Contract } from '../../types/labour';

export const DisputeManagement = () => {
  const { token, user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [allDisputes, setAllDisputes] = useState<Dispute[]>([]); // For admins/moderators
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [disputeData, setDisputeData] = useState({
    reason: '',
    description: '',
    evidence_urls: [] as string[]
  });
  const [resolutionData, setResolutionData] = useState({
    resolution: '',
    decision: '',
    payment_percentage: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<string>('');

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'verifier';

  useEffect(() => {
    fetchDisputes();
    if (isAdmin) {
      fetchAllDisputes();
    }
    fetchContracts();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/disputes/my-disputes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisputes(data.disputes || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    }
  };

  const fetchAllDisputes = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/disputes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllDisputes(data.disputes || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch all disputes:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/contracts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    }
  };

  const createDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) {
      toast.error('Please select a contract');
      return;
    }

    setLoading(true);
    try {
      const contract = contracts.find(c => c.id === selectedContract);
      if (!contract) throw new Error('Contract not found');

      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${contract.job_id}/dispute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: disputeData.reason,
          description: disputeData.description,
          evidence_urls: disputeData.evidence_urls,
        }),
      });

      if (response.ok) {
        toast.success('Dispute created successfully!');
        setDisputeData({ reason: '', description: '', evidence_urls: [] });
        setSelectedContract('');
        setShowCreateForm(false);
        fetchDisputes();
        if (isAdmin) fetchAllDisputes();
      } else {
        throw new Error('Failed to create dispute');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) {
      toast.error('Please select a dispute');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/disputes/${selectedDispute}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resolution: resolutionData.resolution,
          decision: resolutionData.decision,
          payment_percentage: resolutionData.payment_percentage ? parseFloat(resolutionData.payment_percentage) : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Dispute resolved successfully!');
        setResolutionData({ resolution: '', decision: '', payment_percentage: '' });
        setSelectedDispute('');
        fetchDisputes();
        fetchAllDisputes();
      } else {
        throw new Error('Failed to resolve dispute');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'under_review': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  const displayDisputes = isAdmin ? allDisputes : disputes;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dispute Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all platform disputes' : 'Manage your job disputes'}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setShowCreateForm(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Dispute
          </Button>
        )}
      </div>

      {/* Create Dispute Form (Regular Users) */}
      {!isAdmin && showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Dispute</CardTitle>
            <CardDescription>
              File a dispute for a job contract issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createDispute} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract">Select Contract</Label>
                <select
                  id="contract"
                  className="w-full p-2 border rounded-md"
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  required
                >
                  <option value="">Choose a contract</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.job.title} - {contract.worker.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Dispute Reason</Label>
                <Input
                  id="reason"
                  type="text"
                  required
                  placeholder="e.g., Poor work quality, delayed completion, etc."
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Provide detailed information about the issue, including specific concerns and desired resolution..."
                  value={disputeData.description}
                  onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Disputes are reviewed by VeriNest administrators. Provide clear evidence and detailed descriptions for faster resolution.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating Dispute...' : 'Create Dispute'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Resolve Dispute Form (Admins/Moderators) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Resolve Dispute
            </CardTitle>
            <CardDescription>
              Resolve disputes as an administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={resolveDispute} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dispute">Select Dispute to Resolve</Label>
                <select
                  id="dispute"
                  className="w-full p-2 border rounded-md"
                  value={selectedDispute}
                  onChange={(e) => setSelectedDispute(e.target.value)}
                  required
                >
                  <option value="">Choose a dispute</option>
                  {allDisputes
                    .filter(d => d.status === 'open' || d.status === 'under_review')
                    .map((dispute) => (
                      <option key={dispute.id} value={dispute.id}>
                        {dispute.reason} - {dispute.status}
                      </option>
                    ))}
                </select>
              </div>

              {selectedDispute && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution Details</Label>
                    <Textarea
                      id="resolution"
                      required
                      placeholder="Provide detailed resolution and reasoning..."
                      value={resolutionData.resolution}
                      onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="decision">Decision</Label>
                      <Select 
                        value={resolutionData.decision} 
                        onValueChange={(value) => setResolutionData({ ...resolutionData, decision: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_payment">Full Payment</SelectItem>
                          <SelectItem value="partial_payment">Partial Payment</SelectItem>
                          <SelectItem value="no_payment">No Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {resolutionData.decision === 'partial_payment' && (
                      <div className="space-y-2">
                        <Label htmlFor="payment_percentage">Payment Percentage</Label>
                        <Input
                          id="payment_percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={resolutionData.payment_percentage}
                          onChange={(e) => setResolutionData({ ...resolutionData, payment_percentage: e.target.value })}
                          placeholder="e.g., 50.0"
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Resolving...' : 'Resolve Dispute'}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'All Platform Disputes' : 'My Disputes'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'All disputes across the platform' 
              : 'Disputes you\'ve filed or are involved in'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayDisputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No disputes found</p>
              <p className="text-sm">
                {isAdmin 
                  ? 'No disputes require attention at the moment' 
                  : 'Create a dispute to resolve job-related issues'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayDisputes.map((dispute) => (
                <div key={dispute.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{dispute.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(dispute.created_at).toLocaleDateString()}
                        {isAdmin && ` • By User: ${dispute.created_by}`}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(dispute.status)}>
                      {dispute.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{dispute.description}</p>

                  {dispute.evidence_urls.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Evidence:</p>
                      <div className="flex gap-2">
                        {dispute.evidence_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Evidence {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {dispute.resolution && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Resolution:</p>
                      <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                      {dispute.decision && (
                        <Badge variant="outline" className="mt-2">
                          Decision: {dispute.decision.replace('_', ' ')}
                          {dispute.payment_percentage && ` (${dispute.payment_percentage}%)`}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};