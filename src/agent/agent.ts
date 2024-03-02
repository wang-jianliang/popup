import { Menus } from 'webextension-polyfill-ts';
import { EngineType } from '@src/engines/engine';
export default interface Agent {
  identifier: string;
  name: string;
  description: string;
  engine: EngineType;
  models: string[];
  tags: string[];
  systemPrompt?: string;
  prompts: {
    [key in Menus.ContextType]: string;
  };
  autoSend?: boolean;
  schemaVersion: number;
}
