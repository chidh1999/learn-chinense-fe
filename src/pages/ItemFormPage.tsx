import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { ItemFormValues, LearningItem } from '../types';
import { TtsControls } from '../components/TtsControls';
import { AudioRecorder } from '../components/AudioRecorder';
import { loadSettings } from '../utils/settings';

const emptyForm = (): ItemFormValues => ({
  type: 'word',
  hanzi: '',
  pinyin: '',
  meaningVi: '',
  pronunciationLanguage: loadSettings().defaultPronunciationLanguage,
  examples: '',
  source: '',
  tags: '',
  notes: '',
});

function toPayload(form: ItemFormValues) {
  return {
    type: form.type,
    hanzi: form.hanzi.trim(),
    pinyin: form.pinyin.trim(),
    meaningVi: form.meaningVi.trim(),
    pronunciationLanguage: form.pronunciationLanguage,
    examples: form.examples
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    source: form.source.trim(),
    tags: form.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    notes: form.notes.trim(),
  };
}

export function ItemFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<ItemFormValues>(emptyForm);
  const [item, setItem] = useState<LearningItem | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getItem(id)
      .then(({ item: data }) => {
        setItem(data);
        setForm({
          type: data.type,
          hanzi: data.hanzi,
          pinyin: data.pinyin || '',
          meaningVi: data.meaningVi || '',
          pronunciationLanguage: data.pronunciationLanguage,
          examples: (data.examples || []).join('\n'),
          source: data.source || '',
          tags: (data.tags || []).join(', '),
          notes: data.notes || '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được mục'))
      .finally(() => setLoading(false));
  }, [id]);

  const onChange = (field: keyof ItemFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = toPayload(form);
      if (!payload.hanzi) {
        throw new Error('Chữ Hán là bắt buộc');
      }
      if (isEdit && id) {
        const updated = await api.updateItem(id, payload);
        setItem(updated);
        setSuccess('Đã cập nhật.');
      } else {
        const created = await api.createItem(payload);
        setSuccess('Đã tạo mục mới.');
        navigate(`/items/${created._id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải…</p>;

  return (
    <div className="page narrow">
      <div className="page-header">
        <h1>{isEdit ? 'Sửa mục' : 'Thêm mục'}</h1>
        {id && (
          <Link className="btn ghost" to={`/items/${id}`}>
            Xem chi tiết
          </Link>
        )}
      </div>

      <form className="form panel" onSubmit={onSubmit}>
        <label>
          Loại
          <select value={form.type} onChange={(e) => onChange('type', e.target.value)}>
            <option value="word">Word — từ đơn</option>
            <option value="phrase">Phrase — cụm từ</option>
            <option value="sentence">Sentence — câu</option>
          </select>
        </label>

        <label>
          Chữ Hán *
          <input value={form.hanzi} onChange={(e) => onChange('hanzi', e.target.value)} required />
        </label>

        <TtsControls text={form.hanzi} language={form.pronunciationLanguage} />

        <label>
          Pinyin
          <input
            value={form.pinyin}
            onChange={(e) => onChange('pinyin', e.target.value)}
            placeholder="Có thể để trống nếu chưa biết"
          />
        </label>

        <label>
          Nghĩa tiếng Việt
          <input
            value={form.meaningVi}
            onChange={(e) => onChange('meaningVi', e.target.value)}
            placeholder="Có thể để trống"
          />
        </label>

        <label>
          Ngôn ngữ phát âm
          <select
            value={form.pronunciationLanguage}
            onChange={(e) => onChange('pronunciationLanguage', e.target.value)}
          >
            <option value="zh-CN">Phổ thông (zh-CN)</option>
            <option value="yue-HK">Quảng Đông (yue-HK)</option>
          </select>
        </label>

        <label>
          Ví dụ (mỗi dòng một ví dụ)
          <textarea
            rows={3}
            value={form.examples}
            onChange={(e) => onChange('examples', e.target.value)}
          />
        </label>

        <label>
          Nguồn học
          <input
            value={form.source}
            onChange={(e) => onChange('source', e.target.value)}
            placeholder="Phim, video, sách, hội thoại…"
          />
        </label>

        <label>
          Tags (cách nhau bởi dấu phẩy)
          <input value={form.tags} onChange={(e) => onChange('tags', e.target.value)} />
        </label>

        <label>
          Ghi chú
          <textarea rows={3} value={form.notes} onChange={(e) => onChange('notes', e.target.value)} />
        </label>

        <div className="inline-controls">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
          <Link className="btn ghost" to="/library">
            Về thư viện
          </Link>
        </div>
        {error && <p className="hint error">{error}</p>}
        {success && <p className="hint success">{success}</p>}
      </form>

      <AudioRecorder
        itemId={id || item?._id}
        hasExistingAudio={Boolean(item?.audioRecordingPath)}
        onSaved={() => {
          if (id) {
            api.getItem(id).then(({ item: data }) => setItem(data));
          }
        }}
        onDeleted={() => {
          if (item) setItem({ ...item, audioRecordingPath: null });
        }}
      />
    </div>
  );
}
