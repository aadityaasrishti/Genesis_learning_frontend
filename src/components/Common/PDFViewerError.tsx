import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Download as DownloadIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fileUrl: string;
  onDownload: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class PDFViewerError extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PDF Viewer error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          p: 3,
          bgcolor: '#f5f5f5',
          borderRadius: 1
        }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to display PDF
          </Typography>
          <Typography color="textSecondary" align="center" paragraph>
            The PDF viewer encountered an error. You can try one of these options:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', maxWidth: 300 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={this.props.onDownload}
              fullWidth
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(this.props.fileUrl, '_blank')}
              fullWidth
            >
              Open in New Tab
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default PDFViewerError;