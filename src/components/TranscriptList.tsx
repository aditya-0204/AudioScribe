import ReactMarkdown from 'react-markdown';
import { Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Transcript {
  id: string;
  text: string;
  fileName: string;
  createdAt: any;
  adminId: string;
}

export function TranscriptList({ transcripts, onDelete }: { transcripts: Transcript[], onDelete: (id: string) => void }) {
  if (transcripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-neutral-800 bg-neutral-950/50 p-12 rounded-2xl text-center">
        <FileText className="mb-4 h-10 w-10 text-neutral-700" />
        <h3 className="text-sm font-medium text-neutral-500">No archival data found</h3>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-600">Upload audio to begin transcription</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {transcripts.map((t, idx) => (
        <motion.div
          key={t.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition-all hover:border-indigo-500/50 hover:bg-neutral-900"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
                <FileText className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-semibold text-white truncate max-w-[120px]" title={t.fileName}>
                {t.fileName}
              </h4>
            </div>
            <button 
              onClick={() => onDelete(t.id)}
              className="text-neutral-600 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-grow">
            <div className="text-[10px] leading-relaxed text-neutral-400 line-clamp-3">
              <ReactMarkdown>{t.text}</ReactMarkdown>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3 text-[9px] uppercase tracking-widest text-neutral-600 font-bold">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Syncing...'}
            </span>
            <span className="text-indigo-500/50">Stored</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
