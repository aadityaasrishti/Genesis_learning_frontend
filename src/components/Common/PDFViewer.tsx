import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import PDFViewerError from './PDFViewerError';

interface PDFViewerProps {
  fileUrl: string;
  onDownload: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const objectRef = useRef<HTMLObjectElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout>();
  const loadHandledRef = useRef(false);

  const handleLoadSuccess = useCallback(() => {
    if (!loadHandledRef.current) {
      loadHandledRef.current = true;
      setPdfLoaded(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    setPdfLoaded(false);
    loadHandledRef.current = false;

    if (!fileUrl) {
      console.error('PDFViewer: No PDF URL provided');
      setError('No PDF URL provided');
      setLoading(false);
      return;
    }

    // Construct full URL with base URL if needed
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${import.meta.env.VITE_API_BASE_URL || ''}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;

    // Validate URL format
    try {
      new URL(fullUrl);
    } catch (e) {
      console.error('PDFViewer: Invalid URL format:', e);
      setError('Invalid PDF URL format');
      setLoading(false);
      return;
    }

    // Set a timeout to check if PDF is loaded
    loadingTimerRef.current = setTimeout(() => {
      if (!pdfLoaded && !loadHandledRef.current) {
        console.error('PDFViewer: Loading timeout, URL:', fullUrl);
        setError('PDF is taking too long to load. Try downloading it instead.');
        setLoading(false);
      }
    }, 20000);

    // Add load event listener to object element
    const objectElement = objectRef.current;
    if (objectElement) {
      const handleObjectLoad = () => {
        handleLoadSuccess();
      };
      
      objectElement.addEventListener('load', handleObjectLoad);
      
      // Also check if the object data is already loaded
      if (objectElement.data) {
        const img = new Image();
        img.src = objectElement.data;
        if (img.complete) {
          handleLoadSuccess();
        }
      }

      return () => {
        objectElement.removeEventListener('load', handleObjectLoad);
      };
    }

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [fileUrl, handleLoadSuccess]);

  const handleError = () => {
    if (!loadHandledRef.current) {
      console.error('PDFViewer: Error loading PDF');
      setError('Failed to load PDF. Please try downloading it.');
      setLoading(false);
      loadHandledRef.current = true;
    }
  };

  return (
    <PDFViewerError fileUrl={fileUrl} onDownload={onDownload}>
      <Box sx={{ 
        width: "100%", 
        height: "100%",
        position: 'relative',
        bgcolor: '#f5f5f5',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <object
          ref={objectRef}
          data={fileUrl}
          type="application/pdf"
          style={{ 
            width: "100%", 
            height: "100%", 
            border: "none",
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}
          onError={handleError}
        >
          <iframe
            src={fileUrl}
            style={{ 
              width: "100%", 
              height: "100%", 
              border: "none",
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}
            title="PDF Viewer"
            onError={handleError}
          />
        </object>
        
        {loading && !pdfLoaded && !loadHandledRef.current && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 3,
            borderRadius: 1
          }}>
            <CircularProgress />
            <Typography>Loading PDF...</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: 3,
            borderRadius: 1,
            textAlign: 'center',
            maxWidth: '80%'
          }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={onDownload}
              sx={{ mt: 1 }}
            >
              Download PDF Instead
            </Button>
          </Box>
        )}
      </Box>
    </PDFViewerError>
  );
};

export default PDFViewer;