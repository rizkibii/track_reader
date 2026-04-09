import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, type EbookWithStatus } from '../lib/api';

export default function Library() {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<EbookWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEbooks();
  }, [search, page]);

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const res = await api.ebooks.list({ search, page, limit: 12 });
      setEbooks(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch ebooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEbooks = ebooks.filter((e) => {
    if (filter === 'read') return e.hasRead;
    return true;
  });

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <>
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 h-16 bg-[#060e20]/70 backdrop-blur-xl shadow-2xl shadow-cyan-900/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 w-full h-full relative">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tighter text-[#53ddfc]">TrackReader</span>
            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-cyan-400 border-b-2 border-cyan-400 pb-1 font-bold tracking-tight transition-all duration-300" to="/library">Library</Link>
              <Link className="text-slate-400 hover:text-slate-200 font-bold tracking-tight transition-all duration-300" to="/history">History</Link>
              <Link className="text-slate-400 hover:text-slate-200 font-bold tracking-tight transition-all duration-300" to="/user">Profile</Link>
            </nav>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md hidden lg:block">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline pointer-events-none">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-outline/60"
                placeholder="Search library..."
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/user')} className="material-symbols-outlined text-slate-400 hover:text-[#53ddfc] transition-colors">account_circle</button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-8 max-w-7xl mx-auto">
        <section className="mb-16">
          <h1 className="text-6xl md:text-7xl font-bold tracking-[-0.04em] text-on-background mb-4">My Library</h1>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Your curated collection of digital artifacts. Explore your reading history and continue your journey through the luminous archive.
          </p>
        </section>

        {/* Filters */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            {(['all', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-surface-container-highest text-primary border border-primary/20 shadow-[0_0_15px_rgba(83,221,252,0.1)]'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f === 'all' ? 'All Books' : 'Reading'}
              </button>
            ))}
          </div>
          <div className="lg:hidden relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search books..."
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEbooks.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">library_books</span>
            <p className="text-on-surface-variant text-lg">No ebooks found.</p>
          </div>
        )}

        {/* Ebook Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEbooks.map((ebook) => (
              <article key={ebook.id} className="group relative flex flex-col glass-card rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(83,221,252,0.15)] outline-variant/15 outline">
                <div className="aspect-video w-full overflow-hidden bg-surface-container-highest relative">
                  {ebook.coverImageUrl ? (
                    <img alt={ebook.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={ebook.coverImageUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-outline">book</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className="bg-[#53ddfc]/20 backdrop-blur-md text-[#53ddfc] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      ⏱ {formatDuration(ebook.totalReadDuration)} read
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold tracking-tight text-on-surface">{ebook.title}</h3>
                    {ebook.hasRead ? (
                      <span className="text-secondary text-[10px] font-bold uppercase tracking-widest border border-secondary/30 px-2 py-0.5 rounded">✅ Read</span>
                    ) : (
                      <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border border-outline-variant/30 px-2 py-0.5 rounded">Not Read</span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 leading-relaxed">
                    {ebook.description || 'No description available.'}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/reader/${ebook.id}`)}
                      className="bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-6 py-2.5 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(83,221,252,0.3)] hover:brightness-110 transition-all"
                    >
                      Read Now
                    </button>
                    <button className="material-symbols-outlined text-outline-variant hover:text-primary transition-colors">bookmark</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="flex items-center text-sm text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-[#1e293b]/70 backdrop-blur-lg rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <Link className="flex flex-col items-center justify-center bg-[#53ddfc]/20 text-[#53ddfc] rounded-xl px-4 py-1 transition-transform active:scale-90" to="/library">
          <span className="material-symbols-outlined">local_library</span>
          <span className="text-[10px] uppercase tracking-wider Inter font-medium mt-1">Library</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-400 hover:text-[#ac8aff]" to="/history">
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] uppercase tracking-wider Inter font-medium mt-1">History</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-400 hover:text-[#ac8aff]" to="/user">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] uppercase tracking-wider Inter font-medium mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
}
