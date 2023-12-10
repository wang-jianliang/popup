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

// 调用 printWords 函数，并传递一个回调函数来打印单词
const testMessage =
  'Workflow supports the combination of plugins, LLMs, code blocks, and other features through a visual interface, enabling the orchestration of complex and stable business processes, such as travel planning, report analysis.';

export async function chatCompletions(
  onMessageChunk: (text: string) => void,
  onStarted: (() => void) | null = null,
  onFinished: (() => void) | null = null,
  onError: ((err: any) => void) | null = null,
) {
  console.log('complete chat');
  onStarted();
  printWords(testMessage, onMessageChunk, onFinished);
  return;
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Accept', 'application/json');
  myHeaders.append('Authorization', 'Bearer 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');

  const raw = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: 'Who won the world series in 2020?',
      },
    ],
    temperature: 1,
    top_p: 1,
    n: 1,
    stream: true,
    max_tokens: 250,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
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
        onMessageChunk(data.choices[0].delta.content);
      } else if (choice.finish_reason === 'stop') {
        onFinished && onFinished();
      } else {
        onError && onError(choice.finish_reason);
      }
    }
  }
}
