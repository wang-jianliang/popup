import {
  Card,
  Container,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { chatCompletions } from '@src/common/chatgpt';
import { Send } from '@pages/content/ui/Icons';
import { ChatMessage } from '@pages/content/ui/types';

type Props = {
  messagesHistory?: ChatMessage[];
  maxH: string;
};

function ChatBox({ messagesHistory = [], maxH }: Props = { messagesHistory: [], maxH: '100%' }) {
  const [messagesState, setMessagesState] = useState({ messages: [], incoming: false });
  const [input, setInput] = useState('');

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

  const sendChat = () => {
    chatCompletions(
      (text: string) => {
        setMessagesState(prevState => {
          let newState: { messages: ChatMessage[]; incoming: boolean };
          if (!prevState.incoming) {
            newState = {
              messages: [...prevState.messages, { role: 'assistant', msg: text }],
              incoming: true,
            };
          } else {
            const newMessages = [...prevState.messages];
            newMessages[newMessages.length - 1].msg += text;
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
      sendChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesState]);

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => setInput(event.target.value);

  const onInputSend = () => {
    setMessagesState(prevState => ({
      messages: [...prevState.messages, { role: 'user', msg: input }],
      incoming: false,
    }));
    setInput('');
  };

  return (
    <Container>
      <VStack>
        <Container padding={1}>
          <Card padding={3}>
            <List ref={messagesEndRef} spacing={3} maxH={maxH} overflow="auto" paddingBottom={2}>
              {messagesState.messages.map((msg, index) => (
                <ListItem key={index} maxW="100%" paddingRight={3}>
                  <Card
                    width="max-content"
                    maxW="100%"
                    backgroundColor={msg.role === 'user' ? 'blue.300' : 'gray.50'}
                    color={msg.role === 'user' ? 'white' : 'black'}
                    borderRadius={12}>
                    <Text p={2} wordBreak="break-word">
                      {msg.msg}
                    </Text>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Card>
        </Container>
        <Container padding={1}>
          <InputGroup>
            <Input value={input} onChange={handleInputChange} padding={1} borderColor="gray.200" width="100%"></Input>
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
