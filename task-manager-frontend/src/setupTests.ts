// Mock import.meta.env for Jest
if (!('import' in globalThis)) {
  (globalThis as any).import = {};
}
if (!('meta' in (globalThis as any).import)) {
  (globalThis as any).import.meta = {};
}
if (!('env' in (globalThis as any).import.meta)) {
  (globalThis as any).import.meta.env = {};
}
(globalThis as any).import.meta.env.VITE_API_URL = 'http://127.0.0.1:5000';

jest.mock('./envconstants', () => ({
  API_URL: 'http://127.0.0.1:5000'
}));

import '@testing-library/jest-dom'; 