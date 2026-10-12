import type { AppSettings, PronunciationLanguage } from '../types';

const KEY = 'chinese-learning-settings';

const defaults: AppSettings = {
  defaultPronunciationLanguage: 'zh-CN',
  ttsVoiceURI: '',
  ttsRate: 0.9,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function languageLabel(lang: PronunciationLanguage): string {
  return lang === 'yue-HK' ? 'Quảng Đông (yue-HK)' : 'Phổ thông (zh-CN)';
}
