// components/CustomerServiceDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, Users, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export const CustomerServiceDashboard = () => {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const assignToMe = async (ticketId: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/support/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigned_to: user?.id }),
      });

      if (response.ok) {
        toast.success('Ticket assigned to you');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Ticket status updated');
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status });
        }
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const sendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`https://verinest.up.railway.app/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          is_internal: false,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        toast.success('Message sent');
        fetchTickets();
        // Refresh selected ticket
        if (selectedTicket?.id === ticketId) {
          const updatedTicket = tickets.find(t => t.id === ticketId);
          if (updatedTicket) setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Service Dashboard</h1>
        <p className="text-muted-foreground">Manage user support tickets and inquiries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="pl-8 w-full p-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm line-clamp-1">{ticket.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {ticket.user_name}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          <span>{ticket.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                        {!ticket.assigned_to && (
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); assignToMe(ticket.id); }}>
                            Assign to me
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTicket.title}</CardTitle>
                    <CardDescription>
                      From: {selectedTicket.user_name} ({selectedTicket.user_email})
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge variant="secondary">{selectedTicket.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="conversation">
                  <TabsList>
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="conversation" className="space-y-4">
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {selectedTicket.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.user_role === 'customer_care' 
                                ? 'bg-blue-50 border border-blue-200 ml-8' 
                                : 'bg-gray-50 border border-gray-200 mr-8'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-sm">
                                {message.user_name} 
                                {message.user_role === 'customer_care' && ' (Support)'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your response..."
                        className="flex-1 p-2 border rounded-lg"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedTicket.id)}
                      />
                      <Button onClick={() => sendMessage(selectedTicket.id)}>
                        Send
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm">{selectedTicket.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Status</h4>
                          <div className="flex gap-2">
                            {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={selectedTicket.status === status ? "default" : "outline"}
                                onClick={() => updateTicketStatus(selectedTicket.id, status as any)}
                              >
                                {status}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Assigned To</h4>
                          <p className="text-sm">
                            {selectedTicket.assigned_to ? 'You' : 'Unassigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ticket Selected</h3>
                <p className="text-muted-foreground text-center">
                  Select a ticket from the list to view details and respond to the user.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};