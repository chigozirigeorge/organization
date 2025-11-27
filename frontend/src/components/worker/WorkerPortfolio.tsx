// components/WorkerPortfolio.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Plus, Trash2, Image, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ImageUpload } from '../shared/ImageUpload';
import { getWorkerPortfolio, addWorkerPortfolioItem, deleteWorkerPortfolioItem } from '../../services/labour';

interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  project_date: string;
  created_at?: string;
}

export const WorkerPortfolio = () => {
  const { user, token } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PortfolioItem>({
    title: '',
    description: '',
    image_url: '',
    project_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
  try {
    setFetchLoading(true);
    const data = await getWorkerPortfolio();
    // data may be { data: [...] } or array
    setPortfolioItems(data.data || data.portfolio || data || []);
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    toast.error('Failed to load portfolio');
    setPortfolioItems([]);
  } finally {
    setFetchLoading(false);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.title.trim() || !formData.description.trim()) {
    toast.error('Please fill in all required fields');
    return;
  }
  setLoading(true);
  try {
    // Build a clean payload and ensure types are correct
    const cleanedProjectDate = formData.project_date ? String(formData.project_date).trim() : null;

    // Normalize project_date to an ISO datetime string (backend is sometimes strict)
    let projectDateIso: string | null = null;
    if (cleanedProjectDate) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedProjectDate)) {
        // Treat date-only as UTC midnight to avoid timezone ambiguity
        projectDateIso = new Date(`${cleanedProjectDate}T00:00:00.000Z`).toISOString();
      } else {
        const parsed = new Date(cleanedProjectDate);
        if (!isNaN(parsed.getTime())) {
          projectDateIso = parsed.toISOString();
        } else {
          projectDateIso = null;
        }
      }
    }

    const requestData = {
      title: String(formData.title).trim(),
      description: String(formData.description).trim(),
      image_url: formData.image_url ? String(formData.image_url) : null,
      project_date: projectDateIso,
    };

    // Prepare JSON body and log length + tail for debugging server deserialization problems
    // Remove null/undefined fields so we don't send `null` which the backend may reject
    const finalPayload: any = Object.fromEntries(
      Object.entries(requestData).filter(([, v]) => v !== null && v !== undefined)
    );

    const requestBody = JSON.stringify(finalPayload);
    console.debug('Sending portfolio payload (full):', finalPayload);
    console.debug('Sending portfolio payload length:', requestBody.length);
    console.debug('Sending portfolio payload tail:', requestBody.slice(-200));

    // POST the cleaned payload
    try {
      await addWorkerPortfolioItem(finalPayload);
    } catch (err: any) {
      // If server complains about project_date deserialization, retry with alternative formats
      const msg = err?.body?.message || err?.message || '';
      if (String(msg).toLowerCase().includes('project_date') || String(msg).toLowerCase().includes('deserialize')) {
        console.warn('Server rejected project_date, retrying with date-only then without project_date');

        // 1) Try sending date-only YYYY-MM-DD if we have one
        const retryDateOnly = cleanedProjectDate && cleanedProjectDate.match(/^\d{4}-\d{2}-\d{2}$/)
          ? cleanedProjectDate
          : null;

        if (retryDateOnly) {
          const retryPayload = { ...finalPayload, project_date: retryDateOnly };
          try {
            await addWorkerPortfolioItem(retryPayload);
            return;
          } catch (err2) {
            console.warn('Retry with date-only failed, will retry without project_date', err2);
          }
        }

        // 2) Last resort: remove project_date and retry
        const retryPayload2 = { ...finalPayload };
        delete retryPayload2.project_date;
        await addWorkerPortfolioItem(retryPayload2);
      } else {
        throw err;
      }
    }
    toast.success('Portfolio item added successfully!');
    setShowForm(false);
    resetForm();
    await fetchPortfolio();
  } catch (error: any) {
    console.error('Failed to add portfolio item:', error);
    // Try to show a helpful server-side message if available
    const serverMsg = error?.body?.message || error?.message;
    toast.error(serverMsg || 'Failed to add portfolio item');
  } finally {
    setLoading(false);
  }
};

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  const handleDelete = async (itemId: string) => {
  if (!confirm('Are you sure you want to delete this portfolio item?')) return;

  try {
    await deleteWorkerPortfolioItem(itemId);
    toast.success('Portfolio item deleted successfully!');
    fetchPortfolio();
  } catch (error: any) {
    console.error('Failed to delete portfolio item:', error);
    toast.error(error.message || 'Failed to delete portfolio item');
  }
};

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!formData.title.trim() || !formData.description.trim()) {
  //     toast.error('Please fill in all required fields');
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Prepare data with proper date format
  //     const requestData = {
  //       title: formData.title.trim(),
  //       description: formData.description.trim(),
  //       image_url: formData.image_url || null,
  //       project_date: formData.project_date, // Keep as YYYY-MM-DD for now
  //     };

  //     console.log('🔄 Sending portfolio data:', requestData);

  //     const response = await fetch('https://verinest.up.railway.app/api/labour/worker/portfolio', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(requestData),
  //     });

  //     console.log('📨 Backend response status:', response.status);

  //     // Get the raw response text first for debugging
  //     const responseText = await response.text();
  //     console.log('📨 Backend response raw text:', responseText);

  //     // Check if response is OK
  //     if (response.ok) {
  //       toast.success('Portfolio item added successfully!');
  //       setShowForm(false);
  //       setFormData({
  //         title: '',
  //         description: '',
  //         image_url: '',
  //         project_date: new Date().toISOString().split('T')[0]
  //       });
        
  //       // Refresh the portfolio list
  //       await fetchPortfolio();
        
  //     } else {
  //       // Handle error response
  //       console.error('❌ Backend error response:', responseText);
        
  //       let errorMessage = 'Failed to add portfolio item';
        
  //       if (responseText) {
  //         // Try to extract meaningful error message
  //         if (responseText.includes('deserialize') || responseText.includes('JSON')) {
  //           errorMessage = 'Invalid data format. Please check all fields.';
  //         } else if (responseText.includes('validation')) {
  //           errorMessage = 'Validation error. Please check all required fields.';
  //         } else if (responseText.includes('auth') || responseText.includes('token')) {
  //           errorMessage = 'Authentication error. Please log in again.';
  //         } else if (responseText.length < 100) {
  //           errorMessage = responseText;
  //         }
  //       }
        
  //       throw new Error(errorMessage);
  //     }
  //   } catch (error: any) {
  //     console.error('Failed to add portfolio item:', error);
  //     toast.error(error.message || 'Failed to add portfolio item');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDelete = async (itemId: string) => {
  //   if (!confirm('Are you sure you want to delete this portfolio item?')) return;

  //   try {
  //     const response = await fetch(`https://verinest.up.railway.app/api/labour/worker/portfolio/${itemId}`, {
  //       method: 'DELETE',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       toast.success('Portfolio item deleted successfully!');
  //       fetchPortfolio();
  //     } else {
  //       throw new Error('Failed to delete portfolio item');
  //     }
  //   } catch (error) {
  //     console.error('Failed to delete portfolio item:', error);
  //     toast.error('Failed to delete portfolio item');
  //   }
  // };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      project_date: new Date().toISOString().split('T')[0]
    });
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <p className="text-muted-foreground">
            Showcase your best work to attract more clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPortfolio}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Portfolio Item
          </Button>
        </div>
      </div>

      {/* Error Alert
      {fetchError && (
        <Alert variant="destructive">
          <AlertDescription>
            {fetchError}
            <Button variant="outline" size="sm" className="ml-2" onClick={fetchPortfolio}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )} */}

      {/* Portfolio Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Portfolio Item</CardTitle>
            <CardDescription>
              Showcase your work with images and descriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Modern Kitchen Renovation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the project, your role, challenges faced, and outcomes achieved..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_date">Project Date</Label>
                <Input
                  id="project_date"
                  type="date"
                  value={formData.project_date}
                  onChange={(e) => setFormData({ ...formData, project_date: e.target.value })}
                />
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                currentImage={formData.image_url}
                folder="portfolio/projects"
                disabled={loading}
              />

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add to Portfolio'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {fetchError ? 'Failed to load portfolio' : 'No portfolio items yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {fetchError 
                ? 'There was an error loading your portfolio items.'
                : 'Showcase your work to attract more clients and stand out from the competition'
              }
            </p>
            {!fetchError && (
              <Button onClick={() => setShowForm(true)}>
                Add Your First Project
              </Button>
            )}
          </div>
        ) : (
          portfolioItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id!)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.project_date).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.image_url && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Added {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'recently'}</span>
                  <Badge variant="outline" className="text-xs">
                    Portfolio
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tips for Better Portfolio */}
      {portfolioItems.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <strong className="text-blue-900">Tips for a great portfolio:</strong>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Use high-quality images that clearly show your work</li>
              <li>• Include before-and-after photos when possible</li>
              <li>• Describe the challenges and how you solved them</li>
              <li>• Mention any special techniques or materials used</li>
              <li>• Keep descriptions concise but informative</li>
              <li>• Update regularly with your latest projects</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Call to Action */}
      {portfolioItems.length > 0 && (
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Ready for more opportunities?</h3>
            <p className="text-muted-foreground mb-4">
              A complete portfolio increases your chances of getting hired
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Project
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};