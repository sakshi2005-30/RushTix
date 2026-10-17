import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="notice error-notice" role="alert">
      <AlertCircle size={19} />
      <div><strong>We hit a small snag</strong><p>{message}</p></div>
      {onRetry && <button className="button button-secondary button-small" onClick={onRetry}><RefreshCw size={14} /> Try again</button>}
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return <div className="event-grid" aria-label="Loading events">{Array.from({ length: count }, (_, index) => <div className="event-skeleton" key={index}><div className="skeleton-art" /><div className="skeleton-line wide" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}</div>;
}
