import { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { LogOut, Plus, FileAudio, Folder, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { AudioUploader } from './AudioUploader';
import { TranscriptList } from './TranscriptList';
import { motion } from 'motion/react';

interface Transcript {
  id: string;
  text: string;
  fileName: string;
  createdAt: any;
  adminId: string;
}

export function AdminDashboard({ user }: { user: User }) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'transcripts'),
      where('adminId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transcript[];
      setTranscripts(data);
      setLoading(false);
    }, (error) => {
        console.error("Firestore Error: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleLogout = () => signOut(auth);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transcript?')) {
      try {
        await deleteDoc(doc(db, 'transcripts', id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 p-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <FileAudio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ScribeAdmin <span className="font-normal text-neutral-500 text-sm">v1.2</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 leading-none mt-1">Audio Archive Node // {user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-full py-1.5 pl-1.5 pr-1.5">
          <div className="flex w-fit items-center gap-3 pl-3 pr-2">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="block text-xs font-medium text-white truncate max-w-[120px]">Administrator</span>
              <span className="block text-[10px] text-neutral-500 leading-none">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-neutral-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="grid flex-grow grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6">
        
        {/* Upload Card - Bento Large Item */}
        <section className="col-span-1 md:col-span-8 row-span-4 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 transition-colors duration-500 group-hover:border-indigo-500">
              <FileAudio className="h-10 w-10 text-neutral-500 group-hover:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-white">Process New Audio</h2>
            <p className="mx-auto mb-8 max-w-sm text-neutral-400 text-sm">Convert archival audio material into digital text records using Gemini AI models.</p>
            <button 
              onClick={() => setShowUploader(true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Browse Audio Objects
            </button>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-600">Secure AES-256 Storage</p>
          </div>
        </section>

        {/* Stats - Bento Small Item */}
        <div className="col-span-1 md:col-span-4 row-span-2 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <Folder className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Archive Size</span>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1 text-white">{transcripts.length}</div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Stored Records</p>
          </div>
        </div>

        {/* API Status - Bento Small Item */}
        <div className="col-span-1 md:col-span-4 row-span-2 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="h-5 w-5 rounded-full border-2 border-emerald-500 flex items-center justify-center p-0.5">
                <div className="h-full w-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Engine Status</span>
          </div>
          <div>
            <div className="text-xl font-bold mb-1 italic text-white leading-none">Operational</div>
            <p className="text-xs text-neutral-500">Gemini-3-Flash // Active</p>
          </div>
        </div>

        {/* History List - Bento Large Bottom/Scrollable Item */}
        <section className="col-span-1 md:col-span-12 row-span-2 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">Archival Log</h3>
            <div className="text-[10px] px-2 py-1 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-neutral-400 uppercase tracking-widest">PostgreSQL Connected</div>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin opacity-20" />
              </div>
            ) : (
              <TranscriptList transcripts={transcripts} onDelete={handleDelete} />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-6 flex justify-between items-center text-[10px] text-neutral-600 uppercase tracking-widest">
        <p>© 2024 Hiring Inc. Transcription Node</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
            Live Sync Pulse
          </span>
        </div>
      </footer>

      {/* Uploader Modal */}
      {showUploader && (
        <AudioUploader 
          user={user} 
          onClose={() => setShowUploader(false)} 
        />
      )}
    </div>
  );
}
