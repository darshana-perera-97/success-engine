import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './Button';
import { KeyRound, Plus, Search, X } from 'lucide-react';
import { AccountRow, createAccount, getAccounts, getBranches, updateAdminAvatar } from '../authApi';

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'Admin':
      return 'bg-slate-900 text-white border-slate-800';
    case 'Manager':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'Team Lead':
      return 'bg-violet-50 text-violet-800 border-violet-200';
    case 'Counselor':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Student':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-gray-200';
  }
}

interface AccountsManagementProps {
  onResetPassword?: (row: AccountRow) => void;
  onAccountCreated?: (row: AccountRow) => void;
  onAdminAvatarUpdated?: (row: AccountRow) => void;
}

export const AccountsManagement: React.FC<AccountsManagementProps> = ({
  onResetPassword,
  onAccountCreated,
  onAdminAvatarUpdated,
}) => {
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Manager' as 'Manager' | 'Team Lead' | 'Counselor',
    branch: '',
    teamLeadId: '',
  });
  const [newAccountAvatar, setNewAccountAvatar] = useState('');
  const teamLeadOptions = useMemo(
    () => rows.filter((row) => String(row.role || '') === 'Team Lead'),
    [rows]
  );

  useEffect(() => {
    const load = async () => {
      const result = await getAccounts();
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      setRows(result.data);
    };
    load();
  }, []);

  useEffect(() => {
    const loadBranches = async () => {
      const result = await getBranches();
      if (!result.ok) return;
      setBranchOptions(result.data.map((b) => b.location));
    };
    loadBranches();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.username.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const handleReset = (row: AccountRow) => {
    setPendingId(row.id);
    window.setTimeout(() => {
      onResetPassword?.(row);
      setPendingId(null);
    }, 600);
  };

  const handleAdminAvatarUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please choose an image file.');
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('read-failed'));
      reader.readAsDataURL(file);
    }).catch(() => '');
    if (!dataUrl) {
      setFormError('Failed to read image file.');
      return;
    }
    setIsUploadingAvatar(true);
    const result = await updateAdminAvatar(dataUrl);
    setIsUploadingAvatar(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setRows((prev) => prev.map((row) => (row.role === 'Admin' ? result.data : row)));
    onAdminAvatarUpdated?.(result.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Accounts</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage platform logins. Add new Manager/Team Lead/Counselor accounts and reset passwords.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username, email, role…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>
          <Button type="button" className="gap-1.5 whitespace-nowrap" onClick={() => setIsAddOpen(true)}>
            <Plus size={14} />
            Add Account
          </Button>
        </div>
      </div>

      {loadError ? (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {loadError}
        </div>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wide text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3 font-semibold w-[72px]" aria-label="Photo" />
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={row.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-gray-200 bg-slate-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{row.username}</td>
                  <td className="px-4 py-3 text-slate-600">{row.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeClass(row.role)}`}
                    >
                      {row.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {row.role === 'Admin' ? (
                        <>
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleAdminAvatarUpload(file);
                              e.currentTarget.value = '';
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            isLoading={isUploadingAvatar}
                            onClick={() => fileRef.current?.click()}
                          >
                            Upload photo
                          </Button>
                        </>
                      ) : null}
                      {row.role !== 'Admin' ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          isLoading={pendingId === row.id}
                          onClick={() => handleReset(row)}
                        >
                          <KeyRound size={14} />
                          Reset password
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-slate-500 text-sm">No accounts match your search.</div>
        )}
      </div>

      {isAddOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">Add Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Create a Manager, Team Lead, or Counselor account.</p>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => {
                  setIsAddOpen(false);
                  setFormError('');
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              className="p-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError('');
                if (form.role === 'Counselor') {
                  const selectedTeamLead = teamLeadOptions.find((lead) => lead.id === form.teamLeadId);
                  if (!selectedTeamLead) {
                    setFormError('Please assign a Team Lead for this counselor.');
                    return;
                  }
                }
                setIsSaving(true);
                const selectedTeamLead = teamLeadOptions.find((lead) => lead.id === form.teamLeadId);
                const result = await createAccount({
                  ...form,
                  teamLeadName: form.role === 'Counselor' ? selectedTeamLead?.username || '' : '',
                  teamLeadEmail: form.role === 'Counselor' ? selectedTeamLead?.email || '' : '',
                  avatar: newAccountAvatar || undefined,
                });
                setIsSaving(false);
                if (!result.ok) {
                  setFormError(result.error);
                  return;
                }
                setRows((prev) => [result.data, ...prev]);
                onAccountCreated?.(result.data);
                setIsAddOpen(false);
                setForm({ username: '', email: '', password: '', role: 'Manager', branch: '', teamLeadId: '' });
                setNewAccountAvatar('');
              }}
            >
              {formError ? (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  {formError}
                </div>
              ) : null}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Username</label>
                <input
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Role</label>
                <select
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value as 'Manager' | 'Team Lead' | 'Counselor',
                      teamLeadId: e.target.value === 'Counselor' ? prev.teamLeadId || teamLeadOptions[0]?.id || '' : '',
                    }))
                  }
                >
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Counselor">Counselor</option>
                </select>
              </div>
              {form.role === 'Counselor' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Assign Team Lead</label>
                  <select
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={form.teamLeadId}
                    onChange={(e) => setForm((prev) => ({ ...prev, teamLeadId: e.target.value }))}
                    required
                    disabled={teamLeadOptions.length === 0}
                  >
                    <option value="" disabled>
                      {teamLeadOptions.length === 0 ? 'No Team Leads available' : 'Select Team Lead'}
                    </option>
                    {teamLeadOptions.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.username} ({lead.branch || 'No branch'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Counselor accounts must be assigned under a Team Lead.</p>
                </div>
              ) : null}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">Branch</label>
                <select
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={form.branch}
                  onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
                  required
                  disabled={branchOptions.length === 0}
                >
                  <option value="" disabled>
                    {branchOptions.length === 0 ? 'No saved branches' : 'Select branch'}
                  </option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">Only branches saved in Branch Analytics can be selected.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Profile Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setNewAccountAvatar('');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => setNewAccountAvatar(String(reader.result || ''));
                    reader.onerror = () => setFormError('Failed to read selected image.');
                    reader.readAsDataURL(file);
                  }}
                />
                <p className="text-[11px] text-slate-500">If skipped, a default ash male avatar will be used.</p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSaving}
                  disabled={branchOptions.length === 0 || (form.role === 'Counselor' && teamLeadOptions.length === 0)}
                >
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
