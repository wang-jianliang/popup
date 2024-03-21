import ChatBox from '@pages/components/ChatBox';
import {
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Flex,
  IconButton,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { GLOBAL_CONFIG_KEY_ENGINE_SETTINGS } from '@src/constants';
import { Menus } from 'webextension-polyfill-ts';
import Agent from '@src/agent/agent';
import { ArrowBackIcon, SettingsIcon } from '@chakra-ui/icons';
import { createNewSession, getGlobalConfig } from '@pages/content/storageUtils';
import EngineSettings from '@src/engines/engineSettings';
import Settings from '@pages/content/Settings/Settings';
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
  const [settings, setSettings] = useState<EngineSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [sessionId, setSessionId] = useState(-1);

  useEffect(() => {
    let prompt: string;
    if (info.selectionText) {
      prompt = agent.prompts.selection.replace('${selection}', info.selectionText);
    } else if (info.mediaType == 'image') {
      prompt = agent.prompts.image;
    } else {
      alert(`Unsupported media type: ${info.mediaType}`);
      return;
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

      createNewSession(prompt, agent).then(id => setSessionId(id));
    } else {
      alert('Prompt is empty');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgColor = useColorModeValue('white', 'gray.700');
  const color = useColorModeValue('gray.700', 'white');

  const loadSettings = () => {
    getGlobalConfig(GLOBAL_CONFIG_KEY_ENGINE_SETTINGS).then((settings: EngineSettings) => {
      console.log('load settings', settings);
      if (!settings) {
        setShowSettings(true);
        return;
      }
      setSettings(settings);
      setShowSettings(false);
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <Card bg={bgColor} color={color} lineHeight={5} maxW="100%" maxWidth="600px" zIndex={10000}>
      {!showSettings ? (
        <Flex p={2}>
          {settings?.apiKey && <Button p={2}>{agent.name}</Button>}
          <IconButton
            aria-label="Open settings"
            icon={<SettingsIcon />}
            marginLeft={2}
            onClick={() => {
              // Clear messages before showing settings
              setMessages([]);
              setShowSettings(true);
            }}
          />
          <Spacer />
          <CloseButton p={2} size="md" onClick={onClose} />
        </Flex>
      ) : (
        <Flex p={2}>
          <div />
          <IconButton
            aria-label="Back"
            variant="outline"
            icon={<ArrowBackIcon />}
            onClick={() => {
              loadSettings();
              setShowSettings(false);
            }}
          />
          <Spacer />
          <CloseButton p={2} size="md" onClick={onClose} />
        </Flex>
      )}
      {showSettings ? (
        <Box width="600px">
          <Settings />
        </Box>
      ) : (
        <CardBody padding="2">
          {sessionId > 0 && (
            <ChatBox
              settings={settings}
              preInput={input}
              systemPrompt={agent.systemPrompt}
              sessionId={sessionId}
              newMessages={messages}
              minW="400px"
              maxH="300px"
            />
          )}
        </CardBody>
      )}
    </Card>
  );
}

App.defaultProps = {
  position: { x: 0, y: 0 },
  onClose: null,
};
