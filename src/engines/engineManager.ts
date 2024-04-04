// A singleton class that manages all the engines
import { Engine, EngineType } from '@src/engines/engine';
import { ChatGPT } from '@src/engines/chatgpt';
import EngineSettings from '@src/engines/engineSettings';

export const getEngine = (engineType: EngineType, settings: EngineSettings): Engine => {
  switch (engineType) {
    default:
      throw new Error(`Unknown engine: ${engineType}`);
    case EngineType.ChatGPT:
      if (!settings || !settings.apiKey) {
        throw new Error('API key is required for ChatGPT engine');
      }
      return new ChatGPT(settings.apiKey);
  }
};
