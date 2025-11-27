// components/SupportTickets.tsx - For regular users to create support tickets
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import {
	MessageSquare,
	Plus,
	Clock,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SupportTicket {
	id: string;
	title: string;
	description: string;
	category: string;
	status: "open" | "in_progress" | "resolved" | "closed";
	priority: "low" | "medium" | "high" | "urgent";
	created_at: string;
	messages: SupportMessage[];
}

interface SupportMessage {
	id: string;
	message: string;
	user_name: string;
	user_role: string;
	created_at: string;
}

export const SupportTickets = () => {
	const { token } = useAuth();
	const [tickets, setTickets] = useState<SupportTicket[]>([]);
	const [showNewTicket, setShowNewTicket] = useState(false);
	const [newTicket, setNewTicket] = useState({
		title: "",
		description: "",
		category: "general",
		priority: "medium" as "low" | "medium" | "high" | "urgent",
	});
	const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
		null
	);
	const [newMessage, setNewMessage] = useState("");

	useEffect(() => {
		fetchTickets();
	}, []);

	const fetchTickets = async () => {
		try {
			const response = await fetch(
				"https://verinest.up.railway.app/api/support/my-tickets",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				setTickets(data.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch tickets:", error);
		}
	};

	const createTicket = async () => {
		if (!newTicket.title.trim() || !newTicket.description.trim()) {
			toast.error("Please fill in all fields");
			return;
		}

		try {
			const response = await fetch(
				"https://verinest.up.railway.app/api/support/tickets",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newTicket),
				}
			);

			if (response.ok) {
				toast.success("Support ticket created successfully");
				setShowNewTicket(false);
				setNewTicket({
					title: "",
					description: "",
					category: "general",
					priority: "medium",
				});
				fetchTickets();
			} else {
				toast.error("Failed to create support ticket");
			}
		} catch (error) {
			toast.error("Failed to create support ticket");
		}
	};

	const sendMessage = async (ticketId: string) => {
		if (!newMessage.trim()) return;

		try {
			const response = await fetch(
				`https://verinest.up.railway.app/api/support/tickets/${ticketId}/messages`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: newMessage,
						is_internal: false,
					}),
				}
			);

			if (response.ok) {
				setNewMessage("");
				toast.success("Message sent");
				fetchTickets();
				// Refresh selected ticket
				const updatedTicket = tickets.find((t) => t.id === ticketId);
				if (updatedTicket) setSelectedTicket(updatedTicket);
			}
		} catch (error) {
			toast.error("Failed to send message");
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "open":
				return <AlertCircle className="h-4 w-4 text-blue-600" />;
			case "in_progress":
				return <Clock className="h-4 w-4 text-orange-600" />;
			case "resolved":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "closed":
				return <CheckCircle className="h-4 w-4 text-gray-600" />;
			default:
				return <AlertCircle className="h-4 w-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "open":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "in_progress":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "resolved":
				return "bg-green-100 text-green-800 border-green-200";
			case "closed":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Support Center</h1>
					<p className="text-muted-foreground">
						Get help with any issues or questions
					</p>
				</div>
				<Button
					onClick={() => setShowNewTicket(true)}
					className="gap-2"
				>
					<Plus className="h-4 w-4" />
					New Ticket
				</Button>
			</div>

			{showNewTicket ? (
				<Card>
					<CardHeader>
						<CardTitle>Create Support Ticket</CardTitle>
						<CardDescription>
							Describe your issue and we'll help you resolve it
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Input
							placeholder="Title of your issue"
							value={newTicket.title}
							onChange={(e) =>
								setNewTicket({
									...newTicket,
									title: e.target.value,
								})
							}
						/>
						<Textarea
							placeholder="Describe your issue in detail..."
							value={newTicket.description}
							onChange={(e) =>
								setNewTicket({
									...newTicket,
									description: e.target.value,
								})
							}
							rows={5}
						/>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium mb-2 block">
									Category
								</label>
								<select
									className="w-full p-2 border rounded-lg"
									value={newTicket.category}
									onChange={(e) =>
										setNewTicket({
											...newTicket,
											category: e.target.value,
										})
									}
								>
									<option value="general">General</option>
									<option value="technical">Technical</option>
									<option value="billing">Billing</option>
									<option value="account">Account</option>
									<option value="verification">
										Verification
									</option>
								</select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									Priority
								</label>
								<select
									className="w-full p-2 border rounded-lg"
									value={newTicket.priority}
									onChange={(e) =>
										setNewTicket({
											...newTicket,
											priority: e.target.value as any,
										})
									}
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
									<option value="urgent">Urgent</option>
								</select>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => setShowNewTicket(false)}
							>
								Cancel
							</Button>
							<Button onClick={createTicket}>
								Create Ticket
							</Button>
						</div>
					</CardContent>
				</Card>
			) : selectedTicket ? (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle>My Tickets</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<ScrollArea className="h-96">
									{tickets.map((ticket) => (
										<div
											key={ticket.id}
											className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
												selectedTicket.id === ticket.id
													? "bg-muted border-primary"
													: ""
											}`}
											onClick={() =>
												setSelectedTicket(ticket)
											}
										>
											<div className="flex justify-between items-start mb-2">
												<h3 className="font-semibold text-sm line-clamp-1">
													{ticket.title}
												</h3>
												<Badge
													variant="outline"
													className={getStatusColor(
														ticket.status
													)}
												>
													{ticket.status}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{ticket.description}
											</p>
											<div className="flex justify-between items-center mt-2">
												<span className="text-xs text-muted-foreground">
													{ticket.category}
												</span>
												<span className="text-xs text-muted-foreground">
													{new Date(
														ticket.created_at
													).toLocaleDateString()}
												</span>
											</div>
										</div>
									))}
								</ScrollArea>
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>
											{selectedTicket.title}
										</CardTitle>
										<CardDescription>
											Created{" "}
											{new Date(
												selectedTicket.created_at
											).toLocaleDateString()}
										</CardDescription>
									</div>
									<Badge
										variant="outline"
										className={getStatusColor(
											selectedTicket.status
										)}
									>
										{getStatusIcon(selectedTicket.status)}
										<span className="ml-1">
											{selectedTicket.status}
										</span>
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold mb-2">
											Description
										</h4>
										<p className="text-sm">
											{selectedTicket.description}
										</p>
									</div>

									<div>
										<h4 className="font-semibold mb-2">
											Conversation
										</h4>
										<ScrollArea className="h-64 border rounded-lg p-4">
											<div className="space-y-4">
												{selectedTicket.messages.map(
													(message) => (
														<div
															key={message.id}
															className={`p-3 rounded-lg ${
																message.user_role ===
																"customer_care"
																	? "bg-blue-50 border border-blue-200 ml-8"
																	: "bg-gray-50 border border-gray-200 mr-8"
															}`}
														>
															<div className="flex justify-between items-center mb-2">
																<span className="font-semibold text-sm">
																	{
																		message.user_name
																	}
																	{message.user_role ===
																		"customer_care" &&
																		" (Support)"}
																</span>
																<span className="text-xs text-muted-foreground">
																	{new Date(
																		message.created_at
																	).toLocaleString()}
																</span>
															</div>
															<p className="text-sm">
																{
																	message.message
																}
															</p>
														</div>
													)
												)}
											</div>
										</ScrollArea>
									</div>

									<div className="flex gap-2">
										<Input
											placeholder="Type your response..."
											value={newMessage}
											onChange={(e) =>
												setNewMessage(e.target.value)
											}
											onKeyPress={(e) =>
												e.key === "Enter" &&
												sendMessage(selectedTicket.id)
											}
										/>
										<Button
											onClick={() =>
												sendMessage(selectedTicket.id)
											}
										>
											Send
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			) : (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							No Support Tickets
						</h3>
						<p className="text-muted-foreground text-center mb-4">
							{tickets.length === 0
								? "You haven't created any support tickets yet."
								: "Select a ticket to view details"}
						</p>
						{tickets.length === 0 && (
							<Button onClick={() => setShowNewTicket(true)}>
								Create Your First Ticket
							</Button>
						)}

						<Button variant={"link"}>
							<a
								href="/support"
								target="_blank"
								rel="noopener noreferrer"
							>
								Go to Help Center
							</a>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
