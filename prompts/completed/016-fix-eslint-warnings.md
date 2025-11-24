<objective>
Fix all 8 ESLint warnings in the codebase. These are react-hooks/exhaustive-deps warnings about missing dependencies in useEffect and useCallback hooks.

Zero warnings should remain after this task is complete.
</objective>

<context>
This is a React/TypeScript project using Redux Toolkit and Material UI. The warnings are intentional dependency omissions that need proper fixes - not just disabling the rule.

Current warnings:
1. src/App.tsx:49 - useEffect missing 'handleNewChat'
2. src/hooks/useWebLLM.ts:44 - useEffect missing 'currentModel' and 'loadModel'
3. src/hooks/useChat.ts:21 - 'messages' expression could cause deps to change every render
4. src/components/chat/MessageList.tsx:59,95,107,118,128 - useCallback missing 'getMessageState' (5 instances)
</context>

<requirements>
1. **Fix each warning properly** - don't just add eslint-disable comments
2. **Prevent infinite re-renders** - some deps are intentionally omitted to prevent loops
3. **Maintain functionality** - all 295 tests must still pass
4. **Use proper React patterns**:
   - Use useCallback to memoize functions that are dependencies
   - Use useMemo for expensive computations
   - Use refs for values that shouldn't trigger re-renders
   - Move functions inside useEffect if they're only used there

For each fix, choose the appropriate pattern:
- If the function should be stable: wrap in useCallback with proper deps
- If the value shouldn't trigger effect: use useRef
- If the omission is intentional: add eslint-disable comment with explanation WHY
</requirements>

<implementation>
Fix files in this order:

1. **src/App.tsx:49** - handleNewChat in useEffect
   - Option: Move handleNewChat definition before the useEffect, wrap with useCallback

2. **src/hooks/useWebLLM.ts:44** - currentModel and loadModel in useEffect
   - This is likely intentional (only run on mount)
   - If intentional: add eslint-disable with explanation
   - If not: wrap loadModel in useCallback

3. **src/hooks/useChat.ts:21** - messages expression
   - Move the messages derivation inside the useCallback, or use useMemo

4. **src/components/chat/MessageList.tsx** - getMessageState in 5 useCallbacks
   - Either include getMessageState in deps (if it's stable)
   - Or wrap getMessageState in useCallback first
</implementation>

<output>
Modify files:
- `./src/App.tsx`
- `./src/hooks/useWebLLM.ts`
- `./src/hooks/useChat.ts`
- `./src/components/chat/MessageList.tsx`
</output>

<verification>
1. Run `npm run lint` - should show 0 errors and 0 warnings
2. Run `npm run test:run` - all 295 tests must pass
3. Run `npx tsc --noEmit` - no TypeScript errors
4. Manually verify the app still works (model loads, chat functions)
</verification>

<success_criteria>
- All 8 ESLint warnings are resolved
- No new warnings or errors introduced
- All tests pass
- App functionality unchanged
- Code follows React best practices for hooks
</success_criteria>
