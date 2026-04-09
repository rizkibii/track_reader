import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, type AdminUser, type AdminUserStats, type ReadingSessionWithEbook } from '../lib/api';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userStats, setUserStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // History Modal State
  const [historyUser, setHistoryUser] = useState<AdminUser | null>(null);
  const [history, setHistory] = useState<ReadingSessionWithEbook[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const openHistory = async (user: AdminUser) => {
    setHistoryUser(user);
    setHistoryPage(1);
    fetchHistory(user.id, 1);
  };

  const fetchHistory = async (userId: string, p: number) => {
    setHistoryLoading(true);
    try {
      const res = await api.admin.users.history(userId, { page: p, limit: 5 });
      setHistory(res.data);
      setHistoryTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  useEffect(() => {
    api.admin.userStats().then((r) => setUserStats(r.data)).catch(console.error);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.users.list({ search, page, limit: 10 });
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.admin.users.updateRole(userId, newRole as 'admin' | 'user');
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.admin.users.delete(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex selection:bg-primary/30">
      {/* SideNavBar */}
      <aside className="h-screen w-64 left-0 top-0 fixed bg-black/40 backdrop-blur-md flex flex-col py-8 px-4 z-50 border-r border-slate-800/20">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-cyan-400">TrackReader</h1>
          <p className="font-['Inter'] uppercase tracking-widest text-[10px] text-slate-500 mt-1">The Archive</p>
        </div>
        <nav className="flex-1 space-y-2">
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/40 hover:text-cyan-200 transition-colors" to="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-cyan-400 font-bold border-l-4 border-cyan-400 bg-slate-800/30" to="/admin/users">
            <span className="material-symbols-outlined">group</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Users</span>
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/40 hover:text-cyan-200 transition-colors" to="/admin/ebooks">
            <span className="material-symbols-outlined">book</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Ebooks</span>
          </Link>
        </nav>
        <div className="mt-auto pt-8">
          <button onClick={() => navigate('/admin/ebooks/add')} className="w-full mb-6 py-3 px-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(83,221,252,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            New Entry
          </button>
          <Link className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/40 hover:text-cyan-200 transition-colors" to="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-x-hidden">
        <header className="sticky top-0 z-50 flex justify-between items-center px-8 h-16 w-full bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl font-black tracking-tighter text-cyan-400">Manage Users</h2>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-800/40 px-4 py-1.5 rounded-full border border-outline-variant/15">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/50"
                placeholder="Quick search..."
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-4xl text-on-surface tracking-tight">System Control</h3>
              <p className="text-on-surface-variant body-md max-w-md">Manage access levels and user accounts.</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="label-md uppercase tracking-widest text-[10px] text-on-surface-variant mb-1">Total Users</span>
              <span className="text-4xl font-black text-primary tracking-tighter">{total}</span>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-highest/30">
                        <th className="px-6 py-5 label-md text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Entity</th>
                        <th className="px-6 py-5 label-md text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Email</th>
                        <th className="px-6 py-5 label-md text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Role</th>
                        <th className="px-6 py-5 label-md text-[10px] uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {users.map((u) => (
                        <tr key={u.id} className="group hover:bg-surface-container-high/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-xl overflow-hidden border border-outline-variant/20">
                                  {u.image ? (
                                    <img alt={u.name} className="object-cover h-full w-full" src={u.image} />
                                  ) : (
                                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
                                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-on-surface">{u.name}</div>
                                {u.username && <div className="text-xs text-on-surface-variant">@{u.username}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-on-surface-variant">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRoleChange(u.id, u.role)}
                              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border cursor-pointer transition-colors ${
                                u.role === 'admin'
                                  ? 'bg-secondary-container/20 text-secondary-dim border-secondary-container/30 hover:bg-secondary-container/40'
                                  : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                              }`}
                            >
                              {u.role === 'admin' ? 'Administrator' : 'Standard User'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openHistory(u)} title="View Reading History" className="p-2 text-on-surface-variant hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-lg">history</span>
                              </button>
                              <button onClick={() => handleDelete(u.id)} title="Delete User" className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all">
                                <span className="material-symbols-outlined text-lg">delete_sweep</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-on-surface-variant italic">No users found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 bg-surface-container-low/40 flex justify-between items-center">
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest">
                    Showing {users.length} of {total} Users
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-bright rounded-lg disabled:opacity-30">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="text-xs text-on-surface-variant">Page {page}</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-bright rounded-lg disabled:opacity-30">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stats Grid */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Active Now</span>
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                </div>
                <div className="text-4xl font-black text-on-surface tracking-tighter">{userStats.activeNow}</div>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Admin Count</span>
                  <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div className="text-4xl font-black text-on-surface tracking-tighter">{userStats.adminCount}</div>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-outline-variant/10 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Total Users</span>
                  <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                </div>
                <div className="text-4xl font-black text-on-surface tracking-tighter">{userStats.totalUsers}</div>
              </div>
            </div>
          )}
        </div>

        {/* History Modal */}
        {historyUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-container/95 border border-outline-variant/20 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-surface-container-highest border border-outline-variant/20">
                     {historyUser.image ? (
                        <img alt={historyUser.name} className="object-cover h-full w-full" src={historyUser.image} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-on-surface-variant">
                          {historyUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">Reading History</h3>
                    <p className="text-sm text-cyan-400">{historyUser.name}</p>
                  </div>
                </div>
                <button onClick={() => setHistoryUser(null)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-0 overflow-y-auto flex-1">
                {historyLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-highest/20 sticky top-0 backdrop-blur-md">
                        <th className="px-6 py-4 label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Book</th>
                        <th className="px-6 py-4 label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Duration</th>
                        <th className="px-6 py-4 label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Started</th>
                        <th className="px-6 py-4 label-md text-[10px] uppercase tracking-widest text-on-surface-variant">Finished</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {history.map((session) => (
                        <tr key={session.id} className="hover:bg-surface-container-high/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-cyan-200">{session.ebook?.title || 'Unknown Book'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-mono text-tertiary-dim">{formatDuration(session.durationSeconds)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-on-surface-variant">{new Date(session.startedAt).toLocaleString('id-ID')}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-on-surface-variant">{session.endedAt ? new Date(session.endedAt).toLocaleString('id-ID') : '-'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-4 opacity-50">history_off</span>
                    <p>No reading history found for this user.</p>
                  </div>
                )}
              </div>
              {historyTotalPages > 1 && (
                <div className="px-8 py-4 border-t border-outline-variant/10 bg-surface-container-low/30 flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant uppercase tracking-widest">Page {historyPage} of {historyTotalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { const p = Math.max(1, historyPage - 1); setHistoryPage(p); fetchHistory(historyUser.id, p); }} disabled={historyPage === 1} className="p-2 text-on-surface hover:bg-surface-bright rounded disabled:opacity-30">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button onClick={() => { const p = Math.min(historyTotalPages, historyPage + 1); setHistoryPage(p); fetchHistory(historyUser.id, p); }} disabled={historyPage === historyTotalPages} className="p-2 text-on-surface hover:bg-surface-bright rounded disabled:opacity-30">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      </main>
    </div>
  );
}
