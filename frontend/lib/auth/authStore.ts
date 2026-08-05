import { User, UserRole, RegisterPayload, LoginPayload } from '../../types/auth';

const USERS_KEY = 'delivery_users';
const SESSION_KEY = 'delivery_session';

function getUsers(): (User & { password: string })[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: (User & { password: string })[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function register(payload: RegisterPayload): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const exists = users.find((u) => u.email === payload.email);
  if (exists) {
    return { success: false, error: 'El correo electrónico ya está registrado.' };
  }

  const newUser: User & { password: string } = {
    id: `usr-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: 'motorizado',
    password: payload.password,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...safeUser } = newUser;
  setSession(safeUser);
  return { success: true, user: safeUser };
}

export function login(payload: LoginPayload): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const found = users.find((u) => u.email === payload.email && u.password === payload.password);
  if (!found) {
    return { success: false, error: 'Credenciales inválidas. Verificá tu email y contraseña.' };
  }

  const { password: _, ...safeUser } = found;
  setSession(safeUser);
  return { success: true, user: safeUser };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

export function seedAdminUser(): void {
  const users = getUsers();
  const adminExists = users.find((u) => u.role === 'admin');
  if (!adminExists) {
    users.push({
      id: 'usr-admin-001',
      name: 'Administrador',
      email: 'admin@delivery.ec',
      phone: '+593 99 000 0001',
      role: 'admin',
      password: 'admin123',
      created_at: new Date().toISOString(),
    });
    saveUsers(users);
  }
}
