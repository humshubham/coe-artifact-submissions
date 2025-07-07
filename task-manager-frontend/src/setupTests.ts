// Mock import.meta.env for Jest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).import = { meta: { env: { VITE_API_URL: 'http://127.0.0.1:5000' } } };

jest.mock('./utils/envconstants', () => ({
  API_URL: 'http://127.0.0.1:5000',
}));

import '@testing-library/jest-dom';
