<objective>
Achieve comprehensive unit test coverage (>90%) for the DeepSeek Chat application, focusing on uncovering and preventing bugs identified during manual testing.

Critical bugs to catch with tests:
- Multi-turn conversation failure (first message works, subsequent fail)
- Long message handling failures
- App stuck state after generation failure
- Error feedback missing for users
</objective>

<context>
This is a React/TypeScript chat application at /Users/alexanderfedin/Projects/hapyy/experiments/DeepSeek/deepseek-chat

Current test infrastructure:
- Vitest with jsdom environment
- React Testing Library
- fake-indexeddb for persistence testing
- 167 tests currently passing

Key components requiring coverage:
- WebLLMService (multi-turn conversation handling)
- Redux chatSlice (state management)
- Custom hooks (useWebLLM, useChat)
- UI components (ChatPanel, MessageList, ConversationItem, etc.)
- MarkdownRenderer with KaTeX/Mermaid/PlantUML

Read existing tests in /Users/alexanderfedin/Projects/hapyy/experiments/DeepSeek/deepseek-chat/tests/
</context>

<requirements>
1. **WebLLMService Tests:**
   - Multi-turn conversation handling (consecutive messages)
   - Streaming response accumulation
   - Error handling and recovery
   - Model loading states
   - Context window management
   - Concurrent request handling

2. **Redux State Tests:**
   - All chatSlice actions and reducers
   - Edge cases (empty state, invalid IDs)
   - Message ordering and pagination
   - Optimistic updates and rollback

3. **Hook Tests:**
   - useWebLLM lifecycle and state transitions
   - useChat conversation operations
   - Error boundary behavior
   - Cleanup on unmount

4. **Component Tests:**
   - ChatPanel message submission flow
   - MessageList rendering with various content types
   - ConversationItem rename and delete operations
   - MarkdownRenderer with LaTeX, diagrams, code blocks
   - Input validation and disabled states

5. **Integration Tests:**
   - Complete conversation flow (create → send → receive → send again)
   - Persistence roundtrip (save → reload → verify)
   - Error recovery workflow
   - Multiple conversation switching

6. **Coverage Targets:**
   - Statements: >90%
   - Branches: >85%
   - Functions: >90%
   - Lines: >90%
</requirements>

<implementation>
1. **Organize tests by module:**
   - tests/services/WebLLMService.test.ts
   - tests/store/chatSlice.test.ts
   - tests/hooks/*.test.ts
   - tests/components/*.test.tsx
   - tests/integration/*.test.tsx

2. **Create test utilities:**
   - Mock WebLLM engine factory
   - Test data generators (conversations, messages)
   - Custom render with providers

3. **Test patterns to use:**
   - Arrange-Act-Assert structure
   - Mock external dependencies (WebLLM, IndexedDB)
   - Test both success and failure paths
   - Use test.each for parameterized tests
   - Isolate unit tests, use mocks appropriately

4. **Focus on bug-catching tests:**
   ```typescript
   // Multi-turn conversation test
   it('should handle consecutive messages in same conversation', async () => {
     const service = new WebLLMService();
     await service.generateResponse('Hello');
     // Must work for second message
     await service.generateResponse('Follow-up question');
   });

   // Error recovery test
   it('should recover from generation failure', async () => {
     // First call fails
     mockEngine.mockRejectedValueOnce(new Error('Timeout'));
     await expect(service.generateResponse('test')).rejects.toThrow();
     // Next call should work
     mockEngine.mockResolvedValueOnce(mockResponse);
     await expect(service.generateResponse('test')).resolves.toBeDefined();
   });
   ```

5. **Add coverage reporting:**
   - Configure vitest coverage provider
   - Add coverage script to package.json
   - Set coverage thresholds that fail CI
</implementation>

<output>
Create/modify files:
- tests/services/WebLLMService.comprehensive.test.ts
- tests/store/chatSlice.comprehensive.test.ts
- tests/hooks/useWebLLM.test.ts
- tests/hooks/useChat.test.ts
- tests/components/ChatPanel.test.tsx
- tests/components/MessageList.test.tsx
- tests/components/ConversationItem.test.tsx
- tests/components/MarkdownRenderer.test.tsx
- tests/integration/conversation-flow.test.tsx
- tests/integration/persistence.test.tsx
- tests/utils/test-helpers.ts
- vitest.config.ts (add coverage configuration)
- package.json (add coverage script)

Run commands:
- npm run test:run (verify all tests pass)
- npm run test:coverage (generate coverage report)
</output>

<verification>
1. All tests pass: `npm run test:run`
2. Coverage meets thresholds: `npm run test:coverage`
3. Multi-turn bug would be caught by new tests
4. Error handling tested for all failure scenarios
5. No uncovered critical paths in coverage report
</verification>

<success_criteria>
- Coverage >90% for statements, functions, lines
- Coverage >85% for branches
- Tests catch the multi-turn conversation bug
- Tests verify error recovery behavior
- Tests cover all Redux state transitions
- Integration tests validate complete user flows
- CI fails if coverage drops below thresholds
</success_criteria>
