import { Link } from 'react-router-dom';

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ title, description, actionLabel, actionTo }: Props) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && actionTo && (
        <Link className="btn primary" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
