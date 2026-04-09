import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { api, type Ebook, type ReadingSession } from '../lib/api';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

export default function Reader() {
  const navigate = useNavigate();
  const { ebookId } = useParams<{ ebookId: string }>();

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<ReadingSession | null>(null);
  const elapsedRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  // Load ebook and start session
  useEffect(() => {
    if (!ebookId) return;

    const init = async () => {
      try {
        const [ebookRes, sessionRes] = await Promise.all([
          api.ebooks.get(ebookId),
          api.readingSessions.start(ebookId),
        ]);
        setEbook(ebookRes.data);
        setSession(sessionRes.data);
        setElapsed(0);
      } catch (err) {
        console.error('Failed to init reader:', err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      endSession();
    };
  }, [ebookId]);

  // Start timer & heartbeat once session exists
  useEffect(() => {
    if (!session) return;

    // 1-second timer for UI display
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    // Heartbeat every 30s
    heartbeatRef.current = setInterval(() => {
      if (sessionRef.current) {
        api.readingSessions.heartbeat(
          sessionRef.current.id,
          elapsedRef.current
        ).catch(console.error);
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [session]);

  const endSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    if (sessionRef.current) {
      try {
        // Send final heartbeat then end
        await api.readingSessions.heartbeat(sessionRef.current.id, elapsedRef.current);
        await api.readingSessions.end(sessionRef.current.id);
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    }
  }, []);

  const handleBack = async () => {
    await endSession();
    navigate('/library');
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">Loading reader...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* TopAppBar */}
      <header className="bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_20px_40px_rgba(0,0,0,0.4)] w-full">
        <div className="w-full flex justify-between items-center px-8 py-3">
          <div className="flex items-center gap-6">
            <button onClick={handleBack} className="flex items-center justify-center p-2 rounded-full hover:bg-slate-800/50 transition-all duration-300 group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">Now Reading</span>
              <h1 className="text-xl font-black tracking-tighter text-cyan-400 font-headline">
                {ebook?.title || 'Loading...'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/15 pulsing-glow">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
              <span className="font-mono text-primary font-bold tracking-widest text-lg">{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full relative z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {ebook?.heyzineUrl && (
          <iframe 
            src={ebook.heyzineUrl}
            className="absolute inset-0 w-full h-full border-none z-10" 
            allowFullScreen 
            loading="lazy"
            title={ebook.title}
          />
        )}
      </main>

      {/* Privacy Banner */}
      <footer className="fixed bottom-0 left-0 w-full px-8 py-4 z-10">
        <div className="mx-auto max-w-4xl glass-panel px-6 py-3 rounded-full border border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary-dim shadow-[0_0_8px_#8455ef]"></div>
            <p className="text-xs text-on-surface-variant font-medium">
              Durasi membaca Anda dicatat untuk kebutuhan evaluasi pembelajaran.
            </p>
          </div>
        </div>
      </footer>
      
      <div className="fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent pointer-events-none z-0"></div>
    </div>
  );
}
