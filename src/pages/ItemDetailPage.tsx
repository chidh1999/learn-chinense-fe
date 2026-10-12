import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { LearningItem, ReviewState } from '../types';
import { TtsControls } from '../components/TtsControls';
import { languageLabel } from '../utils/settings';

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<LearningItem | null>(null);
  const [review, setReview] = useState<ReviewState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getItem(id)
      .then((data) => {
        setItem(data.item);
        setReview(data.review);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được'));
  }, [id]);

  if (error) return <p className="hint error">{error}</p>;
  if (!item) return <p>Đang tải…</p>;

  const onDelete = async () => {
    if (!window.confirm(`Xóa mục「${item.hanzi}」?`)) return;
    await api.deleteItem(item._id);
    navigate('/library');
  };

  return (
    <div className="page narrow">
      <div className="page-header">
        <h1>Chi tiết</h1>
        <div className="inline-controls">
          <Link className="btn" to={`/items/${item._id}/edit`}>
            Sửa
          </Link>
          <button className="btn danger" type="button" onClick={onDelete}>
            Xóa
          </button>
        </div>
      </div>

      <section className="panel detail">
        <div className="item-meta">
          <span className="badge">{item.type}</span>
          <span className="badge ghost">{languageLabel(item.pronunciationLanguage)}</span>
        </div>
        <h2 className="hanzi">{item.hanzi}</h2>
        <TtsControls text={item.hanzi} language={item.pronunciationLanguage} />
        <p>
          <strong>Pinyin:</strong> {item.pinyin || '—'}
        </p>
        <p>
          <strong>Nghĩa:</strong> {item.meaningVi || '—'}
        </p>
        <p>
          <strong>Nguồn:</strong> {item.source || '—'}
        </p>
        <p>
          <strong>Ghi chú:</strong> {item.notes || '—'}
        </p>
        {item.examples?.length > 0 && (
          <div>
            <strong>Ví dụ</strong>
            <ul>
              {item.examples.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </div>
        )}
        {item.tags?.length > 0 && (
          <div className="tags">
            {item.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
        {item.audioRecordingPath && (
          <div className="preview-audio">
            <strong>Bản ghi của bạn</strong>
            <audio controls src={api.audioUrl(item._id)} />
          </div>
        )}
        {review && (
          <div className="review-meta">
            <p>
              <strong>Ôn tiếp theo:</strong> {new Date(review.dueAt).toLocaleString()}
            </p>
            <p>
              <strong>Số lần ôn:</strong> {review.reviewCount} · Đúng/ổn: {review.correctCount}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
