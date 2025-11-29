import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicWorkerProfile from '../../pages/PublicWorkerProfile';

// List of static files and extensions to exclude from username routing
const STATIC_FILE_EXTENSIONS = ['.xml', '.txt', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js'];
const STATIC_FILE_NAMES = ['sitemap', 'robots', 'manifest', 'favicon'];

export const UsernameRoute = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [isStaticFile, setIsStaticFile] = useState(false);

  useEffect(() => {
    if (!username) return;
    
    // Check if this looks like a static file
    const hasExtension = STATIC_FILE_EXTENSIONS.some(ext => username.includes(ext));
    const isStaticName = STATIC_FILE_NAMES.some(name => username.toLowerCase().includes(name));
    
    if (hasExtension || isStaticName) {
      // Redirect to the actual static file
      setIsStaticFile(true);
      window.location.href = `/${username}`;
      return;
    }
    
    setIsStaticFile(false);
  }, [username]);

  // If it's a static file, don't render anything (we're redirecting)
  if (isStaticFile || !username) {
    return null;
  }

  // Otherwise, treat it as a username
  return <PublicWorkerProfile />;
};
