import { ChatMessage } from '@pages/content/ui/types';
import ApiClient from '@pages/common/apiClient';

interface Choice {
  index: number;
  delta: {
    content: string;
  };
  finish_reason?: any;
}

interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint?: any;
  choices: Choice[];
}

export class APIKeyError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function printWords(sentence: string, callback: (word: string) => void, onFinished: () => void) {
  const words = sentence.split(' ');
  const printInterval = 1000 / 100;
  let i = 0;

  function printWord() {
    if (i < words.length) {
      callback(words[i]);
      i++;
      setTimeout(printWord, printInterval);
    } else {
      onFinished();
    }
  }

  printWord();
}

const testMessage =
  'fa fafdasfe dfS FR3 ESFS F 23SFFFSFsFR2  FS AFAEFSA FSF SDFEFAEDF FER3FEWFDAFEW  EFE DSA FEQD FEAF';

const getAPIClient = async (APIKey: string) => {
  return new ApiClient({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${APIKey}`,
    },
  });
};

export async function fetchModels(APIKey: string) {
  // ================================================for debug==========================================================
  console.log('fetching models, apiKey:', APIKey);
  return ['model1', 'model2', 'gpt-3.5-turbo'];
  // ===================================================================================================================

  const client = await getAPIClient(APIKey);
  const response = await client.fetch('GET', 'models');
  const json = await response.json();
  return json.data;
}

export async function chatCompletions(
  APIKey: string,
  model: string,
  messages: ChatMessage[] = [],
  onMessageChunk: (text: string) => void,
  onStarted: (() => void) | null = null,
  onFinished: (() => void) | null = null,
  onError: ((err: any) => void) | null = null,
) {
  console.log('complete chat', messages);

  // ================================================for debug==========================================================
  onStarted();
  printWords('aaa' + '\n' + testMessage, onMessageChunk, onFinished);
  return;
  // ===================================================================================================================

  const body = {
    model: model,
    messages: messages,
    temperature: 1,
    top_p: 1,
    n: 1,
    stream: true,
    max_tokens: 1024,
    presence_penalty: 0,
    frequency_penalty: 0,
  };

  const client: ApiClient = await getAPIClient(APIKey);
  const response = await client.fetch('POST', '/chat/completions', {
    body: JSON.stringify(body),
  });
  onStarted && onStarted();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let packed: ReadableStreamReadResult<Uint8Array>;
  while (!(packed = await reader.read()).done) {
    const result = decoder.decode(packed.value); // uint8array转字符串
    const lines = result.trim().split('\n\n'); // 拆分返回的行
    for (const i in lines) {
      const line = lines[i].substring(6); // 去掉开头的 data:
      if (line === '[DONE]') {
        // 结束
        break;
      }
      const data = JSON.parse(line) as ChatCompletionChunk;
      const choice = data.choices[0];

      if (choice.finish_reason == null) {
        onMessageChunk(choice.delta.content);
      } else if (choice.finish_reason === 'stop') {
        onFinished && onFinished();
      } else {
        onError && onError(choice.finish_reason);
      }
    }
  }
}
