import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Stats } from '../types';
import { EmptyState } from '../components/EmptyState';

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được thống kê'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải…</p>;
  if (error) return <p className="hint error">{error}</p>;
  if (!stats) return null;

  if (stats.totalItems === 0) {
    return (
      <EmptyState
        title="Chưa có kiến thức nào"
        description="Database đang trống. Hãy thêm từ, cụm từ hoặc câu bạn gặp khi học phim, video, sách."
        actionLabel="Thêm mục đầu tiên"
        actionTo="/items/new"
      />
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link className="btn primary" to="/review">
          Ôn hôm nay ({stats.dueToday})
        </Link>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span>Tổng mục đã lưu</span>
          <strong>{stats.totalItems}</strong>
        </div>
        <div className="stat-card">
          <span>Cần ôn hôm nay</span>
          <strong>{stats.dueToday}</strong>
        </div>
        <div className="stat-card">
          <span>Mới 7 ngày gần đây</span>
          <strong>{stats.recentItems}</strong>
        </div>
        <div className="stat-card">
          <span>Đã ôn hôm nay</span>
          <strong>{stats.reviewedToday}</strong>
        </div>
      </div>
      <section className="panel">
        <h2>Hoạt động ôn tập gần đây</h2>
        {stats.dailyReviews.length === 0 ? (
          <p className="muted">Chưa có lượt ôn nào.</p>
        ) : (
          <ul className="activity-list">
            {stats.dailyReviews.slice(-7).map((day) => (
              <li key={day.date}>
                <span>{day.date}</span>
                <strong>{day.count} lượt</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
