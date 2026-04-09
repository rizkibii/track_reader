import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type UserStats } from '../lib/api';
import { signOut } from '../lib/auth-client';

export default function UserProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    api.users.stats().then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const totalHours = stats ? (stats.totalReadingTimeSeconds / 3600).toFixed(1) : '0';

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="text-on-background min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="bg-slate-900/70 backdrop-blur-xl top-0 sticky z-50 shadow-[0_20px_40px_rgba(0,0,0,0.4)] w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full px-8 py-4">
          <Link to="/library" className="text-2xl font-black tracking-tighter text-cyan-400 font-['Inter']">TrackReader</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-slate-400 hover:text-slate-200 font-bold tracking-tight transition-all duration-300" to="/library">Library</Link>
            <Link className="text-slate-400 hover:text-slate-200 font-bold tracking-tight transition-all duration-300" to="/history">History</Link>
            <Link className="text-cyan-400 border-b-2 border-cyan-400 pb-1 font-bold tracking-tight transition-all duration-300" to="/user">Profile</Link>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-all duration-300 p-2 rounded-full text-sm font-bold">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        {/* Hero Profile Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:items-end mb-20">
          <div className="relative group">
            <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-xl overflow-hidden shadow-2xl ring-4 ring-primary/20">
              {user?.image ? (
                <img alt="User Profile" className="w-full h-full object-cover" src={user.image} />
              ) : (
                <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-outline">person</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-on-primary p-3 rounded-lg shadow-lg">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-display-lg text-5xl lg:text-7xl font-bold tracking-tighter text-on-surface">{user?.name || 'Loading...'}</h1>
              {user?.username && (
                <p className="text-primary font-medium tracking-widest uppercase text-sm mt-2">@{user.username}</p>
              )}
            </div>
            {user?.bio && (
              <p className="text-on-surface-variant max-w-xl text-body-md leading-relaxed">{user.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/profile" className="bg-gradient-to-r from-primary to-primary-dim text-on-primary px-8 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(83,221,252,0.3)] hover:scale-95 transition-transform flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Books Read */}
            <div className="glass-card p-8 rounded-xl border-l-4 border-primary group hover:bg-slate-800/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label-md uppercase tracking-widest text-on-surface-variant text-xs">Total Books Read</span>
                <span className="material-symbols-outlined text-primary-dim">book_5</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black tracking-tight text-on-surface">{stats?.totalBooksRead ?? '—'}</span>
              </div>
            </div>

            {/* Reading Time */}
            <div className="glass-card p-8 rounded-xl border-l-4 border-secondary group hover:bg-slate-800/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-label-md uppercase tracking-widest text-on-surface-variant text-xs">Total Reading Time</span>
                <span className="material-symbols-outlined text-secondary">schedule</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black tracking-tight text-on-surface">{totalHours}</span>
                <span className="text-on-surface-variant font-bold">Hours</span>
              </div>
            </div>

            {/* Info */}
            <div className="col-span-1 sm:col-span-2 glass-card p-8 rounded-xl">
              <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-8">Personal Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Email Address</label>
                  <p className="text-on-surface font-medium">{user?.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Username</label>
                  <p className="text-on-surface font-medium">{user?.username ? `@${user.username}` : '—'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Gender</label>
                  <p className="text-on-surface font-medium capitalize">{user?.gender || '—'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Role</label>
                  <p className="text-on-surface font-medium capitalize">{user?.role || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-center border border-outline-variant/10">
              <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Reading Streak</label>
              <div className="text-display-sm text-4xl font-bold tracking-tight text-on-surface mb-4">
                {stats?.currentStreak ?? 0} Days
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-card p-6 rounded-xl flex flex-col gap-4">
              <h3 className="text-primary font-bold uppercase tracking-widest text-xs">Top Achievements</h3>
              {(stats?.totalBooksRead ?? 0) >= 10 && (
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-high transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Bookworm</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">10+ books read</p>
                  </div>
                </div>
              )}
              {(stats?.currentStreak ?? 0) >= 7 && (
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-high transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">On Fire</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">7-day reading streak</p>
                  </div>
                </div>
              )}
              {(stats?.totalBooksRead ?? 0) === 0 && (stats?.currentStreak ?? 0) < 7 && (
                <p className="text-on-surface-variant text-xs italic p-3">Start reading to unlock achievements!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
