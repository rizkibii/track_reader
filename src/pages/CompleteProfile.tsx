import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();

  const [form, setForm] = useState({
    username: '',
    name: user?.name || '',
    gender: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.users.completeProfile({
        username: form.username || undefined,
        name: form.name || undefined,
        gender: form.gender || undefined,
        bio: form.bio || undefined,
      });
      await refetchUser();
      navigate('/library');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 h-16 bg-[#060e20]/70 backdrop-blur-xl shadow-2xl shadow-cyan-900/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 w-full h-full">
          <div className="text-2xl font-bold tracking-tighter text-[#53ddfc]">TrackReader</div>
          <div className="hidden md:flex space-x-8">
            <Link className="text-slate-400 font-medium hover:text-[#53ddfc] transition-colors duration-300" to="/library">Library</Link>
            <Link className="text-slate-400 font-medium hover:text-[#53ddfc] transition-colors duration-300" to="/history">History</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="material-symbols-outlined text-[#53ddfc] hover:scale-95 duration-200">account_circle</button>
          </div>
        </div>
      </nav>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#53ddfc]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ac8aff]/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-2xl px-6 py-24 flex flex-col items-center">
        <div className="w-full mb-12 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold shadow-[0_0_15px_rgba(83,221,252,0.3)]">1</div>
            <div className="h-[2px] w-12 bg-outline-variant/30"></div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant font-bold">2</div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-fixed font-bold">Setup Progress: Step 1 of 1</p>
          <h1 className="text-4xl font-extrabold tracking-tight mt-2 text-on-surface text-center">Complete Profile</h1>
          <p className="text-on-surface-variant text-sm mt-2">Set up your digital archive identity.</p>
        </div>

        <div className="w-full glass-card rounded-2xl p-8 md:p-12 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high flex items-center justify-center">
                  {user?.image ? (
                    <img className="w-full h-full object-cover" src={user.image} alt="Profile" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-outline">person</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-2 input-accent">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Username</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-0 placeholder:text-outline/50"
                  placeholder="@reader_one"
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2 input-accent">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Full Name</label>
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-0"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Gender</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    className="w-5 h-5 border-2 border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background checked:bg-primary"
                    name="gender" type="radio" value="male"
                    checked={form.gender === 'male'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">Male</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    className="w-5 h-5 border-2 border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-background checked:bg-primary"
                    name="gender" type="radio" value="female"
                    checked={form.gender === 'female'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span className="text-on-surface-variant group-hover:text-primary transition-colors">Female</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col space-y-2 input-accent">
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Bio</label>
              <textarea
                className="w-full bg-surface-container-low border-none rounded-lg p-4 text-on-surface focus:ring-0 resize-none placeholder:text-outline/50"
                placeholder="Tell us about your reading journey..."
                rows={4}
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              ></textarea>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-[0_0_20px_rgba(83,221,252,0.2)] hover:shadow-[0_0_30px_rgba(83,221,252,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
                type="button"
              >
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
              <button
                onClick={() => navigate('/library')}
                className="w-full mt-4 py-2 text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-bold"
                type="button"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-[#1e293b]/70 backdrop-blur-lg rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <Link className="flex flex-col items-center justify-center text-slate-400 hover:text-[#ac8aff]" to="/library">
          <span className="material-symbols-outlined">local_library</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">Library</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-400 hover:text-[#ac8aff]" to="/history">
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">History</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-slate-400 hover:text-[#ac8aff]" to="/library">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">Reading</span>
        </Link>
        <Link className="flex flex-col items-center justify-center bg-[#53ddfc]/20 text-[#53ddfc] rounded-xl px-4 py-1 active:scale-90 transition-transform" to="/user">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] uppercase tracking-wider mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
}
