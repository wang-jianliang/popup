import { ChatCompletionChunk, Engine } from '@src/engines/engine';
import ApiClient from '@pages/common/apiClient';
import { ChatMessage } from '@pages/content/ui/types';

interface Model {
  id: string;
  object: string;
  created: number;
  model: string;
  owner: string;
  permissions: string[];
  ready: boolean;
  latest_checkpoint: string;
  latest_checkpoint_human_readable: string;
}

// ================================================for debug==========================================================
// function printWords(sentence: string, callback: (word: string) => void, onFinished: () => void) {
//   const words = sentence.split(' ');
//   const printInterval = 1000 / 100;
//   let i = 0;
//
//   function printWord() {
//     if (i < words.length) {
//       callback(words[i]);
//       i++;
//       setTimeout(printWord, printInterval);
//     } else {
//       onFinished();
//     }
//   }
//
//   printWord();
// }
//
// const testMessage =
//   'This is a test message for testing. There are many test messages in the world, but this one is mine.';

// ===================================================================================================================
export class ChatGPT implements Engine {
  private readonly client: ApiClient;

  public constructor(APIKey: string) {
    this.client = new ApiClient({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${APIKey}`,
      },
    });

    console.log('ChatGPT engine initialized');
  }

  public async accept(modelName: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('engine not initialized');
    }
    const response = await this.client.fetch('GET', 'models');
    const json = await response.json();
    const models = json.data as Model[];
    return models.some(model => model.model === modelName);
  }

  public async complete(
    model: string,
    messages: ChatMessage[] = [],
    onMessageChunk: (text: string) => void,
    onStarted: (() => void) | null = null,
    onFinished: (() => void) | null = null,
    onError: ((err: any) => void) | null = null,
  ) {
    if (!this.client) {
      throw new Error('engine not initialized');
    }

    console.log('complete chat', messages);
    // ================================================for debug==========================================================
    // onStarted();
    // printWords(testMessage, onMessageChunk, onFinished);
    // return;
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

    const client: ApiClient = this.client;
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
}
