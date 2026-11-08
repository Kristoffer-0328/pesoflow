# PesoFlow

PesoFlow is a personal finance management app for tracking wallets, balances,
income, expenses, transfers, budgets, and spending activity in Philippine
pesos (PHP).

## Current Progress

The project has moved from planning into an MVP UI and Firebase integration
phase. The application currently includes:

- Email/password registration and login with protected routes.
- Automatic user setup during registration:
  - PHP profile data.
  - Starter `Cash on Hand` wallet.
  - Default income and expense categories.
- Firebase Firestore live listeners for wallets, categories, transactions, and
  budgets.
- Responsive desktop sidebar and mobile navigation drawer/bottom navigation.
- Dashboard with:
  - Available balance.
  - Per-wallet balance cards.
  - Monthly income and expenses.
  - Savings rate.
  - Remaining monthly budget.
  - Spending breakdown.
  - Recent transactions.
- Wallet management with active wallet cards, balance calculation, wallet
  creation, provider selection, and initial balances.
- Transaction creation for income, expenses, and wallet transfers.
- Transaction validation for positive amounts, required wallets/categories,
  different transfer wallets, and transaction dates.
- Weekly transaction activity view with:
  - Date navigation.
  - Income and expense totals.
  - Daily activity chart.
  - Search.
  - Type, category, and wallet filters.
- Budget plans with:
  - Default 50/30/20 plan.
  - Custom one-time and monthly plans.
  - Multi-step plan creation.
  - User-defined budget groups.
  - Budget details view.
- Integer-centavo storage and shared calculation utilities for wallet balances,
  monthly summaries, savings rate, and expense breakdowns.
- PWA manifest and application icons.

## Theme and UI/UX Direction

PesoFlow uses a modern, calm fintech theme designed to make financial
information easy to scan without feeling overwhelming. The interface favors
clear hierarchy, generous spacing, rounded surfaces, and restrained use of
color so that balances, income, expenses, and budget status remain the focus.

### Visual System

- **Primary background:** `#F7F8FA`, providing a soft neutral canvas.
- **Surface:** White cards and panels for readable content grouping.
- **Primary text:** `#202A35` for strong headings and monetary values.
- **Brand accent:** `#278568`, used for primary actions, active navigation,
  positive financial states, and wallet highlights.
- **Secondary surface:** `#E9EDF2`, used for muted controls, filters, and
  navigation states.
- **Income/positive:** Green tones.
- **Expense/negative:** Red tones.
- **Warning:** Warm amber for attention states.
- **Typography:** Inter Variable with tabular numerals for financial values.
- **Shape and depth:** Approximately 20px card corners, subtle borders, and
  minimal shadows instead of heavy elevation.

### Layout and Navigation

- Desktop uses a persistent left sidebar with Overview, Transactions,
  Wallets, Budgets, and Settings.
- Mobile uses a compact header, slide-out navigation drawer, and bottom
  navigation for quick access.
- The Add Transaction action is intentionally prominent and available from the
  main layout on both desktop and mobile.
- Pages use responsive grids that collapse into single-column layouts on small
  screens.

### Interaction Patterns

- Forms use rounded inputs, visible focus states, inline validation, and
  bottom-sheet dialogs on mobile that become centered dialogs on desktop.
- Dashboard cards prioritize available balance first, followed by monthly
  income, expenses, budget status, spending breakdown, and recent activity.
- Wallets are presented as visual cards with provider/type labels and
  swipe-friendly or button-based navigation.
- Budget creation is a guided three-step flow: plan details, groups, and
  review.
- Loading, empty, and error states are shown explicitly rather than silently
  falling back to incomplete data.
- Charts and progress indicators provide quick visual context while labels and
  formatted PHP values preserve clarity.

## Current Status by MVP Area

| Area | Status | Notes |
| --- | --- | --- |
| Project setup | Done | React, TypeScript, Vite, Tailwind CSS, ESLint |
| Authentication | Done | Registration, login, logout, guest/protected routes |
| Firebase data layer | In progress | Live Firestore reads and create operations are connected |
| Wallets | In progress | Create and view balances are available; edit/archive/transfer UX remains |
| Categories | Partial | Default categories are created and used; category management UI remains |
| Transactions | In progress | Create income, expense, and transfer records; edit/archive/delete remains |
| Dashboard | Done for current MVP scope | Live summaries, wallet balances, breakdown, budget progress, recent activity |
| Budgets | In progress | Default and custom plans are available; broader monthly/category tracking remains |
| Reports | Not started | A dedicated reports and analytics page is still needed |
| Settings | Not started | The route exists, but the settings screen is still a placeholder |
| PWA/offline support | Partial | Manifest and icons exist; offline caching and install validation remain |
| Firestore security rules | Pending | Rules and security validation still need to be added |

## Technology Stack

### Frontend

- React 19
- TypeScript
- React Router
- Tailwind CSS
- Lucide React
- Recharts
- Inter variable font

### Backend and Services

- Firebase Authentication
- Cloud Firestore

### Development Tools

- Vite
- ESLint
- TypeScript

## Application Structure

```text
src/
├── app/routes/              # Guest and protected route guards
├── features/
│   ├── auth/                # Auth context, user setup, wallet/category data
│   ├── budgets/             # Budget services and creation flow
│   ├── components/          # App layout and auth provider
│   ├── dashboard/           # Dashboard summary components
│   └── transactions/        # Transaction menu, form, and service
├── lib/                     # Firebase client and default seed data
├── pages/                   # Route-level screens
├── types/                   # Shared TypeScript domain types
└── utils/                   # Date, money, calculations, and wallet colors
```

Database operations are kept in feature service modules rather than in
presentation components. Signed-in screens consume live Firestore data through
the shared `useUserData` hook.

## Financial Rules Currently Implemented

- Monetary values are stored as integer centavos.
- Wallet balance is calculated as:

  ```text
  Initial balance + income - expenses + transfers in - transfers out
  ```

- Transfers do not contribute to income or expense totals.
- Monthly summaries use the transaction date.
- Savings is income minus expenses.
- Savings rate is zero when there is no income.
- Soft-deleted transactions are excluded from calculations and displayed
  activity.

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

Build the application:

```bash
npm run build
```

Firebase configuration is loaded from the project environment setup in
`src/lib/firebase.ts`. Configure the required Firebase values before using
authentication or Firestore features.

## Next Development Priorities

1. Add Firestore security rules and validate user-level data isolation.
2. Complete wallet editing, archiving, and transfer management.
3. Add transaction editing and soft-delete/archive actions.
4. Add category management and settings screens.
5. Improve budget tracking with category limits and spending progress.
6. Build reports and analytics views.
7. Add automated tests for financial calculations and critical form flows.
8. Complete PWA installability and offline behavior.

## Developer

- John Kristoffer D. Miranda
