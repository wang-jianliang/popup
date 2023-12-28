import { ChatMessage } from '@pages/content/ui/types';

export interface Choice {
  index: number;
  delta: {
    content: string;
  };
  finish_reason?: any;
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint?: any;
  choices: Choice[];
}

export interface Engine {
  accept: (model: string) => Promise<boolean>;
  complete: (
    model: string,
    messages: ChatMessage[],
    onMessageChunk: (text: string) => void,
    onStarted: (() => void) | null,
    onFinished: (() => void) | null,
    onError: ((err: any) => void) | null,
  ) => Promise<void>;
}

export enum EngineType {
  ChatGPT = 'ChatGPT',
}
