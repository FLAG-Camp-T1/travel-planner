import { LogOut, ShieldCheck, UserRound, X } from 'lucide-react';
import { createPortal } from 'react-dom';

type UserProfileModalProps = {
  displayName: string;
  onClose: () => void;
  onLogout: () => Promise<void>;
};

export default function UserProfileModal({
  displayName,
  onClose,
  onLogout,
}: UserProfileModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="User information"
        className="w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <UserRound className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                User
              </div>
              <div className="mt-1 truncate text-xl font-semibold text-slate-800">
                {displayName}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Signed in
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Close user information"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          This account is currently active in the planner.
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
