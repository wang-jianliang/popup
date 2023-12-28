export default interface EngineSettings {
  apiKey: string;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  stop: string[];
}
