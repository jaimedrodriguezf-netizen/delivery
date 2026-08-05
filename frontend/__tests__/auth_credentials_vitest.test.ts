import { describe, it, expect } from 'vitest';
import { login } from '../lib/auth/authStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Database Credentials Authorization Tests', () => {
  it('authenticates admin@delivery.ec with admin123 and verifies admin role', () => {
    localStorageMock.setItem(
      'delivery_users',
      JSON.stringify([
        {
          id: 'd0000000-0000-0000-0000-000000000001',
          name: 'Administrador Global',
          email: 'admin@delivery.ec',
          phone: '+593 99 000 0001',
          role: 'admin',
          password: 'admin123',
        },
      ])
    );

    const result = login({ email: 'admin@delivery.ec', password: 'admin123' });
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('admin');
    expect(result.user?.email).toBe('admin@delivery.ec');
  });

  it('authenticates chofer@delivery.ec with moto123 and verifies motorizado role', () => {
    localStorageMock.setItem(
      'delivery_users',
      JSON.stringify([
        {
          id: 'd0000000-0000-0000-0000-000000000002',
          name: 'Juan Chofer Demo',
          email: 'chofer@delivery.ec',
          phone: '+593 99 123 4567',
          role: 'motorizado',
          password: 'moto123',
        },
      ])
    );

    const result = login({ email: 'chofer@delivery.ec', password: 'moto123' });
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('motorizado');
    expect(result.user?.email).toBe('chofer@delivery.ec');
  });
});
