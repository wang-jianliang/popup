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
import Settings from '@pages/components/Settings';
import { defaultModel, storageSyncKey_APIKey, storageSyncKey_Model } from '@src/constants';
import { browser, Menus } from 'webextension-polyfill-ts';
import Agent from '@pages/agent/agent';
import OnClickData = Menus.OnClickData;
import { SettingsIcon } from '@chakra-ui/icons';
import { createNewSession } from '@pages/storage/chat';

interface Props {
  agent?: Agent;
  info?: OnClickData;
  onClose?: (() => void) | null;
}

export default function App(props: Props) {
  const { agent, info, onClose } = props;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(null);
  const [apiKey, setAPIKey] = useState(null);
  const [model, setModel] = useState(defaultModel);
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

      createNewSession(prompt).then(id => setSessionId(id));
    } else {
      alert('Prompt is empty');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bgColor = useColorModeValue('white', 'gray.700');
  const color = useColorModeValue('gray.700', 'white');
  console.log('page updated', apiKey);

  useEffect(() => {
    browser.storage.sync.get([storageSyncKey_APIKey, storageSyncKey_Model]).then(result => {
      const apiKey = result[storageSyncKey_APIKey];
      apiKey && setAPIKey(result[storageSyncKey_APIKey]);
      result[storageSyncKey_Model] && setModel(result[storageSyncKey_Model]);
    });
  }, []);

  return (
    <Card bg={bgColor} color={color} lineHeight={5} maxW="100%">
      <Flex p={2}>
        {apiKey && <Button p={2}>{model}</Button>}
        <IconButton
          aria-label="Open settings"
          icon={<SettingsIcon />}
          marginLeft={2}
          onClick={() => setShowSettings(true)}
        />
        <Spacer />
        <CloseButton p={2} size="md" onClick={onClose} />
      </Flex>
      {apiKey == null || showSettings ? (
        <Box width="500px">
          <Settings
            onSaved={values => {
              console.log('on settings saved: ', values);
              setShowSettings(false);
              setAPIKey(values.apiKey);
              setModel(values.model);
            }}
          />
        </Box>
      ) : (
        <CardBody padding="2">
          {sessionId > 0 && (
            <ChatBox
              APIKey={apiKey}
              model={model}
              preInput={input}
              systemPrompt={agent.systemPrompt}
              sessionId={sessionId}
              newMessages={messages}
              minW="400px"
              maxH="600px"
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
