export type AuthNoticeTone = 'success' | 'warning';

export interface AuthNoticeState {
  message?: string;
  messageTone?: AuthNoticeTone;
}
