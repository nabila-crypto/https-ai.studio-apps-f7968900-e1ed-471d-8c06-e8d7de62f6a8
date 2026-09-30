import React, { useEffect, useState } from 'react';
import { AuditLog } from '../types/maritime';
import { useAuth } from '../context/AuthContext';
import { Activity, X } from 'lucide-react';

interface Props {
  latestLog: AuditLog | null;
}

export const RealtimeNotification: React.FC<Props> = ({ latestLog }) => {
  const { currentUser } = useAuth();
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (!latestLog) return;
    // Don't alert if current user just made the change within 2 seconds
    if (latestLog.userEmail === currentUser?.email) return;

    setCurrentAlert(latestLog);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [latestLog, currentUser?.email]);

  if (!visible || !currentAlert) return null;

  const actionText =
    currentAlert.action === 'CREATE' ? 'menambahkan' : currentAlert.action === 'UPDATE' ? 'memperbarui' : 'menghapus';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-sky-500/40 backdrop-blur-md animate-bounce-subtle flex items-start space-x-3">
      <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400 shrink-0">
        <Activity className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Sinkronisasi Cloud Real-Time
          </span>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm font-medium text-slate-100 mt-1 truncate">
          {currentAlert.userEmail}
        </p>
        <p className="text-xs text-slate-300 mt-0.5">
          Telah {actionText} data di modul <span className="font-semibold text-white">{currentAlert.module}</span>: {currentAlert.targetTitle}
        </p>
        <span className="text-[10px] text-sky-300/80 mt-1 inline-block">
          Data langsung tersinkronisasi di layar Anda
        </span>
      </div>
    </div>
  );
};
