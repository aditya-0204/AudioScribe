import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Map username to internal format for Firebase
      const internalEmail = `${email.trim().split('@')[0]}@archive.node`;
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, internalEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, internalEmail, password);
      }
    } catch (err: any) {
      let message = err.message || 'Authentication failed';
      if (message.includes('auth/operation-not-allowed')) {
        message = 'Critical: Email/Password login is not enabled in Firebase. Enable it in Console > Auth > Sign-in method.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50"></div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">ScribeAdmin</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-500">Security Node Access // v1.2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Username / Admin ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/50 py-4 pl-12 pr-4 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="admin"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Archive Code</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/50 py-4 pl-12 pr-4 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-900/20 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              <span>{isRegistering ? 'Initialize Admin' : 'Access Dashboard'}</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-indigo-400 transition-colors"
            >
              {isRegistering ? 'Returning Admin? Login' : 'New Assignment? Register'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
