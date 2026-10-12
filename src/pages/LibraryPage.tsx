import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { LearningItem, Pagination } from '../types';
import { EmptyState } from '../components/EmptyState';
import { languageLabel } from '../utils/settings';

export function LibraryPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [pronunciationLanguage, setPronunciationLanguage] = useState('');
  const [tag, setTag] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (pageOverride?: number) => {
    const currentPage = pageOverride ?? page;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listItems({
        q,
        type,
        pronunciationLanguage,
        tag,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 12,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder]);

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    void load(1);
  };

  const onDelete = async (id: string, hanzi: string) => {
    if (!window.confirm(`Xóa mục「${hanzi}」? Hành động này không thể hoàn tác.`)) return;
    await api.deleteItem(id);
    void load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Thư viện</h1>
        <Link className="btn primary" to="/items/new">
          Thêm mục
        </Link>
      </div>

      <form className="filters" onSubmit={onSearch}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm Hán / Pinyin / nghĩa / nguồn"
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Mọi loại</option>
          <option value="word">Word</option>
          <option value="phrase">Phrase</option>
          <option value="sentence">Sentence</option>
        </select>
        <select
          value={pronunciationLanguage}
          onChange={(e) => setPronunciationLanguage(e.target.value)}
        >
          <option value="">Mọi ngôn ngữ</option>
          <option value="zh-CN">zh-CN</option>
          <option value="yue-HK">yue-HK</option>
        </select>
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Ngày tạo</option>
          <option value="updatedAt">Ngày cập nhật</option>
          <option value="dueAt">Ngày ôn tiếp</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>
        <button className="btn" type="submit">
          Lọc
        </button>
      </form>

      {loading && <p>Đang tải…</p>}
      {error && <p className="hint error">{error}</p>}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Thư viện trống"
          description="Bạn chưa lưu mục nào, hoặc bộ lọc hiện tại không khớp."
          actionLabel="Thêm mục mới"
          actionTo="/items/new"
        />
      )}

      <div className="item-list">
        {items.map((item) => (
          <article key={item._id} className="item-row">
            <div>
              <div className="item-meta">
                <span className="badge">{item.type}</span>
                <span className="badge ghost">{languageLabel(item.pronunciationLanguage)}</span>
              </div>
              <h2>{item.hanzi}</h2>
              <p className="muted">{item.pinyin || 'Chưa có Pinyin'}</p>
              <p>{item.meaningVi || 'Chưa có nghĩa'}</p>
              {item.source && <p className="muted">Nguồn: {item.source}</p>}
              {item.tags?.length > 0 && (
                <div className="tags">
                  {item.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="row-actions">
              <Link className="btn ghost" to={`/items/${item._id}`}>
                Chi tiết
              </Link>
              <Link className="btn" to={`/items/${item._id}/edit`}>
                Sửa
              </Link>
              <button className="btn danger" type="button" onClick={() => onDelete(item._id, item.hanzi)}>
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </button>
          <span>
            Trang {pagination.page}/{pagination.totalPages} · {pagination.total} mục
          </span>
          <button
            className="btn"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
