// Minimal client-side auth layer using localStorage.
// Users persisted in localStorage under "echo_users".
// Current logged-in user id persisted under "echo_current_user_id".
// This is NOT production-ready for security; it's for local/demo use or initial dev.

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // sha-256 hex
  createdAt: string;
};

const USERS_KEY = "echo_users";
const CUR_KEY = "echo_current_user_id";

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) as User[] : [];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUserId(id: string | null) {
  if (id) localStorage.setItem(CUR_KEY, id);
  else localStorage.removeItem(CUR_KEY);
}

export function getCurrentUser(): User | null {
  const id = localStorage.getItem(CUR_KEY);
  if (!id) return null;
  const users = readUsers();
  return users.find(u => u.id === id) ?? null;
}

export function logout() {
  setCurrentUserId(null);
}

// simple SHA-256 hash helper
export async function hashString(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateId() {
  return crypto.getRandomValues(new Uint32Array(2)).join("-");
}

export async function createUser(name: string, email: string, password: string): Promise<{ user?: User; error?: string }> {
  const users = readUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { error: "An account with that email already exists." };
  const passwordHash = await hashString(password);
  const user: User = {
    id: generateId(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  setCurrentUserId(user.id);
  return { user };
}

export async function authenticate(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { error: "No account found for that email." };
  const hash = await hashString(password);
  if (hash !== user.passwordHash) return { error: "Incorrect password." };
  setCurrentUserId(user.id);
  return { user };
}

export async function updateProfile(updates: {
  id: string;
  name?: string;
  email?: string;
  // to change email or password we require currentPassword
  currentPasswordForSensitiveOps?: string;
  newPassword?: string;
}): Promise<{ user?: User; error?: string }> {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === updates.id);
  if (idx === -1) return { error: "User not found." };

  // If changing email or password we require current password validation for safety
  if ((updates.email || updates.newPassword) && !updates.currentPasswordForSensitiveOps) {
    return { error: "Current password required to change email or password." };
  }

  if (updates.currentPasswordForSensitiveOps) {
    const curHash = await hashString(updates.currentPasswordForSensitiveOps);
    if (curHash !== users[idx].passwordHash) return { error: "Current password is incorrect." };
  }

  if (updates.email) {
    const emailTaken = users.some(u => u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== updates.id);
    if (emailTaken) return { error: "That email is already used by another account." };
    users[idx].email = updates.email;
  }
  if (updates.name !== undefined) users[idx].name = updates.name;
  if (updates.newPassword) {
    users[idx].passwordHash = await hashString(updates.newPassword);
  }
  writeUsers(users);
  return { user: users[idx] };
}