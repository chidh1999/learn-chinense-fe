import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Stats } from '../types';
import { EmptyState } from '../components/EmptyState';

export function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được thống kê'));
  }, []);

  if (error) return <p className="hint error">{error}</p>;
  if (!stats) return <p>Đang tải…</p>;

  if (stats.totalItems === 0) {
    return (
      <EmptyState
        title="Chưa có dữ liệu thống kê"
        description="Thêm kiến thức và hoàn thành vài lượt ôn để xem tiến độ."
        actionLabel="Thêm mục"
        actionTo="/items/new"
      />
    );
  }

  const max = Math.max(...stats.dailyReviews.map((d) => d.count), 1);

  return (
    <div className="page">
      <h1>Thống kê</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span>Đã học</span>
          <strong>{stats.totalItems}</strong>
        </div>
        <div className="stat-card">
          <span>Tổng lượt ôn</span>
          <strong>{stats.totalReviews}</strong>
        </div>
        <div className="stat-card">
          <span>Đến hạn hôm nay</span>
          <strong>{stats.dueToday}</strong>
        </div>
        <div className="stat-card">
          <span>Đã ôn hôm nay</span>
          <strong>{stats.reviewedToday}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Lượt ôn theo ngày</h2>
        {stats.dailyReviews.length === 0 ? (
          <p className="muted">Chưa có lịch sử ôn.</p>
        ) : (
          <div className="chart">
            {stats.dailyReviews.map((day) => (
              <div key={day.date} className="chart-bar-wrap" title={`${day.date}: ${day.count}`}>
                <div className="chart-bar" style={{ height: `${(day.count / max) * 120}px` }} />
                <span>{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
