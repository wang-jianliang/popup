import { Menus } from 'webextension-polyfill-ts';
import { EngineType } from '@src/engines/engine';
export default interface Agent {
  name: string;
  description: string;
  engine: EngineType;
  model: string;
  systemPrompt?: string;
  prompts: {
    [key in Menus.ContextType]: string;
  };
  autoSend?: boolean;
}
