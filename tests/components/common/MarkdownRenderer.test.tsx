import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { vi, describe, it, expect } from 'vitest';
import { MarkdownRenderer } from '../../../src/components/common/MarkdownRenderer';

// Mock diagram components
vi.mock('../../../src/components/common/MermaidDiagram', () => ({
  MermaidDiagram: ({ content }: { content: string }) => (
    <div data-testid="mock-mermaid-diagram">{content}</div>
  ),
}));

vi.mock('../../../src/components/common/PlantUMLDiagram', () => ({
  PlantUMLDiagram: ({ content }: { content: string }) => (
    <div data-testid="mock-plantuml-diagram">{content}</div>
  ),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MarkdownRenderer', () => {
  describe('basic markdown', () => {
    it('renders plain text', () => {
      renderWithTheme(<MarkdownRenderer content="Hello world" />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders bold text', () => {
      renderWithTheme(<MarkdownRenderer content="**bold text**" />);
      expect(screen.getByText('bold text')).toBeInTheDocument();
    });

    it('renders links', () => {
      renderWithTheme(<MarkdownRenderer content="[link](https://example.com)" />);
      const link = screen.getByRole('link', { name: 'link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders inline code', () => {
      renderWithTheme(<MarkdownRenderer content="Use `console.log()`" />);
      expect(screen.getByText('console.log()')).toBeInTheDocument();
    });

    it('renders regular code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });
  });

  describe('think blocks', () => {
    it('renders think blocks', () => {
      renderWithTheme(<MarkdownRenderer content="<think>thinking...</think>" />);
      expect(screen.getByTestId('think-block')).toBeInTheDocument();
    });

    it('renders content with think blocks and text', () => {
      const content = 'Before<think>thinking</think>After';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
      expect(screen.getByTestId('think-block')).toBeInTheDocument();
    });
  });

  describe('Mermaid diagrams', () => {
    it('renders mermaid code blocks as diagrams', () => {
      const content = '```mermaid\ngraph TD;\nA-->B;\n```';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByTestId('mock-mermaid-diagram')).toBeInTheDocument();
      expect(screen.getByTestId('mock-mermaid-diagram')).toHaveTextContent('graph TD;');
    });

    it('passes correct content to MermaidDiagram', () => {
      const content = `\`\`\`mermaid\nsequenceDiagram\nAlice->>Bob: Hello\n\`\`\``;
      renderWithTheme(<MarkdownRenderer content={content} />);
      const diagram = screen.getByTestId('mock-mermaid-diagram');
      expect(diagram).toHaveTextContent('sequenceDiagram');
      expect(diagram).toHaveTextContent('Alice->>Bob: Hello');
    });
  });

  describe('PlantUML diagrams', () => {
    it('renders plantuml code blocks as diagrams', () => {
      const content = '```plantuml\n@startuml\nAlice -> Bob\n@enduml\n```';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByTestId('mock-plantuml-diagram')).toBeInTheDocument();
    });

    it('passes correct content to PlantUMLDiagram', () => {
      const content = `\`\`\`plantuml\n@startuml\nclass User\n@enduml\n\`\`\``;
      renderWithTheme(<MarkdownRenderer content={content} />);
      const diagram = screen.getByTestId('mock-plantuml-diagram');
      expect(diagram).toHaveTextContent('@startuml');
      expect(diagram).toHaveTextContent('class User');
      expect(diagram).toHaveTextContent('@enduml');
    });
  });

  describe('mixed content', () => {
    it('renders markdown with mermaid diagram', () => {
      const content = 'Here is a diagram:\n\n```mermaid\ngraph TD;\nA-->B;\n```\n\nAnd more text.';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByText('Here is a diagram:')).toBeInTheDocument();
      expect(screen.getByTestId('mock-mermaid-diagram')).toBeInTheDocument();
      expect(screen.getByText('And more text.')).toBeInTheDocument();
    });

    it('renders multiple diagram types', () => {
      const content = '```mermaid\ngraph TD;\n```\n\n```plantuml\n@startuml\n@enduml\n```';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByTestId('mock-mermaid-diagram')).toBeInTheDocument();
      expect(screen.getByTestId('mock-plantuml-diagram')).toBeInTheDocument();
    });
  });

  describe('LaTeX math expressions', () => {
    it('renders inline math with single dollar signs', () => {
      const content = 'The formula is $E = mc^2$ in physics.';
      renderWithTheme(<MarkdownRenderer content={content} />);
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('renders block math with double dollar signs', () => {
      const content = 'Here is a formula:\n\n$$\\int_0^\\infty e^{-x^2} dx$$\n\nEnd.';
      renderWithTheme(<MarkdownRenderer content={content} />);
      // Block math uses katex class (katex-display is wrapper)
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('renders LaTeX code blocks', () => {
      const content = '```latex\n\\frac{a}{b}\n```';
      renderWithTheme(<MarkdownRenderer content={content} />);
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });

    it('handles invalid LaTeX gracefully', () => {
      const content = '$\\invalid{command}$';
      // Should not throw an error
      expect(() => {
        renderWithTheme(<MarkdownRenderer content={content} />);
      }).not.toThrow();
    });

    it('renders multiple math expressions in same content', () => {
      const content = 'Formula $a^2$ and $b^2$ together.';
      renderWithTheme(<MarkdownRenderer content={content} />);
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBe(2);
    });

    it('renders math alongside other markdown', () => {
      const content = '**Bold** and $E = mc^2$ and `code`';
      renderWithTheme(<MarkdownRenderer content={content} />);
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('code')).toBeInTheDocument();
      const mathElements = document.querySelectorAll('.katex');
      expect(mathElements.length).toBeGreaterThan(0);
    });
  });
});
