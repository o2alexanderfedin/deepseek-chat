import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography, Link, Box, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MermaidDiagram } from './MermaidDiagram';
import { PlantUMLDiagram } from './PlantUMLDiagram';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LaTeXBlockProps {
  content: string;
}

const LaTeXBlock: React.FC<LaTeXBlockProps> = ({ content }) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#cc0000',
      });
    } catch {
      return `<span style="color: #cc0000;">LaTeX Error: ${content}</span>`;
    }
  }, [content]);

  return (
    <Box
      sx={{
        my: 1,
        textAlign: 'center',
        overflow: 'auto',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MarkdownRendererProps {
  content: string;
}

interface ThinkBlockProps {
  content: string;
}

const ThinkBlock: React.FC<ThinkBlockProps> = ({ content }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Box
      data-testid="think-block"
      sx={{
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        mb: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          backgroundColor: 'grey.200',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'grey.700' }}>
          Thinking...
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5, color: 'grey.600', fontSize: '0.875em' }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Typography variant="body2" component="p" sx={{ my: 0.5, color: 'grey.600' }}>
                  {children}
                </Typography>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </Box>
      </Collapse>
    </Box>
  );
};

const parseContentWithThinkBlocks = (content: string): Array<{ type: 'text' | 'think'; content: string }> => {
  const parts: Array<{ type: 'text' | 'think'; content: string }> = [];
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let lastIndex = 0;
  let match;

  while ((match = thinkRegex.exec(content)) !== null) {
    // Add text before the think block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }
    // Add the think block
    parts.push({ type: 'think', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last think block
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex).trim();
    if (textContent) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  // If no think blocks found, return the original content
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return parts;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parts = parseContentWithThinkBlocks(content);

  return (
    <Box>
      {parts.map((part, index) => {
        if (part.type === 'think') {
          return <ThinkBlock key={index} content={part.content} />;
        }
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[[rehypeKatex, { throwOnError: false, errorColor: '#cc0000' }]]}
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
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const codeContent = String(children).replace(/\n$/, '');

                // Check if this is a code block (has language class) vs inline code
                const isCodeBlock = Boolean(className);

                if (isCodeBlock && language === 'mermaid') {
                  return <MermaidDiagram content={codeContent} />;
                }

                if (isCodeBlock && language === 'plantuml') {
                  return <PlantUMLDiagram content={codeContent} />;
                }

                if (isCodeBlock && language === 'latex') {
                  return <LaTeXBlock content={codeContent} />;
                }

                // Inline code
                if (!isCodeBlock) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { ref, ...restProps } = props;
                  return (
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
                      {...restProps}
                    >
                      {children}
                    </Box>
                  );
                }

                // Regular code block
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { ref, ...restProps } = props;
                return (
                  <Box
                    component="code"
                    sx={{
                      display: 'block',
                      fontFamily: 'monospace',
                      fontSize: '0.875em',
                    }}
                    {...restProps}
                  >
                    {children}
                  </Box>
                );
              },
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
              ul: ({ children }) => (
                <Box component="ul" sx={{ pl: 2, my: 0.5 }}>
                  {children}
                </Box>
              ),
              ol: ({ children }) => (
                <Box component="ol" sx={{ pl: 2, my: 0.5 }}>
                  {children}
                </Box>
              ),
              li: ({ children }) => (
                <Typography component="li" variant="body1" sx={{ my: 0.25 }}>
                  {children}
                </Typography>
              ),
            }}
          >
            {part.content}
          </ReactMarkdown>
        );
      })}
    </Box>
  );
};
