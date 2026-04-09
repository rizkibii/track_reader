import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, type AdminEbook } from '../lib/api';

export default function AdminEbooks() {
  const [ebooks, setEbooks] = useState<AdminEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEbooks();
  }, [search, page]);

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const res = await api.admin.ebooks({ search, page, limit: 10 });
      setEbooks(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error('Failed to fetch ebooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ebook?')) return;
    try {
      await api.ebooks.delete(id);
      fetchEbooks();
    } catch (err) {
      console.error('Failed to delete ebook:', err);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex overflow-x-hidden">
      {/* SideNavBar */}
      <aside className="fixed left-0 h-full w-64 bg-black/40 backdrop-blur-lg flex flex-col py-8 border-r border-slate-800/20 z-40">
        <div className="px-6 mb-10">
          <h1 className="text-xl font-bold text-cyan-400 tracking-tighter">TrackReader</h1>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-outline">admin_panel_settings</span>
            </div>
            <div>
              <p className="font-['Inter'] uppercase tracking-widest text-[10px] text-on-surface-variant">Admin Panel</p>
              <p className="text-sm font-bold text-on-surface">System Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link className="flex items-center gap-4 text-slate-400 px-6 py-3 hover:bg-slate-800/80 hover:text-white transition-colors" to="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-4 px-6 py-3 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors" to="/admin/users">
            <span className="material-symbols-outlined">group</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Users</span>
          </Link>
          <Link className="flex items-center gap-4 text-purple-400 border-l-4 border-purple-400 bg-slate-800/50 px-6 py-3" to="/admin/ebooks">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>book</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Ebooks</span>
          </Link>
        </nav>
        <div className="mt-auto px-6">
          <Link className="flex items-center gap-4 text-slate-400 py-3 hover:text-error transition-colors" to="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-['Inter'] uppercase tracking-widest text-[10px]">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-end mb-12">
          <div>
            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-2">Management</p>
            <h2 className="text-4xl font-bold tracking-tight text-on-surface">Kelola Ebook</h2>
          </div>
          <Link to="/admin/ebooks/add" className="bg-gradient-to-r from-primary to-primary-dim text-on-primary-container px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(83,221,252,0.3)] transition-all">
            <span className="material-symbols-outlined">add</span>
            <span>Tambah Ebook</span>
          </Link>
        </header>

        {/* Table */}
        <section className="glass-card rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface">Repository Catalog</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="bg-surface-container-low border-none rounded-full pl-10 pr-6 py-2 text-sm focus:ring-2 focus:ring-primary/50 w-64 placeholder:text-on-surface-variant/50"
                placeholder="Search ebooks..."
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest/30">
                      <th className="px-8 py-4 font-['Inter'] uppercase tracking-widest text-[10px] text-on-surface-variant">Cover</th>
                      <th className="px-8 py-4 font-['Inter'] uppercase tracking-widest text-[10px] text-on-surface-variant">Title & Description</th>
                      <th className="px-8 py-4 font-['Inter'] uppercase tracking-widest text-[10px] text-on-surface-variant text-center">Readers</th>
                      <th className="px-8 py-4 font-['Inter'] uppercase tracking-widest text-[10px] text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {ebooks.map((ebook) => (
                      <tr key={ebook.id} className="hover:bg-surface-container-high transition-colors group">
                        <td className="px-8 py-6">
                          <div className="w-16 h-24 rounded-lg bg-surface-container overflow-hidden shadow-lg border border-outline-variant/10 group-hover:scale-105 transition-transform">
                            {ebook.coverImageUrl ? (
                              <img className="w-full h-full object-cover" src={ebook.coverImageUrl} alt={ebook.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-outline">book</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-on-surface mb-1">{ebook.title}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-2 max-w-xs">{ebook.description || '—'}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-tertiary">{ebook.readerCount}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-lg hover:bg-error-container/20 text-on-surface-variant hover:text-error transition-colors" onClick={() => handleDelete(ebook.id)}>
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ebooks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center text-on-surface-variant italic">No ebooks found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-8 py-6 border-t border-outline-variant/10 flex justify-between items-center">
                <p className="text-xs text-on-surface-variant">Showing {ebooks.length} of {total} ebooks</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
