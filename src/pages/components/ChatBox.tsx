import {
  AbsoluteCenter,
  Box,
  Card,
  Container,
  Divider,
  Flex,
  IconButton,
  List,
  ListItem,
  Textarea,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { KeyboardEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { Clear, Send } from '@pages/content/ui/Icons';
import { ChatMessage } from '@pages/content/ui/types';
import autosize from 'autosize';
import MarkdownSyntaxHighlight from '@pages/components/Markdown';
import { getMessages, storeNewMessages } from '@pages/content/storageUtils';
import { getEngine } from '@src/engines/engineManager';
import EngineSettings from '@src/engines/engineSettings';
import { EngineType } from '@src/engines/engine';

type Props = {
  engineType: EngineType | null;
  model: string | null;
  settings: EngineSettings | null;
  preInput?: string;
  sessionId: number;
  systemPrompt?: string;
  newMessages?: ChatMessage[];
  onClearMessages?: (messages: ChatMessage[]) => void;
  minW?: string;
  maxH?: string;
};

function ChatBox(
  {
    engineType,
    model,
    settings,
    preInput,
    sessionId,
    systemPrompt,
    newMessages,
    onClearMessages,
    minW,
    maxH,
  }: Props = {
    engineType: null,
    model: null,
    settings: null,
    preInput: null,
    sessionId: -1,
    newMessages: [],
    minW: 'min-content',
    maxH: '100%',
  },
) {
  const [messagesState, setMessagesState] = useState({ messages: [] });
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
          };
        });
        // 2. add new messages to store and state
        newMessages.length > 0 && addMessages(newMessages);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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

  const sendChat = async (messages: ChatMessage[]) => {
    let newMessages = [...messages];
    // find the last empty message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role == null) {
        newMessages = messages.slice(i + 1);
        break;
      }
    }

    // override model in settings
    const engine = getEngine(engineType, settings);

    await engine.complete(
      model,
      systemPrompt ? [{ role: 'system', content: systemPrompt }, ...newMessages] : newMessages,
      (text: string) => {
        setIncomingMessage((prev: string) => prev + text);
        scrollToAnchor();
      },
      () => {
        setIncomingMessage('');
        console.log('completion started');
      },
      () => {
        setIncomingMessage((prev: string) => {
          addMessages([{ role: 'assistant', content: prev }]);
          return null;
        });
        scrollToAnchor();
        console.log('completion finished');
      },
      err => alert(err),
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
  const bg = useColorModeValue('white', 'gray.700');

  return (
    <Flex padding={0.5} h="100%">
      <VStack minW="100%">
        <Box padding={1} h="100%" w="100%">
          <Box borderRadius="lg" h="100%" w="100%" padding={3} boxShadow="inset 0 0 1px #A0AEC0">
            <List ref={messagesEndRef} spacing={3} minW={minW} maxH={maxH} overflow="auto" paddingBottom={2}>
              {messagesState.messages
                .filter(msg => msg.role != 'system')
                .map((msg, index) => (
                  <ListItem key={index} maxW="100%" paddingRight={3}>
                    {msg.role == null ? (
                      <Box position="relative" padding="10">
                        <Divider color="gray.300" />
                        <AbsoluteCenter bg={bg} color="gray.300" px={4}>
                          New Conversation
                        </AbsoluteCenter>
                      </Box>
                    ) : (
                      <Card
                        width="max-content"
                        maxW="100%"
                        backgroundColor={msg.role === 'user' ? userMessageBg : botMessageBg}
                        color={msg.role === 'user' ? userColor : botColor}
                        p={2}
                        borderRadius={12}>
                        <MarkdownSyntaxHighlight markdown={msg.content}></MarkdownSyntaxHighlight>
                      </Card>
                    )}
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
          </Box>
        </Box>
        <Container padding={1} maxW="100%">
          <Flex position="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              minH="max-content"
              padding={2}
              paddingRight={20}
              borderColor="gray.200"
              width="100%"
            />
            <Flex direction="row" position="absolute" bottom={1} right={1}>
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
    </Flex>
  );
}

export default ChatBox;
