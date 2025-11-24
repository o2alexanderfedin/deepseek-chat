import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MermaidDiagram } from '../../../src/components/common/MermaidDiagram';

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(),
  },
}));

import mermaid from 'mermaid';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MermaidDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(mermaid.render).mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<MermaidDiagram content="graph TD; A-->B;" />);

    expect(screen.getByTestId('mermaid-loading')).toBeInTheDocument();
  });

  it('renders mermaid diagram successfully', async () => {
    const svgContent = '<svg>test diagram</svg>';
    vi.mocked(mermaid.render).mockResolvedValue({ svg: svgContent, diagramType: 'flowchart' });

    renderWithTheme(<MermaidDiagram content="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram')).toBeInTheDocument();
    });

    const container = screen.getByTestId('mermaid-diagram');
    expect(container.innerHTML).toBe(svgContent);
  });

  it('displays error message on render failure', async () => {
    vi.mocked(mermaid.render).mockRejectedValue(new Error('Invalid syntax'));

    renderWithTheme(<MermaidDiagram content="invalid mermaid" />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to render Mermaid diagram/)).toBeInTheDocument();
  });

  it('initializes mermaid with correct theme for light mode', async () => {
    const lightTheme = createTheme({ palette: { mode: 'light' } });
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart' });

    render(
      <ThemeProvider theme={lightTheme}>
        <MermaidDiagram content="graph TD; A-->B;" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'default' })
      );
    });
  });

  it('initializes mermaid with correct theme for dark mode', async () => {
    const darkTheme = createTheme({ palette: { mode: 'dark' } });
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart' });

    render(
      <ThemeProvider theme={darkTheme}>
        <MermaidDiagram content="graph TD; A-->B;" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'dark' })
      );
    });
  });

  it('re-renders when content changes', async () => {
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg>diagram1</svg>', diagramType: 'flowchart' });

    const { rerender } = renderWithTheme(<MermaidDiagram content="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram')).toBeInTheDocument();
    });

    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg>diagram2</svg>', diagramType: 'flowchart' });

    rerender(
      <ThemeProvider theme={theme}>
        <MermaidDiagram content="graph TD; C-->D;" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(2);
    });
  });

  it('applies responsive styles to container', async () => {
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg></svg>', diagramType: 'flowchart' });

    renderWithTheme(<MermaidDiagram content="graph TD; A-->B;" />);

    await waitFor(() => {
      const container = screen.getByTestId('mermaid-diagram');
      expect(container).toHaveStyle({ maxWidth: '100%' });
    });
  });
});
