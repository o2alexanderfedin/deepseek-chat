import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography, Link, Box } from '@mui/material';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <Typography variant="body1" component="p" sx={{ my: 0.5 }}>
            {children}
          </Typography>
        ),
        strong: ({ children }) => (
          <Box component="strong" sx={{ fontWeight: 'bold' }}>
            {children}
          </Box>
        ),
        em: ({ children }) => (
          <Box component="em" sx={{ fontStyle: 'italic' }}>
            {children}
          </Box>
        ),
        a: ({ href, children }) => (
          <Link href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        ),
        code: ({ children }) => (
          <Box
            component="code"
            sx={{
              backgroundColor: 'grey.100',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.875em',
            }}
          >
            {children}
          </Box>
        ),
        pre: ({ children }) => (
          <Box
            component="pre"
            sx={{
              backgroundColor: 'grey.100',
              p: 1.5,
              borderRadius: 1,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875em',
            }}
          >
            {children}
          </Box>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
