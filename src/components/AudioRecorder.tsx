import { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { api } from '../services/api';

interface Props {
  itemId?: string;
  hasExistingAudio?: boolean;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function AudioRecorder({ itemId, hasExistingAudio, onSaved, onDeleted }: Props) {
  const recorder = useAudioRecorder();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!itemId || !recorder.blob) {
      setError('Lưu mục trước, rồi mới lưu bản ghi âm.');
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const ext = recorder.blob.type.includes('ogg') ? 'ogg' : 'webm';
      await api.uploadAudio(itemId, recorder.blob, `recording.${ext}`);
      setMessage('Đã lưu bản ghi âm.');
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu audio thất bại');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!itemId) return;
    if (!window.confirm('Xóa bản ghi âm của mục này?')) return;
    setBusy(true);
    setError(null);
    try {
      await api.deleteAudio(itemId);
      recorder.reset();
      setMessage('Đã xóa bản ghi âm.');
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa audio thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h3>Ghi âm microphone</h3>
      <p className="muted">
        Chỉ ghi khi bạn bấm nút. Bản ghi được lưu qua backend, không lưu Base64 trong database.
      </p>
      <div className="inline-controls">
        {recorder.status !== 'recording' ? (
          <button type="button" className="btn" onClick={recorder.start} disabled={busy}>
            Bắt đầu ghi
          </button>
        ) : (
          <button type="button" className="btn danger" onClick={recorder.stop}>
            Dừng ghi
          </button>
        )}
        {recorder.status === 'recorded' && (
          <>
            <button type="button" className="btn ghost" onClick={recorder.reset}>
              Ghi lại
            </button>
            <button type="button" className="btn primary" onClick={save} disabled={busy || !itemId}>
              Lưu bản ghi
            </button>
          </>
        )}
        {hasExistingAudio && (
          <>
            <audio controls src={itemId ? api.audioUrl(itemId) : undefined} />
            <button type="button" className="btn ghost" onClick={remove} disabled={busy}>
              Xóa bản ghi đã lưu
            </button>
          </>
        )}
      </div>
      {recorder.previewUrl && (
        <div className="preview-audio">
          <span>Nghe thử bản ghi mới:</span>
          <audio controls src={recorder.previewUrl} />
        </div>
      )}
      {(recorder.error || error) && <p className="hint error">{recorder.error || error}</p>}
      {message && <p className="hint success">{message}</p>}
      {!itemId && <p className="hint">Tạo mục học trước để lưu file âm thanh.</p>}
    </section>
  );
}
