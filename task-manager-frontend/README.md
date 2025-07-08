# Task Manager Frontend

A React + TypeScript + Vite application for managing tasks, featuring authentication, task filtering, and more. This project is structured for scalability and maintainability, with a focus on modern best practices.

---

## Project Structure

```
task-manager-frontend/
│
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Signup.tsx
│   │   ├── Login.tsx
│   │   ├── TaskFilters.tsx
│   │   ├── TaskTable.tsx
│   │   ├── Toast.tsx
│   │   ├── TaskForm.tsx
│   │   └── Pagination.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts
│   ├── utils/              # Utility functions and constants
│   │   ├── apiFetch.ts
│   │   └── envconstants.ts
│   ├── __tests__/          # Unit and integration tests
│   │   ├── App.test.tsx
│   │   ├── Login.test.tsx
│   │   ├── Signup.test.tsx
│   │   ├── TaskTable.test.tsx
│   │   ├── Tasks.test.tsx
│   │   ├── TaskForm.test.tsx
│   │   ├── TaskFilters.test.tsx
│   │   └── Pagination.test.tsx
│   ├── App.tsx             # Main app component
│   ├── Tasks.tsx           # Task management page
│   ├── main.tsx            # App entry point
│   ├── index.css           # Global styles
│   ├── setupTests.ts       # Jest setup and mocks
│   └── vite-env.d.ts       # Vite environment types
│
├── public/                 # Static assets (if any)
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── jest.config.js          # Jest config
├── .env.example            # Sample environment file
└── README.md               # Project documentation
```

---

## Environment Variables

This project uses Vite's environment variable system. Create a `.env` file in the project root with the following variable:

```
VITE_API_URL=<your-backend-api-url>
```

- `VITE_API_URL`: The base URL for the backend API (e.g., `http://localhost:5000`).

> **Note:** Only variables prefixed with `VITE_` are exposed to the frontend.

---

## Development Setup

1. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` (create `.env.example` if it doesn't exist) and set `VITE_API_URL`.

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) by default.

4. **Lint the code:**
   ```sh
   npm run lint
   ```

5. **Build for production:**
   ```sh
   npm run build
   ```

---

## Testing

- **Run all tests:**
  ```sh
  npm test
  # or
  yarn test
  ```

- **Watch tests:**
  ```sh
  npm run test:watch
  # or
  yarn test:watch
  ```

- **Test setup:**
  - Jest is configured with `jsdom` for DOM testing.
  - `src/setupTests.ts` mocks environment variables and sets up [@testing-library/jest-dom](https://github.com/testing-library/jest-dom).
  - Test files are located in `src/__tests__/` and follow the `*.test.tsx` naming convention.

---

## Additional Notes

- Uses [Tailwind CSS](https://tailwindcss.com/) for styling.
- Uses [React Hook Form](https://react-hook-form.com/) for form management.
- Uses [React Router](https://reactrouter.com/) for routing.
- API requests are made using [axios](https://axios-http.com/).

---
