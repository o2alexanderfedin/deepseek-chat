<research_objective>
Find a browser-based LLM model with significantly better coding capabilities than DeepSeek-R1-Distill-Qwen-7B, specifically for SMT-LIB (cvc5) syntax generation.

This research will determine if we should update the model selection in the DeepSeek Chat app to provide better coding assistance, particularly for formal verification and constraint solving tasks.
</research_objective>

<context>
Current setup:
- Using WebLLM library (@mlc-ai/web-llm) for browser-based inference
- Current model: DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC (~5GB)
- Need: Better code generation, especially for SMT-LIB/cvc5 formal logic syntax

SMT-LIB is a standard language for Satisfiability Modulo Theories solvers like cvc5, Z3.
Example SMT-LIB syntax:
```lisp
(set-logic QF_LIA)
(declare-const x Int)
(declare-const y Int)
(assert (> x 0))
(assert (< y 10))
(check-sat)
```
</context>

<scope>
Research focus:
1. WebLLM compatible models (MLC-compiled models)
2. Browser-runnable size (ideally <8GB VRAM)
3. Strong coding/reasoning capabilities
4. Formal logic understanding is a plus

Sources to check:
- WebLLM model registry: https://github.com/mlc-ai/web-llm
- MLC model hub
- HuggingFace models with MLC variants
- Recent releases (2024-2025)

Exclude:
- Server-only models
- Models requiring >16GB VRAM
- Proprietary/API-only models
</scope>

<research_tasks>
1. **List available WebLLM models** with their sizes and capabilities
2. **Identify coding-focused models**:
   - CodeLlama variants
   - DeepSeek-Coder variants
   - Qwen-Coder variants
   - StarCoder variants
3. **Compare reasoning capabilities** for formal logic tasks
4. **Check model benchmarks** for code generation (HumanEval, MBPP)
5. **Evaluate SMT-LIB specific capabilities** if documented

For each candidate model, document:
- Model name and MLC variant ID
- Size (parameters and VRAM requirement)
- Code generation benchmarks
- Availability in WebLLM
</research_tasks>

<deliverables>
Create a recommendation report with:

1. **Top 3 recommended models** ranked by coding ability
2. **Comparison table** with:
   - Model name
   - Size (GB)
   - Code benchmark scores
   - WebLLM availability
   - Notes on logic/reasoning
3. **Implementation recommendation** for updating the app

Save findings to: `./research/browser-coding-models.md`
</deliverables>

<evaluation_criteria>
Prioritize models that:
- Have strong code generation benchmarks
- Support formal/logical reasoning
- Fit in reasonable browser memory (<8GB preferred)
- Are available in WebLLM's model registry
- Have recent updates (2024+)
</evaluation_criteria>

<verification>
Before completing:
- Verify each recommended model exists in WebLLM
- Confirm size/VRAM requirements are accurate
- Check that at least one model is clearly better than current DeepSeek-R1-Distill-Qwen-7B for coding
</verification>

<success_criteria>
- At least 3 viable alternative models identified
- Clear recommendation with reasoning
- Actionable implementation steps provided
- SMT-LIB capability assessment included
</success_criteria>
