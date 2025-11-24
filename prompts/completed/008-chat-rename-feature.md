<objective>
Implement the ability to rename chat conversations in the sidebar.

Users should be able to click on a conversation title to edit it inline or via a dialog, providing a better way to organize and identify their chats beyond the auto-generated titles.
</objective>

<context>
This is a React/TypeScript chat application using:
- Redux Toolkit for state management
- Material UI for components
- IndexedDB for persistence via storageService

The sidebar displays conversations in ChatSidebar.tsx and ConversationItem.tsx.
The chat state is managed in chatSlice.ts with a Conversation type containing id, title, messages, etc.

Read the CLAUDE.md for project conventions (TDD, SOLID, strong typing).
</context>

<requirements>
1. Add ability to rename conversations by double-clicking the title or clicking an edit icon
2. Inline editing with text field that appears when editing
3. Save on Enter or blur, cancel on Escape
4. Update the conversation title in Redux state
5. Persist the renamed conversation to IndexedDB
6. Validate title is not empty (revert to previous if empty)
</requirements>

<implementation>
1. Add `renameConversation` action to chatSlice.ts
2. Modify ConversationItem.tsx to support inline editing:
   - Track editing state locally
   - Show TextField when editing
   - Handle keyboard events (Enter to save, Escape to cancel)
3. Update App.tsx to handle rename and persist to storage
4. Write unit tests for the rename functionality

Use Material UI's TextField for inline editing.
Follow existing patterns in the codebase for consistency.
</implementation>

<output>
Modify existing files:
- `./src/store/slices/chatSlice.ts` - Add renameConversation action
- `./src/components/sidebar/ConversationItem.tsx` - Add inline editing
- `./src/App.tsx` - Handle rename persistence
- `./src/components/sidebar/ChatSidebar.tsx` - Pass rename handler if needed

Create/update test files:
- `./src/store/slices/chatSlice.test.ts` - Test rename action
- `./src/components/sidebar/ConversationItem.test.tsx` - Test inline editing
</output>

<verification>
1. Run `npm run lint` to check for linting errors
2. Run `npm run test` to ensure all tests pass
3. Verify the rename feature works:
   - Double-click conversation title to edit
   - Type new name and press Enter to save
   - Press Escape to cancel
   - Verify empty titles are rejected
   - Verify rename persists after page refresh
</verification>

<success_criteria>
- Conversations can be renamed via inline editing
- Rename persists to IndexedDB
- All tests pass
- No linting errors
- Follows TDD approach (write tests first)
</success_criteria>
