<objective>
Add support for rendering LaTeX mathematical expressions in the markdown renderer.

This enables users to include mathematical formulas, equations, and expressions in their conversations that will be rendered as properly formatted mathematics, essential for scientific and technical discussions.
</objective>

<context>
This is a React/TypeScript chat application using:
- react-markdown for markdown rendering
- Material UI for components
- MarkdownRenderer component at ./src/components/common/MarkdownRenderer.tsx

The MarkdownRenderer has been enhanced with diagram support (Mermaid, PlantUML).
Now adding LaTeX support for mathematical expressions.

Read the CLAUDE.md for project conventions (TDD, SOLID, strong typing).
</context>

<requirements>
1. Support inline math with single dollar signs: $E = mc^2$
2. Support block math with double dollar signs: $$\int_0^\infty e^{-x^2} dx$$
3. Support LaTeX code blocks: ```latex ... ```
4. Handle rendering errors gracefully
5. Ensure formulas render correctly in both light and dark themes
6. Formulas should scale appropriately within message bubbles
</requirements>

<implementation>
1. Install KaTeX (faster and lighter than MathJax):
   - `katex` for rendering
   - `rehype-katex` for rehype integration
   - `remark-math` for parsing math in markdown

2. Configure react-markdown with math plugins:
   - Add remark-math to parse $...$ and $$...$$
   - Add rehype-katex to render parsed math

3. Import KaTeX CSS for proper styling

4. Handle LaTeX code blocks separately for explicit LaTeX content

5. Add error boundaries for invalid LaTeX

6. Write comprehensive tests

Technical notes:
- KaTeX is preferred over MathJax for better performance
- Import katex/dist/katex.min.css for styling
- Configure KaTeX options: throwOnError: false for graceful degradation
</implementation>

<output>
Install packages (run these commands):
!npm install katex remark-math rehype-katex
!npm install -D @types/katex

Modify existing files:
- `./src/components/common/MarkdownRenderer.tsx` - Add KaTeX integration
- `./src/components/common/MarkdownRenderer.test.tsx` - Add LaTeX tests
- `./src/index.css` or create new - Import KaTeX CSS

May need to create:
- `./src/components/common/LaTeXBlock.tsx` - For explicit LaTeX code blocks (if needed)
</output>

<verification>
1. Run `npm run lint` to check for linting errors
2. Run `npm run test` to ensure all tests pass
3. Test manually with sample LaTeX:

Inline math: $E = mc^2$

Block math:
$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Complex expression:
$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

LaTeX code block:
```latex
\begin{equation}
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
\end{equation}
```

4. Verify error handling with invalid LaTeX (should show error, not crash)
5. Verify formulas render correctly in both user and assistant messages
6. Verify CSS is properly loaded (formulas should be styled correctly)
</verification>

<success_criteria>
- Inline math ($...$) renders correctly
- Block math ($$...$$) renders correctly
- LaTeX code blocks render correctly
- Invalid LaTeX shows graceful error
- All tests pass
- No linting errors
- Follows TDD approach
</success_criteria>
