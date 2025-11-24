import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Alert, useTheme } from '@mui/material';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  content: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ content }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();
  const idRef = useRef<string>(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderDiagram = async () => {
      setLoading(true);
      setError('');
      setSvg('');

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme.palette.mode === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
        });

        const { svg: renderedSvg } = await mermaid.render(idRef.current, content);
        setSvg(renderedSvg);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [content, theme.palette.mode]);

  if (loading) {
    return (
      <Box
        data-testid="mermaid-loading"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          minHeight: 100,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        data-testid="mermaid-error"
        sx={{ my: 1 }}
      >
        Failed to render Mermaid diagram: {error}
      </Alert>
    );
  }

  return (
    <Box
      data-testid="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
      sx={{
        maxWidth: '100%',
        overflow: 'auto',
        my: 1,
        '& svg': {
          maxWidth: '100%',
          height: 'auto',
        },
      }}
    />
  );
};
