import { useCallback, useEffect, useState } from 'react';
import type { PronunciationLanguage } from '../types';
import { loadSettings } from '../utils/settings';

export function useTts() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    const list = window.speechSynthesis.getVoices();
    setVoices(list);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices);
      window.speechSynthesis.cancel();
    };
  }, [refreshVoices]);

  const pickVoice = useCallback(
    (lang: PronunciationLanguage, preferredURI?: string) => {
      if (preferredURI) {
        const preferred = voices.find((v) => v.voiceURI === preferredURI);
        if (preferred) return preferred;
      }
      if (lang === 'yue-HK') {
        return (
          voices.find((v) => v.lang.toLowerCase().startsWith('yue')) ||
          voices.find((v) => v.lang.toLowerCase().includes('hk')) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('zh-hk')) ||
          null
        );
      }
      return (
        voices.find((v) => v.lang.toLowerCase() === 'zh-cn') ||
        voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ||
        null
      );
    },
    [voices]
  );

  const speak = useCallback(
    (text: string, lang: PronunciationLanguage) => {
      setError(null);
      if (!supported || !window.speechSynthesis) {
        setError('Thiết bị không hỗ trợ Web Speech API (TTS).');
        return;
      }
      if (!text.trim()) {
        setError('Không có chữ Hán để đọc.');
        return;
      }

      const settings = loadSettings();
      const voice = pickVoice(lang, settings.ttsVoiceURI);
      if (!voice) {
        setError(
          lang === 'yue-HK'
            ? 'Không tìm thấy giọng Quảng Đông trên thiết bị. Hãy thử giọng Phổ thông hoặc cài voice hệ thống.'
            : 'Không tìm thấy giọng tiếng Trung trên thiết bị.'
        );
        return;
      }

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = voice;
      utter.lang = voice.lang || lang;
      utter.rate = settings.ttsRate;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => {
        setSpeaking(false);
        setError('Không phát được TTS.');
      };
      window.speechSynthesis.speak(utter);
    },
    [pickVoice, supported]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { voices, supported, speaking, error, speak, stop, pickVoice };
}
