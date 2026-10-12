export type ItemType = 'word' | 'phrase' | 'sentence';
export type PronunciationLanguage = 'zh-CN' | 'yue-HK';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewState {
  _id?: string;
  itemId: string;
  dueAt: string;
  lastReviewedAt: string | null;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  reviewCount: number;
  correctCount: number;
}

export interface LearningItem {
  _id: string;
  type: ItemType;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  pronunciationLanguage: PronunciationLanguage;
  examples: string[];
  source: string;
  tags: string[];
  notes: string;
  audioRecordingPath?: string | null;
  audioMimeType?: string | null;
  createdAt: string;
  updatedAt: string;
  review?: ReviewState | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Stats {
  totalItems: number;
  dueToday: number;
  reviewedToday: number;
  totalReviews: number;
  recentItems: number;
  dailyReviews: Array<{ date: string; count: number }>;
}

export interface ItemFormValues {
  type: ItemType;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  pronunciationLanguage: PronunciationLanguage;
  examples: string;
  source: string;
  tags: string;
  notes: string;
}

export interface AppSettings {
  defaultPronunciationLanguage: PronunciationLanguage;
  ttsVoiceURI: string;
  ttsRate: number;
}
