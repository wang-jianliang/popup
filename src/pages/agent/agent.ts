import { Menus } from 'webextension-polyfill-ts';
export default interface Agent {
  name: string;
  model: string;
  systemPrompt?: string;
  prompts: {
    [key in Menus.ContextType]: string;
  };
  autoSend?: boolean;
}
