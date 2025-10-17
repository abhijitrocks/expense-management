
# ExpenseShare - Frontend MVP

This project is a frontend-only, mobile-first MVP for an expense-sharing application built with React, TypeScript, and Tailwind CSS. All data is mocked and persisted in the browser's `localStorage`.

## Features

-   **Group Management**: Create and join groups locally.
-   **Expense Tracking**: Add expenses with various split types (Equal, Shares, Percent, Manual).
-   **Receipt Upload**: Attach receipts to expenses (stored as base64 in `localStorage`).
-   **Balance Calculation**: View real-time balances within each group.
-   **Debt Simplification**: A greedy algorithm suggests the minimum number of transfers to settle debts.
-   **Settlement Recording**: Record cash or bank transfer payments to clear balances.
-   **Activity Feed**: A chronological view of all expenses and settlements in a group.
-   **100% Client-Side**: No backend required. The app is fully functional offline using a mock API layer over `localStorage`.

## Tech Stack

-   **Framework**: React 18+ with Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Routing**: React Router (`HashRouter`)
-   **Icons**: `lucide-react`
-   **State Management**: Zustand for lightweight global state.
-   **Persistence**: `localStorage` abstracted via a mock API.

## Project Structure

-   `public/`: Static assets.
-   `src/`: Application source code.
    -   `components/`: Reusable UI components.
        -   `ui/`: Generic, shadcn-inspired components (Button, Card, Dialog, etc.).
        -   App-specific components (e.g., `AddExpenseModal`, `BalanceCard`).
    -   `context/`: React context providers (not used, switched to Zustand).
    -   `hooks/`: Custom React hooks.
    -   `lib/`: Core libraries and services.
        -   `mockApi.ts`: The heart of the local data persistence. **This is the main file to modify for backend integration.**
        -   `storage.ts`: A simple wrapper around `localStorage`.
    -   `pages/`: Top-level route components.
    -   `store/`: Zustand store for global state management.
    -   `types/`: TypeScript type definitions.
    -   `utils/`: Utility functions for calculations, formatting, etc.
        -   `calc.ts`: Contains all critical business logic for splitting expenses and simplifying debts.
    -   `App.tsx`: Main application component with routing.
    -   `index.tsx`: Application entry point.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

3.  **Run tests**:
    ```bash
    npm run test
    ```
    This will run unit tests for the calculation logic using Jest.

## Backend Integration Guide

To connect this frontend to a real backend, you need to replace the functions within `src/lib/mockApi.ts`. The current implementation simulates asynchronous API calls with a delay and persists data to `localStorage`.

**Target File**: `src/lib/mockApi.ts`

Below is a list of functions to replace and the expected data shapes.

---

### 1. `getCurrentUser()`
-   **Purpose**: Fetches the profile of the logged-in user.
-   **Replacement**: Replace with an API call to `/api/user/me`.
-   **Expected Return Type**: `Promise<User>`

### 2. `updateUser(userData)`
-   **Purpose**: Updates the current user's profile (e.g., name, default currency).
-   **Replacement**: Replace with a `PUT` or `PATCH` request to `/api/user/me`.
-   **Payload**: `Partial<User>`
-   **Expected Return Type**: `Promise<User>`

### 3. `getGroups()`
-   **Purpose**: Fetches all groups the user is a member of.
-   **Replacement**: Replace with a `GET` request to `/api/groups`.
-   **Expected Return Type**: `Promise<Group[]>`

### 4. `getGroupById(groupId)`
-   **Purpose**: Fetches a single group's details, including its members.
-   **Replacement**: Replace with a `GET` request to `/api/groups/{groupId}`.
-   **Expected Return Type**: `Promise<Group | undefined>`

### 5. `createGroup(groupData)`
-   **Purpose**: Creates a new group.
-   **Replacement**: Replace with a `POST` request to `/api/groups`.
-   **Payload**: `Omit<Group, 'id' | 'createdAt'>`
-   **Expected Return Type**: `Promise<Group>`

### 6. `getGroupActivities(groupId)`
-   **Purpose**: Fetches all expenses and settlements for a group.
-   **Replacement**: Replace with a `GET` request to `/api/groups/{groupId}/activities`. The backend should return a combined and sorted list of expenses and settlements.
-   **Expected Return Type**: `Promise<(Expense | Settlement)[]>`

### 7. `addExpense(expenseData)`
-   **Purpose**: Adds a new expense to a group.
-   **Replacement**: Replace with a `POST` request to `/api/groups/{groupId}/expenses`.
-   **Payload**: `Omit<Expense, 'id'>`. If uploading a receipt, this would likely be a `multipart/form-data` request. The `receiptBase64` field should be converted to a file upload.
-   **Expected Return Type**: `Promise<Expense>`

### 8. `addSettlement(settlementData)`
-   **Purpose**: Records a new settlement in a group.
-   **Replacement**: Replace with a `POST` request to `/api/groups/{groupId}/settlements`.
-   **Payload**: `Omit<Settlement, 'id'>`
-   **Expected Return Type**: `Promise<Settlement>`

### 9. `getUsers()`
-   **Purpose**: A utility function to get all users. In a real app, this might be a user search endpoint.
-   **Replacement**: Replace with a `GET` request to `/api/users` or a search equivalent.
-   **Expected Return Type**: `Promise<User[]>`

---

By replacing the logic inside these functions with actual `fetch` or `axios` calls, you can seamlessly transition the application to a full-stack architecture without changing any UI components.
