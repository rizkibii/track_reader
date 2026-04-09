import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signIn } from '../lib/auth-client';
import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.profileCompleted) {
        navigate('/library', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}`,
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-surface text-on-surface overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px]"></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20" 
          style={{ backgroundImage: 'radial-gradient(#192540 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        ></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md px-6">
        <div className="glass-card rounded-[2rem] p-10 border border-outline-variant/10 shadow-2xl flex flex-col items-center text-center">
          {/* App Identity */}
          <div className="mb-8 group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 rotate-3 transition-transform group-hover:rotate-0 duration-500 mx-auto">
              <span className="material-symbols-outlined text-4xl text-on-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-primary mb-2">TrackReader</h1>
            <p className="text-on-surface-variant font-medium leading-relaxed max-w-[240px] mx-auto">
              Track your reading journey effortlessly.
            </p>
          </div>

          {/* Login Action */}
          <div className="w-full space-y-6">
            {/* Google Login Button */}
            <button onClick={handleGoogleLogin} className="w-full h-14 bg-gradient-to-r from-primary to-secondary p-[1px] rounded-xl overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 glow-hover">
              <div className="w-full h-full bg-surface-container-highest/80 flex items-center justify-center gap-3 px-4 rounded-[11px] backdrop-blur-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="font-bold text-on-surface tracking-tight">Login with Google</span>
              </div>
            </button>

          </div>

          {/* Footer */}
          <footer className="mt-12">
            <a 
              className="text-on-surface-variant hover:text-secondary text-xs font-medium tracking-wide border-b border-transparent hover:border-secondary transition-all" 
              href="https://wa.me/6285743216819"
              target="_blank"
              rel="noopener noreferrer"
            >
              Need help? Contact Admin
            </a>
          </footer>
        </div>

        {/* Metric Pulse Aesthetic */}
        <div className="absolute -bottom-24 -left-16 hidden lg:block opacity-40">
          <div className="flex flex-col items-start">
            <span className="text-6xl font-black text-primary/20 tracking-tighter">12.4k</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-secondary rounded-full"></div>
              <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.3em]">Active Readers</span>
            </div>
          </div>
        </div>

        <div className="absolute top-0 -right-24 hidden lg:block opacity-20 pointer-events-none">
          <div className="w-64 h-64 border-[32px] border-primary-dim/20 rounded-full"></div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary-container opacity-50"></div>
    </div>
  );
}
