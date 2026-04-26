import { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { transcribeAudio } from '../services/geminiService';
import { X, Upload, Music, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AudioUploader({ user, onClose }: { user: User, onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'transcribing' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        alert('File size too large. Keep it under 10MB.');
        return;
      }
      setFile(selected);
      setStatus('idle');
      setError(null);
    }
  };

  const toBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus('transcribing');
    setError(null);

    try {
      const base64 = await toBase64(file);
      const transcriptText = await transcribeAudio(base64, file.type);
      
      setStatus('saving');
      
      await addDoc(collection(db, 'transcripts'), {
        text: transcriptText,
        fileName: file.name,
        adminId: user.uid,
        createdAt: serverTimestamp()
      });

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'Transcription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-neutral-950/80"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-white tracking-tight">Audio Ingestion</h2>

        <div 
          onClick={() => status === 'idle' && fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-800 p-12 transition-all ${status === 'idle' ? 'cursor-pointer hover:border-indigo-500/50 hover:bg-neutral-950' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="audio/*" 
          />
          
          {file ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <Music className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-white mb-1 truncate max-w-[240px] mx-auto">{file.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB // Ready</p>
            </div>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-neutral-500 transition-colors group-hover:bg-indigo-500/10 group-hover:text-indigo-400">
                <Upload className="h-8 w-8" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Deploy Audio Material</p>
              <p className="mt-2 text-[9px] uppercase tracking-widest text-neutral-600">Lossless or Compressed // Max 10MB</p>
            </>
          )}
        </div>

        {status !== 'idle' && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex h-8 w-8 items-center justify-center">
              {status === 'transcribing' && <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />}
              {status === 'saving' && <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />}
              {status === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            </div>
            
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {status === 'transcribing' && 'Neural Transcription Active'}
                {status === 'saving' && 'Committing to Cloud Node'}
                {status === 'success' && 'Process Complete'}
                {status === 'error' && 'Process Failure'}
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-neutral-500">
                {status === 'transcribing' && 'Engine: Gemini-3-Flash // Part 1/1'}
                {status === 'saving' && 'Destination: PostgreSQL Archive'}
                {status === 'success' && 'Record Indexed Successfully'}
                {status === 'error' && error}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button 
            disabled={loading}
            onClick={onClose}
            className="px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            Abort
          </button>
          <button 
            disabled={!file || loading || status === 'success'}
            onClick={handleUpload}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-indigo-500 disabled:opacity-30 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            Execute Sync
          </button>
        </div>
      </motion.div>
    </div>
  );
}
