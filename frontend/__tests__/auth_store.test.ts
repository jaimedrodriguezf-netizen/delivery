import { describe, it, expect, beforeEach } from 'vitest';
import { register, login, logout, getCurrentUser, hasRole } from '../lib/auth/authStore';

// Mock localStorage for Vitest
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

describe('Auth Store — TDD Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('registers a new user with default role motorizado', () => {
    const result = register({ name: 'Carlos', email: 'carlos@test.com', phone: '+593 99 000 0000', password: '123456' });
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('motorizado');
    expect(result.user?.email).toBe('carlos@test.com');
  });

  it('prevents duplicate email registration', () => {
    register({ name: 'A', email: 'dup@test.com', phone: '+593', password: '123456' });
    const result = register({ name: 'B', email: 'dup@test.com', phone: '+593', password: '654321' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('ya está registrado');
  });

  it('logs in with valid credentials and returns user', () => {
    register({ name: 'Ana', email: 'ana@test.com', phone: '+593', password: 'pass123' });
    logout();
    const result = login({ email: 'ana@test.com', password: 'pass123' });
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe('Ana');
  });

  it('rejects login with invalid credentials', () => {
    const result = login({ email: 'nobody@test.com', password: 'wrong' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Credenciales inválidas');
  });

  it('logout clears session and getCurrentUser returns null', () => {
    register({ name: 'X', email: 'x@test.com', phone: '+593', password: '123456' });
    expect(getCurrentUser()).not.toBeNull();
    logout();
    expect(getCurrentUser()).toBeNull();
  });

  it('hasRole returns true for matching role', () => {
    register({ name: 'Moto', email: 'moto@test.com', phone: '+593', password: '123456' });
    expect(hasRole('motorizado')).toBe(true);
    expect(hasRole('admin')).toBe(false);
  });
});
