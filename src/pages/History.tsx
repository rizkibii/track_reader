import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, type ReadingSessionWithEbook, type UserStats } from '../lib/api';

export default function History() {
  const [sessions, setSessions] = useState<ReadingSessionWithEbook[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'oldest' | 'longest'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [sort, page]);

  useEffect(() => {
    api.users.stats().then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.readingSessions.history({ sort, page, limit: 10 });
      setSessions(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const totalHours = stats ? Math.round(stats.totalReadingTimeSeconds / 3600) : 0;

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* TopNavBar */}
      <nav className="sticky top-0 z-50 w-full bg-slate-900/70 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4 w-full">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-cyan-400 font-['Inter']">TrackReader</span>
            <div className="hidden md:flex items-center gap-6 font-['Inter'] font-bold tracking-tight">
              <Link className="text-slate-400 hover:text-slate-200 font-bold tracking-tight transition-all duration-300" to="/library">Library</Link>
              <Link className="text-cyan-400 border-b-2 border-cyan-400 pb-1 font-bold tracking-tight transition-all duration-300" to="/history">History</Link>
              <Link className="text-slate-400 hover:text-slate-200 font-bold tracking-tight transition-all duration-300" to="/user">Profile</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:bg-slate-800/50 transition-all duration-300 p-2 rounded-full active:scale-95 text-slate-400">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hover:bg-slate-800/50 transition-all duration-300 p-2 rounded-full active:scale-95 text-slate-400">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-display-lg text-5xl font-extrabold tracking-tighter text-on-background mb-2">Reading History</h1>
            <p className="text-on-surface-variant text-body-md max-w-md">Chronological log of your literary journeys and time invested.</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl">
            {(['latest', 'oldest', 'longest'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setSort(s); setPage(1); }}
                className={`px-4 py-2 text-label-md uppercase tracking-widest text-[10px] font-bold transition-all ${
                  sort === s
                    ? 'text-primary bg-surface-container-highest rounded-lg'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {s === 'latest' ? 'Latest' : s === 'oldest' ? 'Oldest' : 'Longest Duration'}
              </button>
            ))}
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">history</span>
            <p className="text-on-surface-variant text-lg">No reading history yet.</p>
            <Link to="/library" className="mt-4 text-primary font-bold hover:underline">Start reading →</Link>
          </div>
        )}

        {/* History List */}
        {!loading && sessions.length > 0 && (
          <div className="flex flex-col gap-4">
            {sessions.map((s) => (
              <div key={s.id} className="group flex items-center gap-6 p-4 glass-card rounded-xl transition-all duration-300 hover:bg-surface-container-high hover:shadow-[0_0_15px_rgba(83,221,252,0.15)] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                <div className="w-16 h-24 flex-shrink-0 bg-surface-container-highest rounded shadow-lg overflow-hidden">
                  {s.ebook.coverImageUrl ? (
                    <img alt={s.ebook.title} className="w-full h-full object-cover" src={s.ebook.coverImageUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline">book</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    {s.ebook.category && (
                      <span className="text-label-md uppercase tracking-widest text-[10px] text-primary mb-1 font-bold">{s.ebook.category}</span>
                    )}
                    <h3 className="text-headline-sm text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{s.ebook.title}</h3>
                    {s.ebook.author && (
                      <p className="text-on-surface-variant text-sm font-medium">By {s.ebook.author}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-12 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-label-md uppercase tracking-widest text-[10px] text-on-surface-variant">Duration</span>
                      <span className="text-2xl font-bold text-on-surface flex items-center gap-2">
                        {formatDuration(s.durationSeconds)}
                        <span className="material-symbols-outlined text-secondary text-sm">timer</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-label-md uppercase tracking-widest text-[10px] text-on-surface-variant">Completed</span>
                      <span className="text-sm font-semibold text-on-surface">
                        {s.endedAt ? formatDate(s.endedAt) : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="flex items-center text-sm text-on-surface-variant">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}

        {/* Metric Pulse */}
        {stats && (
          <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="p-8 glass-card rounded-2xl">
              <span className="text-label-md uppercase tracking-widest text-[10px] text-secondary font-bold mb-4 block">Lifetime Performance</span>
              <div className="flex items-baseline gap-4">
                <span className="text-display-md text-6xl font-bold tracking-tighter text-on-surface">
                  {totalHours}<span className="text-primary text-2xl ml-2">hrs</span>
                </span>
              </div>
              <p className="text-on-surface-variant text-sm mt-4">
                You've read {stats.totalBooksRead} books with a {stats.currentStreak}-day streak. Keep it up!
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <h4 className="text-headline-sm text-2xl font-bold text-primary">Insight Archive</h4>
              <p className="text-on-surface-variant leading-relaxed">
                You've invested <span className="text-secondary font-bold">{totalHours} hours</span> across{' '}
                <span className="text-secondary font-bold">{stats.totalBooksRead} books</span>.
                Your current reading streak is <span className="text-secondary font-bold">{stats.currentStreak} days</span>.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 bg-surface-container-lowest/40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">© 2024 TrackReader Systems</span>
          <div className="flex gap-6">
            <Link className="text-on-surface-variant hover:text-primary transition-colors" to="#">
              <span className="material-symbols-outlined text-xl">help</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
