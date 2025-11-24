import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, useTheme } from '@mui/material';
import plantumlEncoder from 'plantuml-encoder';

interface PlantUMLDiagramProps {
  content: string;
}

export const PlantUMLDiagram: React.FC<PlantUMLDiagramProps> = ({ content }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchDiagram = async () => {
      setLoading(true);
      setError('');
      setSvg('');

      try {
        const encoded = plantumlEncoder.encode(content);
        // Use dsvg for dark mode, svg for light mode
        const endpoint = theme.palette.mode === 'dark' ? 'dsvg' : 'svg';
        const url = `https://www.plantuml.com/plantuml/${endpoint}/${encoded}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const svgContent = await response.text();
        setSvg(svgContent);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagram();
  }, [content, theme.palette.mode]);

  if (loading) {
    return (
      <Box
        data-testid="plantuml-loading"
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
        data-testid="plantuml-error"
        sx={{ my: 1 }}
      >
        Failed to render PlantUML diagram: {error}
      </Alert>
    );
  }

  return (
    <Box
      data-testid="plantuml-diagram"
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
