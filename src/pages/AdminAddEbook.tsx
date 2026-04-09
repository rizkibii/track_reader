import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api';

export default function AdminAddEbook() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    heyzineUrl: '',
    description: '',
    coverImageUrl: '',
    category: '',
    author: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.heyzineUrl) {
      setError('Title and Heyzine URL are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.ebooks.create({
        title: form.title,
        heyzineUrl: form.heyzineUrl,
        description: form.description || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        category: form.category || undefined,
        author: form.author || undefined,
      });
      navigate('/admin/ebooks');
    } catch (err: any) {
      setError(err.message || 'Failed to create ebook');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary/30 selection:text-primary flex">
      {/* SideNavBar */}
      <aside className="h-screen w-64 left-0 top-0 fixed bg-black/40 backdrop-blur-md flex flex-col py-8 px-4 border-r border-slate-800/20 z-50">
        <div className="text-lg font-bold text-cyan-400 mb-8 font-headline tracking-tighter">TrackReader</div>
        <div className="space-y-4 flex-1">
          <div className="font-['Inter'] uppercase tracking-widest text-[10px] text-slate-500 px-4 mb-2">The Archive</div>
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-800/40 hover:text-cyan-200 transition-colors" to="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-800/40 hover:text-cyan-200 transition-colors" to="/admin/users">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">Users</span>
          </Link>
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-cyan-400 font-bold border-l-4 border-cyan-400 bg-slate-800/30" to="/admin/ebooks">
            <span className="material-symbols-outlined">book</span>
            <span className="text-sm font-medium">Ebooks</span>
          </Link>
        </div>
        <div className="mt-auto pt-8 border-t border-slate-800/20">
          <Link className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-800/40 hover:text-cyan-200 transition-colors" to="/">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      <main className="pl-64 min-h-screen flex flex-col relative overflow-x-hidden w-full">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex-1 p-8 md:p-12 lg:p-16 relative z-10 w-full">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <div className="text-primary tracking-[0.1em] uppercase text-xs font-bold mb-2">Content Management</div>
              <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-4">Tambah Ebook</h1>
              <p className="text-on-surface-variant max-w-xl leading-relaxed">
                Expand the digital repository by archiving a new publication.
              </p>
            </header>

            <div className="glass-card rounded-2xl p-8 lg:p-10 border border-outline-variant/15 shadow-2xl relative overflow-hidden">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10" onSubmit={handleSubmit}>
                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Judul Ebook *</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-none py-3 px-0 focus:ring-0 text-on-surface placeholder:text-outline border-b-2 border-outline-variant/30 focus:border-primary"
                      placeholder="Enter publication title..."
                      type="text"
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">URL/Embed Heyzine *</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-none py-3 px-0 focus:ring-0 text-on-surface placeholder:text-outline border-b-2 border-outline-variant/30 focus:border-primary"
                      placeholder="https://heyzine.com/flip-book/..."
                      type="text"
                      value={form.heyzineUrl}
                      onChange={(e) => handleChange('heyzineUrl', e.target.value)}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Deskripsi singkat</label>
                    <textarea
                      className="w-full bg-surface-container-low border-none rounded-none py-3 px-0 focus:ring-0 text-on-surface placeholder:text-outline border-b-2 border-outline-variant/30 focus:border-primary resize-none"
                      placeholder="Brief overview of the content..."
                      rows={4}
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">URL Cover Image</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-none py-3 px-0 focus:ring-0 text-on-surface placeholder:text-outline border-b-2 border-outline-variant/30 focus:border-primary"
                      placeholder="Direct link to cover asset..."
                      type="text"
                      value={form.coverImageUrl}
                      onChange={(e) => handleChange('coverImageUrl', e.target.value)}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Category</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-none py-3 px-0 focus:ring-0 text-on-surface placeholder:text-outline border-b-2 border-outline-variant/30 focus:border-primary"
                      placeholder="e.g. Science Fiction, Technology..."
                      type="text"
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">Author</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-none py-3 px-0 focus:ring-0 text-on-surface placeholder:text-outline border-b-2 border-outline-variant/30 focus:border-primary"
                      placeholder="Book author name..."
                      type="text"
                      value={form.author}
                      onChange={(e) => handleChange('author', e.target.value)}
                    />
                  </div>

                  {/* Cover Preview */}
                  <div className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-dashed border-outline-variant/50 relative overflow-hidden">
                    {form.coverImageUrl ? (
                      <img className="absolute inset-0 w-full h-full object-cover" src={form.coverImageUrl} alt="Preview" />
                    ) : (
                      <div className="relative z-20 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-outline mb-3">image</span>
                        <p className="text-[10px] uppercase tracking-widest text-outline-variant font-bold">Preview Area</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 pt-8 flex items-center justify-end gap-6 border-t border-outline-variant/20">
                  <button type="button" onClick={() => navigate('/admin/ebooks')} className="text-[11px] font-bold text-on-surface-variant hover:text-on-surface tracking-widest uppercase transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-primary to-primary-container px-10 py-4 rounded-xl font-black text-on-primary-container tracking-widest uppercase text-xs shadow-[0_0_25px_rgba(83,221,252,0.4)] hover:shadow-[0_0_35px_rgba(83,221,252,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">save</span>
                    {saving ? 'Saving...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
