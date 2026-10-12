import type { PronunciationLanguage } from '../types';
import { useTts } from '../hooks/useTts';

interface Props {
  text: string;
  language: PronunciationLanguage;
}

export function TtsControls({ text, language }: Props) {
  const { speak, stop, speaking, error, supported } = useTts();

  return (
    <div className="inline-controls">
      <button
        type="button"
        className="btn"
        disabled={!supported || !text.trim()}
        onClick={() => speak(text, language)}
      >
        {speaking ? 'Đang đọc…' : 'Nghe TTS'}
      </button>
      <button type="button" className="btn ghost" onClick={stop} disabled={!speaking}>
        Dừng
      </button>
      {error && <span className="hint error">{error}</span>}
    </div>
  );
}
