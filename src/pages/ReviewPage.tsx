import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { LearningItem, ReviewRating, ReviewState } from '../types';
import { TtsControls } from '../components/TtsControls';
import { EmptyState } from '../components/EmptyState';

type DueCard = { item: LearningItem; review: ReviewState };

export function ReviewPage() {
  const [queue, setQueue] = useState<DueCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [type, setType] = useState('');
  const [tag, setTag] = useState('');
  const [pronunciationLanguage, setPronunciationLanguage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneCount, setDoneCount] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.dueReviews({ type, tag, pronunciationLanguage, limit: 50 });
      setQueue(data as DueCard[]);
      setIndex(0);
      setRevealed(false);
      setDoneCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được bài ôn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = queue[index];

  const rate = async (rating: ReviewRating) => {
    if (!current || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.completeReview(current.item._id, rating);
      setDoneCount((c) => c + 1);
      setRevealed(false);
      if (index + 1 < queue.length) {
        setIndex((i) => i + 1);
      } else {
        setQueue([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được kết quả ôn');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Đang tải…</p>;

  return (
    <div className="page narrow">
      <div className="page-header">
        <h1>Ôn tập</h1>
        <span className="muted">
          Đến hạn: {queue.length} · Đã ôn phiên này: {doneCount}
        </span>
      </div>

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
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
        <button className="btn" type="submit">
          Áp dụng
        </button>
      </form>

      {error && <p className="hint error">{error}</p>}

      {!current && (
        <EmptyState
          title="Không còn mục đến hạn"
          description="Thêm kiến thức mới hoặc quay lại khi đến lịch ôn tiếp theo."
          actionLabel="Về thư viện"
          actionTo="/library"
        />
      )}

      {current && (
        <section className="flashcard panel">
          <div className="item-meta">
            <span className="badge">{current.item.type}</span>
            <span className="muted">
              Thẻ {index + 1}/{queue.length}
            </span>
          </div>
          <h2 className="hanzi">{current.item.hanzi}</h2>
          <div className="inline-controls">
            <TtsControls text={current.item.hanzi} language={current.item.pronunciationLanguage} />
            {current.item.audioRecordingPath && (
              <audio controls src={api.audioUrl(current.item._id)} />
            )}
          </div>

          {!revealed ? (
            <button className="btn primary" type="button" onClick={() => setRevealed(true)}>
              Hiện đáp án
            </button>
          ) : (
            <div className="answer">
              <p>
                <strong>Pinyin:</strong> {current.item.pinyin || '—'}
              </p>
              <p>
                <strong>Nghĩa:</strong> {current.item.meaningVi || '—'}
              </p>
              {current.item.notes && (
                <p>
                  <strong>Ghi chú:</strong> {current.item.notes}
                </p>
              )}
              <div className="rating-row">
                <button className="btn danger" disabled={submitting} onClick={() => rate('again')}>
                  Again
                </button>
                <button className="btn" disabled={submitting} onClick={() => rate('hard')}>
                  Hard
                </button>
                <button className="btn primary" disabled={submitting} onClick={() => rate('good')}>
                  Good
                </button>
                <button className="btn success" disabled={submitting} onClick={() => rate('easy')}>
                  Easy
                </button>
              </div>
              <p className="muted">Kết quả chỉ được lưu khi bạn chọn một mức ở trên.</p>
            </div>
          )}
        </section>
      )}

      <p className="muted">
        <Link to="/statistics">Xem thống kê tiến độ</Link>
      </p>
    </div>
  );
}
