export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  type?: 'chat' | 'error' | 'info';
}

export interface DesignStyle {
  id: string;
  name: string;
  prompt: string;
  thumbnail: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  CHATTING = 'CHATTING',
}
