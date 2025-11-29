import { useEffect } from 'react';

interface StaticFileHandlerProps {
  fileName: string;
}

export const StaticFileHandler = ({ fileName }: StaticFileHandlerProps) => {
  useEffect(() => {
    // For static files, we need to serve them directly without React Router interference
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Get the current domain and construct the full URL
      const baseUrl = window.location.origin;
      const staticFileUrl = `${baseUrl}/${fileName}`;
      
      // For XML files and other static content, we need to fetch and display them
      fetch(staticFileUrl)
        .then(response => {
          if (response.ok) {
            // Get the content type
            const contentType = response.headers.get('content-type');
            
            // For XML files, display as XML
            if (contentType?.includes('xml') || fileName.endsWith('.xml')) {
              return response.text().then(text => {
                // Create a new document with the XML content
                const newDoc = document.open('text/xml', '_self');
                newDoc.write(text);
                newDoc.close();
              });
            }
            
            // For other files, redirect to them
            window.location.href = staticFileUrl;
          } else {
            // If file doesn't exist, show 404
            window.location.href = '/404';
          }
        })
        .catch(error => {
          console.error('Error loading static file:', error);
          window.location.href = '/404';
        });
    }
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
