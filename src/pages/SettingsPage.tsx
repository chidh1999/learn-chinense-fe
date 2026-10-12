import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AppSettings } from '../types';
import { loadSettings, saveSettings } from '../utils/settings';
import { useTts } from '../hooks/useTts';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { voices, supported } = useTts();

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const exportJson = async () => {
    setError(null);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chinese-learning-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Đã tải file export.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export thất bại');
    }
  };

  const importJson = async (file: File) => {
    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = parsed.data ? { ...parsed.data, mode: 'merge' } : { ...parsed, mode: 'merge' };
      if (!payload.items && parsed.items) {
        payload.items = parsed.items;
      }
      const result = await api.importData(payload);
      setMessage(`Import xong: tạo ${result.created}, bỏ qua ${result.skipped}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import thất bại');
    }
  };

  return (
    <div className="page narrow">
      <h1>Cài đặt</h1>

      <section className="panel form">
        <h2>Phát âm / TTS</h2>
        <label>
          Ngôn ngữ mặc định khi thêm mục
          <select
            value={settings.defaultPronunciationLanguage}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                defaultPronunciationLanguage: e.target.value as AppSettings['defaultPronunciationLanguage'],
              }))
            }
          >
            <option value="zh-CN">Phổ thông (zh-CN)</option>
            <option value="yue-HK">Quảng Đông (yue-HK)</option>
          </select>
        </label>

        <label>
          Voice TTS
          <select
            value={settings.ttsVoiceURI}
            onChange={(e) => setSettings((s) => ({ ...s, ttsVoiceURI: e.target.value }))}
            disabled={!supported}
          >
            <option value="">Tự chọn theo ngôn ngữ</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>

        <label>
          Tốc độ đọc: {settings.ttsRate.toFixed(1)}
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={settings.ttsRate}
            onChange={(e) => setSettings((s) => ({ ...s, ttsRate: Number(e.target.value) }))}
          />
        </label>
        {!supported && <p className="hint error">Trình duyệt không hỗ trợ Web Speech API.</p>}
      </section>

      <section className="panel">
        <h2>Sao lưu dữ liệu</h2>
        <div className="inline-controls">
          <button className="btn" type="button" onClick={exportJson}>
            Export JSON
          </button>
          <label className="btn ghost file-btn">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importJson(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        <p className="muted">Import ở chế độ merge: bỏ qua mục trùng id, không ghi đè ngoài ý muốn.</p>
        {message && <p className="hint success">{message}</p>}
        {error && <p className="hint error">{error}</p>}
      </section>
    </div>
  );
}
