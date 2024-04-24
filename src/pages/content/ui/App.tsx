import ChatBox, { ChatBoxHandles } from '@pages/components/ChatBox';
import { Button, Card, CardBody, CloseButton, Flex, IconButton, Spacer, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { Menus } from 'webextension-polyfill-ts';
import Agent, { getPrompt, getSystemPrompt } from '@src/agent/agent';
import { SettingsIcon } from '@chakra-ui/icons';
import { createNewSession } from '@pages/content/storageUtils';
import OnClickData = Menus.OnClickData;

interface Props {
  agent?: Agent;
  info?: OnClickData;
  onClose?: (() => void) | null;
}

export default function App(props: Props) {
  const { agent, info, onClose } = props;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(null);
  const [inputType, setInputType] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(null);
  const [sessionId, setSessionId] = useState(-1);

  const chatBoxRef = useRef<ChatBoxHandles | null>(null);

  useEffect(() => {
    if (!agent || !info) {
      return;
    }
    console.log('use agent', agent, 'info', info);

    let prompt: string = '';
    if (info.selectionText) {
      prompt = getPrompt(agent, 'selection').replace('${selection}', info.selectionText);
      const textSystemPrompt = getSystemPrompt(agent, 'selection');
      setInputType('selection');
      setSystemPrompt(textSystemPrompt);
    } else if (info.mediaType == 'image') {
      prompt = getPrompt(agent, 'image');
      const imageSystemPrompt = getSystemPrompt(agent, 'image');
      setInputType('image');
      setSystemPrompt(imageSystemPrompt);
    } else {
      setInputType('default');
      setSystemPrompt(getSystemPrompt(agent, 'default'));
    }

    if (prompt.length > 0) {
      if (agent.autoSend) {
        setMessages(() => {
          const userMessage = { role: 'user', content: prompt };
          return [userMessage];
        });
      } else {
        console.log('set input', prompt);
        setInput(prompt);
      }
    }
    createNewSession(prompt, agent).then(id => setSessionId(id));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, info]);

  const bgColor = useColorModeValue('white', 'gray.700');
  const color = useColorModeValue('gray.700', 'white');

  return (
    <Card bg={bgColor} color={color} lineHeight={5} maxW="100%" maxWidth="600px" zIndex={10000}>
      <Flex p={2}>
        <Button size="sm" p={2}>
          {agent.name}
        </Button>
        <IconButton
          aria-label="Open settings"
          size="sm"
          icon={<SettingsIcon />}
          marginLeft={2}
          onClick={() => {
            // Clear messages before showing settings
            chatBoxRef.current?.showSettings(true);
            setMessages([]);
          }}
        />
        <Spacer />
        <CloseButton p={2} size="md" onClick={onClose} />
      </Flex>
      <CardBody padding="2">
        {sessionId > 0 && inputType && (
          <ChatBox
            ref={chatBoxRef}
            preInput={input}
            inputType={inputType}
            systemPrompt={systemPrompt}
            sessionId={sessionId}
            newMessages={messages}
            minW="400px"
            maxH="300px"
          />
        )}
      </CardBody>
    </Card>
  );
}

App.defaultProps = {
  position: { x: 0, y: 0 },
  onClose: null,
};
