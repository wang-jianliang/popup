import ChatBox, { ChatBoxHandles } from '@pages/components/ChatBox';
import { Button, Card, CardBody, CloseButton, Flex, IconButton, Spacer, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { getPrompt, getSystemPrompt } from '@src/agent/agent';
import { SettingsIcon } from '@chakra-ui/icons';
import { createNewSession } from '@pages/content/storageUtils';
import { BrowserMessage, UserEventType } from '@src/types';
import { MESSAGE_TYPE_MENU_CLICKED } from '@src/constants';
import { getClientX, getClientY, getLanguageName } from '@src/utils';

let lastMouseEvent: UserEventType | undefined;

const mouseUpHandler = async (event: UserEventType) => {
  console.log('[content.js]. mouse up event:', event);
  lastMouseEvent = event;
};

const mouseDownHandler = async (event: UserEventType) => {
  console.log('[content.js]. mouse down event:', event);
  lastMouseEvent = event;
};

document.addEventListener('mouseup', mouseUpHandler);
document.addEventListener('touchend', mouseUpHandler);
document.addEventListener('mousedown', mouseDownHandler);

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState('');

  const [input, setInput] = useState(null);
  const [inputType, setInputType] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(null);
  const [sessionId, setSessionId] = useState(-1);

  const chatBoxRef = useRef<ChatBoxHandles | null>(null);
  // Function called when a new message is received
  const messagesFromContextMenu = async (msg: BrowserMessage) => {
    console.log('[content.js]. Message received', msg);

    if (msg.type === MESSAGE_TYPE_MENU_CLICKED) {
      console.log(`menu ${msg} is clicked`);
      const root = document.createElement('div');
      document.body.appendChild(root);
      const x = lastMouseEvent ? getClientX(lastMouseEvent) : 0;
      const y = lastMouseEvent ? getClientY(lastMouseEvent) : 0;
      setPosition({ x, y });

      const info = msg.info;
      const agent = msg.agent;
      setTitle(agent.name);

      let prompt: string = '';
      let chatTitle = agent.name;
      if (info.selectionText) {
        prompt = getPrompt(agent, 'selection').replace('${selection}', info.selectionText);
        const textSystemPrompt = getSystemPrompt(agent, 'selection');
        chatTitle = `${chatTitle} - ${info.selectionText}`;
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
        // replace "${language}" with the current language
        prompt = prompt.replace('${language}', getLanguageName());
        console.log('prompt', prompt);
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
      createNewSession(chatTitle, agent).then(id => setSessionId(id));
    }
  };

  /**
   * Fired when a message is sent from either an extension process or a content script.
   */
  // this listener should only be added once
  useEffect(() => {
    // This code will run only once after the first render
    browser.runtime.onMessage.addListener(messagesFromContextMenu);
    console.log('[content.js]. App mounted');

    // Cleanup function
    return () => {
      browser.runtime.onMessage.removeListener(messagesFromContextMenu);
    };
  }, []); // Empty array means this effect will run only once
  const onClose = () => {
    // clear all states
    setSessionId(-1);
    setMessages([]);
    setTitle('');
    setInput(null);
    setInputType(null);
    setSystemPrompt(null);
    setPosition({ x: 0, y: 0 });
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const color = useColorModeValue('gray.700', 'white');

  return sessionId > 0 ? (
    <Card
      bg={bgColor}
      color={color}
      lineHeight={5}
      maxW="100%"
      maxWidth="600px"
      zIndex={10000}
      position="fixed"
      top={position.y}
      left={position.x}
      boxShadow="md">
      <Flex p={2}>
        <Button size="sm" p={2}>
          {title}
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
  ) : null;
}

App.defaultProps = {
  position: { x: 0, y: 0 },
  onClose: null,
};
