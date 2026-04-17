```markdown
# cobalt Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `cobalt` TypeScript codebase. You'll learn about file naming, import/export styles, commit message conventions, and how to write and organize tests. This guide is designed to help you contribute code that matches the project's established standards.

## Coding Conventions

### File Naming
- Use **PascalCase** for all file names.
  - **Example:**  
    `MyComponent.ts`

### Import Style
- Use **absolute imports** for all modules.
  - **Example:**  
    ```typescript
    import MyService from 'services/MyService';
    ```

### Export Style
- Use **default exports** for modules.
  - **Example:**  
    ```typescript
    const MyUtility = () => { /* ... */ };
    export default MyUtility;
    ```

### Commit Messages
- Follow **conventional commit** format.
- Use the `feat` prefix for new features.
  - **Example:**  
    ```
    feat: add user authentication middleware
    ```

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new feature or module  
**Command:** `/add-feature`

1. Create a new file using PascalCase (e.g., `NewFeature.ts`).
2. Write your module using TypeScript.
3. Use absolute imports for dependencies.
4. Export your module as default.
5. Write corresponding tests in a file named `NewFeature.test.ts`.
6. Commit your changes using the `feat` prefix in the commit message.

### Writing Tests
**Trigger:** When adding or updating functionality  
**Command:** `/write-test`

1. Create a test file named `YourModule.test.ts` in the same directory as the module.
2. Write tests using the project's preferred testing framework (unknown; check existing tests for guidance).
3. Ensure all new or changed code is covered by tests.
4. Run the test suite to verify correctness.

## Testing Patterns

- Test files follow the `*.test.*` pattern (e.g., `MyComponent.test.ts`).
- Place test files alongside the modules they test.
- The testing framework is not specified; review existing test files for syntax and structure.
- Example test file name:  
  `UserService.test.ts`

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /add-feature   | Guide for adding a new feature or module     |
| /write-test    | Steps for writing and organizing tests       |
```