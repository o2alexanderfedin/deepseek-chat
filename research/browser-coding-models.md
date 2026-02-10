# Browser-Based LLM Models for Coding

## Research Objective
Find a WebLLM-compatible model with better coding capabilities than DeepSeek-R1-Distill-Qwen-7B, specifically for SMT-LIB/cvc5 syntax generation.

## Executive Summary

**Recommended Model: Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC**

The Qwen2.5-Coder series is purpose-built for code generation and significantly outperforms general-purpose models including the current DeepSeek-R1-Distill-Qwen-7B on coding benchmarks.

## Top 3 Recommended Models

### 1. Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC (Recommended)
- **VRAM**: 5,106 MB (~5.1 GB)
- **HumanEval**: 84.1-88.4%
- **Why**: Best coding performance at similar size to current model. Outperforms even 20B+ parameter models like CodeStral-22B.

### 2. Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC (Lightweight Alternative)
- **VRAM**: 2,504 MB (~2.5 GB)
- **Why**: Good balance of size and capability. Suitable for devices with less VRAM.

### 3. Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC (Minimal Footprint)
- **VRAM**: 1,629 MB (~1.6 GB)
- **Why**: Smallest viable coding model. Good for testing or low-resource environments.

## Comparison Table

| Model | Size | VRAM | HumanEval | WebLLM ID | Notes |
|-------|------|------|-----------|-----------|-------|
| **Qwen2.5-Coder-7B** | 7B | 5.1 GB | 84-88% | `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC` | Best coding, trained on 5.5T code tokens |
| **Qwen2.5-Coder-3B** | 3B | 2.5 GB | ~70%* | `Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC` | Good balance |
| **Qwen2.5-Coder-1.5B** | 1.5B | 1.6 GB | ~60%* | `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC` | Lightweight |
| DeepSeek-R1-Distill-Qwen-7B (current) | 7B | ~5 GB | ~65%* | `DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC` | Reasoning-focused, not code-specialized |

*Estimated based on model family benchmarks

## SMT-LIB Capability Assessment

**Qwen2.5-Coder-7B** is the best choice for SMT-LIB syntax because:

1. **Trained on diverse code data**: 5.5 trillion tokens including formal languages
2. **Strong logical reasoning**: High performance on math benchmarks (MATH: 75.5)
3. **Syntax understanding**: Better at understanding formal syntax structures than general models
4. **Code completion**: Strong at completing partial code/syntax

While no model is specifically trained on SMT-LIB, Qwen2.5-Coder's broad code training likely includes:
- Lisp-like syntax (SMT-LIB uses S-expressions)
- Formal verification code
- Logic programming languages

## Available WebLLM Model IDs

All Qwen2.5-Coder variants in WebLLM:

```
Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC  (945 MB)
Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC  (1,060 MB)
Qwen2.5-Coder-0.5B-Instruct-q0f16-MLC    (1,624 MB)
Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC  (1,630 MB)
Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC  (1,889 MB)
Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC    (2,505 MB)
Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC    (2,894 MB)
Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC    (5,107 MB)
Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC    (5,900 MB)
```

## Implementation Recommendation

### Option A: Replace Default Model
Update `src/services/webllm/constants.ts` to use Qwen2.5-Coder-7B as the default:

```typescript
export const AVAILABLE_MODELS = [
  {
    id: 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen2.5 Coder 7B (~5GB)',
    size: '5.1 GB',
  },
  // Keep others as alternatives
];

export const DEFAULT_MODEL = 'Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC';
```

### Option B: Add to Model Selection
Keep current model but add Qwen2.5-Coder options to the dropdown for user choice.

### Option C: Use Multiple Sizes
Offer 1.5B, 3B, and 7B Coder variants for different device capabilities.

## Verification

- [x] Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC exists in WebLLM
- [x] VRAM requirement (5.1 GB) is similar to current model
- [x] Clear performance improvement over current model for coding tasks
- [x] Model is available on HuggingFace: [mlc-ai/Qwen2.5-Coder-7B-Instruct-q0f16-MLC](https://huggingface.co/mlc-ai/Qwen2.5-Coder-7B-Instruct-q0f16-MLC)

## Sources

- [WebLLM GitHub](https://github.com/mlc-ai/web-llm)
- [Qwen2.5-Coder Technical Report](https://arxiv.org/html/2409.12186v2)
- [Qwen2.5-Coder Blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/)
- [Qwen2.5-Coder HuggingFace](https://huggingface.co/mlc-ai/Qwen2.5-Coder-7B-Instruct-q0f16-MLC)
- [Qwen2.5-Coder Benchmarks](https://www.byteplus.com/en/topic/417636)

## Conclusion

**Switch to Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC** for significantly better code generation. It uses similar VRAM to the current model but achieves 84-88% on HumanEval vs ~65% estimated for the reasoning-focused DeepSeek model.

For SMT-LIB specifically, the model's training on 5.5 trillion code tokens and strong logical reasoning capabilities make it the best available option in WebLLM.
