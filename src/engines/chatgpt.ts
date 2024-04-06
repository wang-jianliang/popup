import { Engine } from '@src/engines/engine';
import ApiClient from '@pages/common/apiClient';
import { ChatMessage } from '@pages/content/ui/types';
import { API_BASE_URL } from '@src/constants';
import { EventStreamContentType, fetchEventSource } from '@fortaine/fetch-event-source';
import { prettyObject } from '@root/utils/format';
import { getDeviceId } from '@src/utils';
import { FREE_TRAIL_LIMIT_REACHED } from '@src/errors';

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
  private readonly headers: Record<string, string>;

  public constructor(APIKey: string) {
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Device-ID': getDeviceId(),
    };
    if (APIKey) {
      this.headers['Authorization'] = `Bearer ${APIKey}`;
    }

    this.client = new ApiClient({
      baseURL: `${API_BASE_URL}/api/openai/v1`,
      headers: this.headers,
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

    const chatPayload = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: this.headers,
    };

    const chatPath = `${API_BASE_URL}/api/openai/v1/chat/completions`;
    let finished = false;

    const finish = () => {
      if (!finished) {
        finished = true;
        // onMessageChunk(responseText + remainText);
        onFinished && onFinished();
      }
    };
    await fetchEventSource(chatPath, {
      ...chatPayload,
      async onopen(res) {
        onStarted && onStarted();
        const contentType = res.headers.get('content-type');
        console.log('[OpenAI] request response content type: ', contentType);

        if (contentType?.startsWith('text/plain')) {
          const responseText = await res.clone().text();
          onMessageChunk(responseText);
          return finish();
        }

        if (!res.ok || !res.headers.get('content-type')?.startsWith(EventStreamContentType) || res.status !== 200) {
          const responseTexts = [];
          let extraInfo = await res.clone().text();
          let resJson;
          try {
            resJson = await res.clone().json();
            extraInfo = prettyObject(resJson);
          } catch {
            /* empty */
          }

          if (res.status === 401) {
            let message = 'Unauthorized';
            if (resJson && resJson.error === true && resJson.msg === FREE_TRAIL_LIMIT_REACHED) {
              message = FREE_TRAIL_LIMIT_REACHED;
            }
            onError && onError(message);
            return finish();
          }

          if (extraInfo) {
            responseTexts.push(extraInfo);
          }

          const responseText = responseTexts.join('\n\n');
          onMessageChunk(responseText);

          return finish();
        }
      },
      onmessage(msg) {
        if (msg.data === '[DONE]' || finished) {
          return finish();
        }
        const text = msg.data;
        try {
          const json = JSON.parse(text) as {
            choices: Array<{
              delta: {
                content: string;
              };
            }>;
          };
          const delta = json.choices[0]?.delta?.content;
          if (delta) {
            onMessageChunk(delta);
          }
        } catch (e) {
          console.error('[Request] parse error', text);
        }
      },
      onclose() {
        finish();
      },
      onerror(e) {
        onError && onError(e);
        throw e;
      },
      openWhenHidden: true,
    });

    // const client: ApiClient = this.client;
    // const response = await client.fetch('POST', '/chat/completions', {
    //   body: JSON.stringify(body),
    // });
    // onStarted && onStarted();
    //
    // const reader = response.body.getReader();
    // const decoder = new TextDecoder();
    // let packed: ReadableStreamReadResult<Uint8Array>;
    // while (!(packed = await reader.read()).done) {
    //   const result = decoder.decode(packed.value); // uint8array转字符串
    //   const lines = result.trim().split('\n\n'); // 拆分返回的行
    //   for (const i in lines) {
    //     const line = lines[i].substring(6); // 去掉开头的 data:
    //     if (line === '[DONE]') {
    //       // 结束
    //       break;
    //     }
    //     console.log('line', line);
    //     try {
    //
    //       const data = JSON.parse(line) as ChatCompletionChunk;
    //     const choice = data.choices[0];
    //
    //     if (choice.finish_reason == null) {
    //       onMessageChunk(choice.delta.content);
    //     } else if (choice.finish_reason === 'stop') {
    //       onFinished && onFinished();
    //     } else {
    //       onError && onError(choice.finish_reason);
    //     }
    //     } catch (e) {
    //       console.error('parse error', e);
    //       console.error('next line', lines[parseInt(i) + 1]);
    //     }
    //   }
    // }
  }
}
