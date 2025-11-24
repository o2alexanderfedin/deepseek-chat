import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PlantUMLDiagram } from '../../../src/components/common/PlantUMLDiagram';

// Mock plantuml-encoder
vi.mock('plantuml-encoder', () => ({
  default: {
    encode: vi.fn().mockReturnValue('encoded-string'),
  },
}));

// Mock fetch
global.fetch = vi.fn();

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PlantUMLDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<PlantUMLDiagram content="@startuml\nAlice -> Bob\n@enduml" />);

    expect(screen.getByTestId('plantuml-loading')).toBeInTheDocument();
  });

  it('renders PlantUML diagram successfully', async () => {
    const svgContent = '<svg>plantuml diagram</svg>';
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(svgContent),
    } as Response);

    renderWithTheme(<PlantUMLDiagram content="@startuml\nAlice -> Bob\n@enduml" />);

    await waitFor(() => {
      expect(screen.getByTestId('plantuml-diagram')).toBeInTheDocument();
    });

    const container = screen.getByTestId('plantuml-diagram');
    expect(container.innerHTML).toBe(svgContent);
  });

  it('displays error message on fetch failure', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    renderWithTheme(<PlantUMLDiagram content="@startuml\nAlice -> Bob\n@enduml" />);

    await waitFor(() => {
      expect(screen.getByTestId('plantuml-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to render PlantUML diagram/)).toBeInTheDocument();
  });

  it('displays error on non-ok response', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    renderWithTheme(<PlantUMLDiagram content="@startuml\nAlice -> Bob\n@enduml" />);

    await waitFor(() => {
      expect(screen.getByTestId('plantuml-error')).toBeInTheDocument();
    });
  });

  it('calls PlantUML server with encoded content', async () => {
    const plantumlEncoder = await import('plantuml-encoder');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg></svg>'),
    } as Response);

    const content = '@startuml\nAlice -> Bob\n@enduml';
    renderWithTheme(<PlantUMLDiagram content={content} />);

    await waitFor(() => {
      expect(plantumlEncoder.default.encode).toHaveBeenCalledWith(content);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.plantuml.com/plantuml/svg/encoded-string'
      );
    });
  });

  it('re-renders when content changes', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg>diagram</svg>'),
    } as Response);

    const { rerender } = renderWithTheme(
      <PlantUMLDiagram content="@startuml\nA -> B\n@enduml" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('plantuml-diagram')).toBeInTheDocument();
    });

    rerender(
      <ThemeProvider theme={theme}>
        <PlantUMLDiagram content="@startuml\nC -> D\n@enduml" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('applies responsive styles to container', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg></svg>'),
    } as Response);

    renderWithTheme(<PlantUMLDiagram content="@startuml\nA -> B\n@enduml" />);

    await waitFor(() => {
      const container = screen.getByTestId('plantuml-diagram');
      expect(container).toHaveStyle({ maxWidth: '100%' });
    });
  });

  it('uses dark theme URL parameter when in dark mode', async () => {
    const darkTheme = createTheme({ palette: { mode: 'dark' } });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg></svg>'),
    } as Response);

    render(
      <ThemeProvider theme={darkTheme}>
        <PlantUMLDiagram content="@startuml\nA -> B\n@enduml" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('plantuml.com/plantuml/dsvg/')
      );
    });
  });
});
