import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFeed, listJobs } from '../services/labour';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedItem {
  id: string;
  title?: string;
  description?: string;
  job_id?: string;
  type?: string;
  [key: string]: any;
}

export const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const role = user?.role || 'guest';

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, page]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      // Try backend feed endpoint first
      const res = await getFeed({ role, page, limit });
      const data = res?.data || res;
      if (Array.isArray(data)) setItems(data as FeedItem[]);
      else if (data?.items) setItems(data.items);
      else {
        // Fallback: list jobs for workers / generic
        const jobs = await listJobs({ page, limit });
        const jobsData = jobs?.data || jobs;
        setItems(Array.isArray(jobsData) ? jobsData : []);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
      // Fallback to jobs
      try {
        const jobs = await listJobs({ page, limit });
        const jobsData = jobs?.data || jobs;
        setItems(Array.isArray(jobsData) ? jobsData : []);
      } catch (e) {
        console.error('Fallback listJobs failed:', e);
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Feed</h2>
        <div className="text-sm text-muted-foreground">Tailored for: {role}</div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No items in your feed yet.</p>
            </CardContent>
          </Card>
        ) : (
          items.map((it) => (
            <Card key={it.id || it.job_id || Math.random()} className="hover:shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {it.title || it.job_title || it.job?.title || 'Untitled'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {it.description || it.job?.description || it.summary || ''}
                </p>
                <div className="mt-3 flex gap-2">
                  {it.job_id || it.job?.id ? (
                    <Button size="sm" onClick={() => navigate(`/dashboard/jobs/${it.job_id || it.job?.id}`)}>
                      View Job
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => console.log('clicked', it)}>
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </Button>
        <div className="px-3 py-2">Page {page}</div>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Feed;
