import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface StaticFileHandlerProps {
  fileName: string;
}

export const StaticFileHandler = ({ fileName }: StaticFileHandlerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the actual static file in the public folder
    window.location.href = `/${fileName}`;
  }, [fileName]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading {fileName}...</p>
      </div>
    </div>
  );
};
