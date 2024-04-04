import { EngineType } from '@src/engines/engine';
import { Menus } from 'webextension-polyfill-ts';

export default interface AgentV2 {
  identifier: string;
  name: string;
  description: string;
  tags: string[];
  engines: {
    [key in Menus.ContextType]: {
      type: EngineType;
      model: string;
      systemPrompt?: string;
      prompt: string;
    };
  };
  autoSend?: boolean;
  schemaVersion: number;
}
