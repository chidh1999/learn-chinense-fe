import { useCallback, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported';

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBlob(null);
  }, [previewUrl]);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('unsupported');
      setError('Trình duyệt không hỗ trợ ghi âm microphone.');
      return;
    }

    try {
      clearPreview();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const recorded = new Blob(chunksRef.current, { type });
        setBlob(recorded);
        setPreviewUrl(URL.createObjectURL(recorded));
        setStatus('recorded');
        cleanupStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
    } catch (err) {
      cleanupStream();
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        setError('Bạn đã từ chối quyền microphone. Hãy cho phép trong cài đặt trình duyệt để ghi âm.');
      } else {
        setStatus('idle');
        setError('Không thể truy cập microphone.');
      }
    }
  }, [clearPreview]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const reset = useCallback(() => {
    clearPreview();
    setStatus('idle');
    setError(null);
  }, [clearPreview]);

  return {
    status,
    error,
    blob,
    previewUrl,
    start,
    stop,
    reset,
    clearPreview,
  };
}
