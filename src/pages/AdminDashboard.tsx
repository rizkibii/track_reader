import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, type DashboardStats, type PopularEbook, type RealtimeSession } from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [popular, setPopular] = useState<PopularEbook[]>([]);
  const [realtime, setRealtime] = useState<RealtimeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.admin.dashboard().then((r) => setStats(r.data)),
      api.admin.popularEbooks(4).then((r) => setPopular(r.data)),
      api.admin.realtime().then((r) => setRealtime(r.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));

    // Auto-refresh realtime every 30s
    const interval = setInterval(() => {
      api.admin.realtime().then((r) => setRealtime(r.data)).catch(console.error);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const formatTimeOnly = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const avgMinutes = stats ? Math.round(stats.avgDurationSeconds / 60) : 0;

  return (
    <div className="flex min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* SideNavBar */}
      <aside className="fixed left-0 h-full w-64 bg-black/40 backdrop-blur-lg flex flex-col py-8 border-r border-slate-800/20 z-40">
        <div className="px-6 mb-12">
          <h1 className="text-xl font-bold text-cyan-400 tracking-tighter">TrackReader</h1>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-outline">admin_panel_settings</span>
            </div>
            <div>
              <p className="font-['Inter'] uppercase tracking-widest text-[10px] text-on-surface">Admin Panel</p>
              <p className="text-xs text-on-surface-variant">System Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link className="flex items-center gap-4 text-purple-400 border-l-4 border-purple-400 bg-slate-800/50 px-6 py-3" to="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-4 text-slate-400 px-6 py-3 hover:bg-slate-800/80 hover:text-white transition-colors" to="/admin/users">
            <span className="material-symbols-outlined">group</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Users</span>
          </Link>
          <Link className="flex items-center gap-4 text-slate-400 px-6 py-3 hover:bg-slate-800/80 hover:text-white transition-colors" to="/admin/ebooks">
            <span className="material-symbols-outlined">book</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Ebooks</span>
          </Link>
        </nav>
        <div className="mt-auto px-6 pt-4 border-t border-slate-800/20">
          <Link className="flex items-center gap-4 text-slate-400 py-3 hover:text-error transition-colors" to="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-64 flex-1 p-10 bg-surface">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-label-md uppercase tracking-widest text-primary mb-2 opacity-70">Analytics Dashboard</p>
            <h2 className="text-4xl font-bold tracking-tight text-on-surface">System Overview</h2>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Metric Row */}
            <section className="grid grid-cols-12 gap-6 mb-12">
              <div className="col-span-4 glass-card p-8 rounded-xl border-l-4 border-primary shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Total Readers</p>
                <span className="text-6xl font-black tracking-tighter text-white">{stats?.totalReaders ?? 0}</span>
              </div>
              <div className="col-span-8 grid grid-cols-3 gap-6">
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <span className="material-symbols-outlined text-secondary mb-4">timer</span>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Avg Duration</p>
                  <p className="text-3xl font-bold text-on-surface">{avgMinutes}m</p>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                    <div className="w-2 h-2 rounded-full bg-secondary-dim animate-pulse"></div>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Active Sessions</p>
                  <p className="text-3xl font-bold text-on-surface">{stats?.activeSessions ?? 0}</p>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl">
                  <span className="material-symbols-outlined text-tertiary mb-4">library_books</span>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total Ebooks</p>
                  <p className="text-3xl font-bold text-on-surface">{stats?.totalEbooks ?? 0}</p>
                </div>
              </div>
            </section>

            {/* Popular Ebooks */}
            <section className="grid grid-cols-12 gap-8 mb-12">
              <div className="col-span-12 bg-surface-container-low p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-on-surface mb-8">Ebook Terpopuler</h3>
                <div className="space-y-6">
                  {popular.map((p, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs text-on-surface-variant">
                        <span>{p.ebook?.title ?? 'Unknown'}</span>
                        <span className="text-primary font-bold">{p.readerCount} Readers</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(100, (p.readerCount / (popular[0]?.readerCount || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {popular.length === 0 && (
                    <p className="text-on-surface-variant text-sm italic">No data yet.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Realtime Monitoring */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-on-surface">Real-Time User Monitoring</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-on-surface-variant">
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Ebook</th>
                      <th className="px-6 py-4 font-bold">Started At</th>
                      <th className="px-6 py-4 font-bold text-right">Live Duration</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {realtime.map((s) => (
                      <tr key={s.id} className="bg-surface-container-low/40 hover:bg-surface-container-high transition-all">
                        <td className="px-6 py-4 rounded-l-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                              {s.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium text-on-surface">{s.user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-on-surface-variant italic">{s.ebook.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            <span className="text-xs font-medium">{formatTimeOnly(s.startedAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 rounded-r-xl text-right">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border border-primary/20 pulsing-glow">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            {formatDuration(s.durationSeconds)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {realtime.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant italic text-sm">
                          No active reading sessions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
