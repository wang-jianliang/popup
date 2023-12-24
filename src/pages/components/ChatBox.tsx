import {
  Card,
  Container,
  Flex,
  IconButton,
  List,
  ListItem,
  Textarea,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { KeyboardEvent, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { chatCompletions } from '@pages/common/chatgpt';
import { Clear, Send } from '@pages/content/ui/Icons';
import { ChatMessage } from '@pages/content/ui/types';
import autosize from 'autosize';
import MarkdownSyntaxHighlight from '@pages/components/Markdown';
import { getMessages, storeNewMessages } from '@pages/storage/chat';

type Props = {
  APIKey: string | null;
  model: string | null;
  preInput?: string;
  sessionId: number;
  systemPrompt?: string;
  newMessages?: ChatMessage[];
  onClearMessages?: (messages: ChatMessage[]) => void;
  minW?: string;
  maxH?: string;
};

function ChatBox(
  { APIKey, model, preInput, sessionId, systemPrompt, newMessages, onClearMessages, minW, maxH }: Props = {
    APIKey: null,
    model: null,
    preInput: null,
    sessionId: -1,
    newMessages: [],
    minW: 'min-content',
    maxH: '100%',
  },
) {
  const [messagesState, setMessagesState] = useState({ messages: [], incoming: false });
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [input, setInput] = useState(preInput);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToAnchor = () => {
    messagesEndRef.current?.scrollBy({ top: messagesEndRef.current.scrollHeight });
  };

  // load messages from storage
  useEffect(() => {
    console.log('session id:', sessionId);
    if (sessionId >= 0) {
      getMessages(sessionId).then(messages => {
        // 1. load message history to state
        setMessagesState(() => {
          return {
            messages: messages,
            incoming: false,
          };
        });
        // 2. add new messages to store and state
        newMessages.length > 0 && addMessages(newMessages);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // move cursor to the end
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [preInput]);

  const clearMessages = async () => {
    onClearMessages && onClearMessages(messagesState.messages);

    // insert an empty message to mark the ending
    const emptyMessage: ChatMessage = { role: null, content: '' };
    addMessages([emptyMessage]);
  };

  const messageStateRef: MutableRefObject<{ messages: ChatMessage[]; incoming: boolean }> = useRef();
  messageStateRef.current = messagesState;
  const sendChat = async (messages: ChatMessage[]) => {
    const newMessages = [...messages];
    // iterate messages until got an empty one
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role == null) {
        break;
      }
      newMessages.unshift(message);
    }

    console.log('completion:', messageStateRef.current);

    await chatCompletions(
      APIKey,
      model,

      systemPrompt ? [{ role: 'system', content: systemPrompt }, ...newMessages] : newMessages,
      (text: string) => {
        setIncomingMessage((prev: string) => prev + text);
        scrollToAnchor();
      },
      () => {
        setIncomingMessage('');
        console.log('completion started:', messageStateRef.current);
      },
      () => {
        setIncomingMessage((prev: string) => {
          addMessages([{ role: 'assistant', content: prev }]);
          return null;
        });
        scrollToAnchor();
        console.log('completion finished:', messageStateRef.current);
      },
    );
  };

  useEffect(() => {
    console.log('messages state changed:', messagesState);
    textareaRef.current && textareaRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesState]);

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => setInput(event.target.value);

  const addMessages = (messages: ChatMessage[]) => {
    console.log('add message:', messages);
    storeNewMessages(sessionId, messages).then(async () => {
      setMessagesState(prevState => {
        const newMessages = [...prevState.messages, ...messages];
        if (messages[messages.length - 1].role === 'user') {
          sendChat(newMessages).catch(err => alert(err));
        }
        return {
          messages: newMessages,
          incoming: false,
        };
      });
    });
  };

  const onInputSend = () => {
    addMessages([{ role: 'user', content: input }]);
    setInput('');
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    console.log('handle key event:', event);
    switch (event.key) {
      case 'Enter':
        if (event.ctrlKey) {
          onInputSend();
        }
    }
  };

  useEffect(() => {
    autosize(textareaRef.current);
    return () => {
      autosize.destroy(textareaRef.current);
    };
  }, []);

  const botMessageBg = useColorModeValue('#f6f7f9', 'gray.600');
  const userMessageBg = useColorModeValue('#4ed1a2', 'gray.500');
  const userColor = useColorModeValue('black', 'white');
  const botColor = useColorModeValue('black', 'white');

  return (
    <Container padding={0.5}>
      <VStack>
        <Container padding={1}>
          <Card padding={3} boxShadow="inset 0 0 1px #A0AEC0">
            <List ref={messagesEndRef} spacing={3} minW={minW} maxH={maxH} overflow="auto" paddingBottom={2}>
              {messagesState.messages
                .filter(msg => msg.role != 'system')
                .map((msg, index) => (
                  <ListItem key={index} maxW="100%" paddingRight={3}>
                    <Card
                      width="max-content"
                      maxW="100%"
                      backgroundColor={msg.role === 'user' ? userMessageBg : botMessageBg}
                      color={msg.role === 'user' ? userColor : botColor}
                      p={2}
                      borderRadius={12}>
                      <MarkdownSyntaxHighlight markdown={msg.content}></MarkdownSyntaxHighlight>
                    </Card>
                  </ListItem>
                ))}
              {incomingMessage && (
                <ListItem key={messagesState.messages.length} maxW="100%" paddingRight={3}>
                  <Card
                    width="max-content"
                    maxW="100%"
                    backgroundColor={botMessageBg}
                    color={botColor}
                    p={2}
                    borderRadius={12}>
                    <MarkdownSyntaxHighlight markdown={incomingMessage}></MarkdownSyntaxHighlight>
                  </Card>
                </ListItem>
              )}
            </List>
          </Card>
        </Container>
        <Container padding={1}>
          <Flex position="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              minH="max-content"
              padding={2}
              borderColor="gray.200"
              width="100%"
            />
            <Flex>
              <IconButton
                onClick={clearMessages}
                size="sm"
                mr={2}
                aria-label="Clear messages"
                icon={<Clear />}
                zIndex={1}
              />
              <IconButton onClick={onInputSend} size="sm" aria-label="Send messages" icon={<Send />} zIndex={1} />
            </Flex>
          </Flex>
        </Container>
      </VStack>
    </Container>
  );
}

export default ChatBox;
