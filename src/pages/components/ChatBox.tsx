import {
  Card,
  Container,
  IconButton,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  Textarea,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { chatCompletions } from '@pages/common/chatgpt';
import { Send } from '@pages/content/ui/Icons';
import { ChatMessage } from '@pages/content/ui/types';
import autosize from 'autosize';
import MarkdownSyntaxHighlight from '@pages/components/Markdown';

type Props = {
  APIKey: string | null;
  model: string | null;
  preInput?: string;
  messagesHistory?: ChatMessage[];
  maxH: string;
};

function ChatBox(
  { APIKey, model, preInput, messagesHistory = [], maxH }: Props = {
    APIKey: null,
    model: null,
    preInput: null,
    messagesHistory: [],
    maxH: '100%',
  },
) {
  const [messagesState, setMessagesState] = useState({ messages: [], incoming: false });
  const [input, setInput] = useState(preInput);

  const messagesEndRef = useRef(null);

  const scrollToAnchor = () => {
    messagesEndRef.current?.scrollBy({ top: messagesEndRef.current.scrollHeight });
  };

  useEffect(() => {
    setMessagesState(prevState => ({
      ...prevState,
      messages: messagesHistory,
    }));
  }, [messagesHistory]);

  const sendChat = async () => {
    await chatCompletions(
      APIKey,
      model,
      messagesState.messages,
      (text: string) => {
        setMessagesState(prevState => {
          let newState: { messages: ChatMessage[]; incoming: boolean };
          if (!prevState.incoming) {
            newState = {
              messages: [...prevState.messages, { role: 'assistant', content: text }],
              incoming: true,
            };
          } else {
            const newMessages = [...prevState.messages];
            newMessages[newMessages.length - 1].content += text;
            newState = {
              ...prevState,
              messages: newMessages,
            };
          }
          console.log('new message', newState);
          scrollToAnchor();
          return newState;
        });
      },
      () => {
        console.log('completion started');
      },
      () => {
        console.log('completion finished');
        // add a new message for next message
        setMessagesState(prevState => ({ ...prevState, incoming: false }));
      },
    );
  };

  useEffect(() => {
    if (
      messagesState.messages.length > 0 &&
      messagesState.messages[messagesState.messages.length - 1].role === 'user' &&
      !messagesState.incoming
    ) {
      sendChat().catch(err => alert(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesState]);

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => setInput(event.target.value);

  const onInputSend = () => {
    setMessagesState(prevState => ({
      messages: [...prevState.messages, { role: 'user', content: input }],
      incoming: false,
    }));
    setInput('');
  };

  const textareaRef = useRef();
  useEffect(() => {
    autosize(textareaRef.current);
    return () => {
      autosize.destroy(textareaRef.current);
    };
  }, []);

  const botMessageBg = useColorModeValue('#4ed1a2', 'gray.600');
  const userMessageBg = useColorModeValue('#f6f7f9', 'gray.500');

  return (
    <Container padding={0.5}>
      <VStack>
        <Container padding={1}>
          <Card padding={3} boxShadow="inset 0 0 1px #A0AEC0">
            <List ref={messagesEndRef} spacing={3} maxH={maxH} overflow="auto" paddingBottom={2}>
              {messagesState.messages.map((msg, index) => (
                <ListItem key={index} maxW="100%" paddingRight={3}>
                  <Card
                    width="max-content"
                    maxW="100%"
                    backgroundColor={msg.role === 'user' ? botMessageBg : userMessageBg}
                    color={msg.role === 'user' ? 'white' : 'black'}
                    p={2}
                    borderRadius={12}>
                    <MarkdownSyntaxHighlight markdown={msg.content}></MarkdownSyntaxHighlight>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Card>
        </Container>
        <Container padding={1}>
          <InputGroup>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              minH="max-content"
              padding={2}
              borderColor="gray.200"
              width="100%"
            />
            <InputRightElement>
              <IconButton onClick={onInputSend} size="sm" aria-label="Send message" icon={<Send />} />
            </InputRightElement>
          </InputGroup>
        </Container>
      </VStack>
    </Container>
  );
}

export default ChatBox;
