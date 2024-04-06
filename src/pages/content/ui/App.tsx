import ChatBox from '@pages/components/ChatBox';
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  CloseButton,
  Flex,
  IconButton,
  Spacer,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { GLOBAL_CONFIG_KEY_ENGINE_SETTINGS } from '@src/constants';
import { Menus } from 'webextension-polyfill-ts';
import Agent, { getPrompt, getSystemPrompt } from '@src/agent/agent';
import { ArrowBackIcon, SettingsIcon } from '@chakra-ui/icons';
import { createNewSession, getGlobalConfig } from '@pages/content/storageUtils';
import EngineSettings from '@src/engines/engineSettings';
import Settings from '@pages/content/Settings/Settings';
import OnClickData = Menus.OnClickData;
import apiClient from '@src/shared/apiService';

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
  const [settings, setSettings] = useState<EngineSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [sessionId, setSessionId] = useState(-1);
  const [trailRemaining, setTrailRemaining] = useState(1);

  useEffect(() => {
    if (!agent || !info) {
      return;
    }
    console.log('use agent', agent, 'info', info);

    let prompt: string;
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
  }, [agent, info]);

  const bgColor = useColorModeValue('white', 'gray.700');
  const color = useColorModeValue('gray.700', 'white');

  const loadSettings = () => {
    getGlobalConfig(GLOBAL_CONFIG_KEY_ENGINE_SETTINGS).then((settings: EngineSettings) => {
      console.log('load settings', settings);
      if (!settings && trailRemaining <= 0) {
        setShowSettings(true);
        return;
      }
      setSettings(settings);
      setShowSettings(false);
    });
  };

  useEffect(() => {
    apiClient.fetch('GET', '/trail').then(async response => {
      const trail = await response.json();
      setTrailRemaining(trail.remaining);
    });
  }, []);

  useEffect(() => {
    if (trailRemaining <= 0) {
      loadSettings();
    }
  }, [trailRemaining]);

  return (
    <Card bg={bgColor} color={color} lineHeight={5} maxW="100%" maxWidth="600px" zIndex={10000}>
      {!showSettings ? (
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
              setMessages([]);
              setShowSettings(true);
            }}
          />
          {!settings || !settings.apiKey ? (
            <Center>
              <Text marginLeft={2}>free trials: {trailRemaining}</Text>
            </Center>
          ) : null}
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
          {sessionId > 0 && inputType && (
            <ChatBox
              settings={settings}
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
      )}
    </Card>
  );
}

App.defaultProps = {
  position: { x: 0, y: 0 },
  onClose: null,
};
