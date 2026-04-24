const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export interface AccountRow {
  id: string;
  username: string;
  email: string;
  role: string;
  branch?: string;
  avatar: string;
}

export interface BranchRow {
  id: string;
  location: string;
  totalInquiries?: number;
  successes?: number;
  revenue?: number;
  createdAt: string;
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.error || 'Invalid email or password.',
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Cannot reach login server. Is the backend running on port 3333?',
    };
  }
}

export async function getAccounts(): Promise<{ ok: true; data: AccountRow[] } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/accounts`);
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: AccountRow[];
      error?: string;
    };
    if (!res.ok || !data.ok || !Array.isArray(data.data)) {
      return { ok: false, error: data.error || 'Failed to load accounts.' };
    }
    return { ok: true, data: data.data };
  } catch {
    return {
      ok: false,
      error: 'Cannot reach account server. Is the backend running on port 3333?',
    };
  }
}

export async function createAccount(payload: {
  username: string;
  email: string;
  password: string;
  role: 'Manager' | 'Team Lead' | 'Counselor';
  branch: string;
  avatar?: string;
}): Promise<{ ok: true; data: AccountRow } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: AccountRow;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.data) {
      return { ok: false, error: data.error || 'Failed to create account.' };
    }
    return { ok: true, data: data.data };
  } catch {
    return {
      ok: false,
      error: 'Cannot reach account server. Is the backend running on port 3333?',
    };
  }
}

export async function updateAdminAvatar(
  avatar: string
): Promise<{ ok: true; data: AccountRow } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/accounts/admin/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: AccountRow;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.data) {
      return { ok: false, error: data.error || 'Failed to update admin avatar.' };
    }
    return { ok: true, data: data.data };
  } catch {
    return {
      ok: false,
      error: 'Cannot reach account server. Is the backend running on port 3333?',
    };
  }
}

export async function getBranches(): Promise<{ ok: true; data: BranchRow[] } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/branches`);
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: BranchRow[];
      error?: string;
    };
    if (!res.ok || !data.ok || !Array.isArray(data.data)) {
      return { ok: false, error: data.error || 'Failed to load branches.' };
    }
    return { ok: true, data: data.data };
  } catch {
    return { ok: false, error: 'Cannot reach branch server. Is the backend running on port 3333?' };
  }
}

export async function createBranch(
  location: string
): Promise<{ ok: true; data: BranchRow } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: BranchRow;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.data) {
      return { ok: false, error: data.error || 'Failed to add branch.' };
    }
    return { ok: true, data: data.data };
  } catch {
    return { ok: false, error: 'Cannot reach branch server. Is the backend running on port 3333?' };
  }
}
