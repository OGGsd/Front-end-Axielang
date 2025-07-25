import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DocumentationPage: React.FC = () => {
  const location = useLocation();
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract the path after /docs
  const docPath = location.pathname.replace(/^\/docs\/?/, '');

  // Construct the documentation URL
  const getDocumentationUrl = () => {
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001' // Local Docusaurus dev server
      : 'https://docs.axiestudio.com'; // Production docs

    // Handle root docs path - MAIN = /docs should go to main docs page
    if (!docPath || docPath === '') {
      return `${baseUrl}/docs/`;
    }

    // Handle sub-paths - Sub = /docs/docs should go to sub-documentation
    if (docPath === 'docs') {
      return `${baseUrl}/docs/docs/`;
    }

    // Handle other sub-paths
    return `${baseUrl}/docs/${docPath}`;
  };

  // Force iframe reload when path changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  }, [location.pathname]);

  const documentationUrl = getDocumentationUrl();

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header with navigation breadcrumb */}
      <div className="bg-background border-b border-border px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Axie Studio</span>
        <span>/</span>
        <span className="text-foreground font-medium">Documentation</span>
        {docPath && (
          <>
            <span>/</span>
            <span className="text-foreground">{docPath.replace(/\//g, ' / ')}</span>
          </>
        )}
      </div>
      
      {/* Documentation iframe */}
      <div className="flex-1 relative">
        {!hasError ? (
          <iframe
            key={iframeKey}
            src={documentationUrl}
            className="w-full h-full border-0"
            title="Axie Studio Documentation"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-background text-center p-8">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">Documentation Unavailable</h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              We're having trouble loading the documentation. This might be because the documentation server is not running.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setHasError(false);
                  setIframeKey(prev => prev + 1);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <a
                href="https://docs.axiestudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading documentation...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationPage;
