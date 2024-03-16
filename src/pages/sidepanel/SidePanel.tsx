import React, { useEffect, useState } from 'react';
import '@pages/sidepanel/SidePanel.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Box, Button, Center, Divider, Grid, GridItem, Text } from '@chakra-ui/react';
import { ChatSession, deleteSession, getSessions } from '@pages/storage/chat';
import ChatBox from '@pages/components/ChatBox';
import EngineSettings from '@src/engines/engineSettings';
import { globalConfigKey_CurrentSessionId, getGlobalConfig, saveGlobalConfig } from '@pages/storage/global';
import { SessionList } from '@pages/sidepanel/SessionList';
import { GLOBAL_CONFIG_KEY_ENGINE_SETTINGS } from '@src/constants';

const SidePanel = () => {
  const [sessions, setSessions] = useState<Map<number, ChatSession>>(new Map<number, ChatSession>());
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [settings, setSettings] = useState<EngineSettings | null>(null);

  useEffect(() => {
    getGlobalConfig(GLOBAL_CONFIG_KEY_ENGINE_SETTINGS).then((settings: EngineSettings) => {
      setSettings(settings);
    });
  }, []);

  useEffect(() => {
    getSessions(100).then(sessions => {
      console.log('sessions', sessions);
      if (sessions.size > 0) {
        setSessions(sessions);
        getGlobalConfig(globalConfigKey_CurrentSessionId).then(id => {
          setCurrentSessionId(id || sessions.keys().next().value);
        });
      }
    });
  }, []);

  console.log('sessions', sessions);
  console.log('currentSessionId', currentSessionId);

  return (
    <Grid
      templateAreas={`"nav header"
                  "nav main"`}
      gridTemplateRows={'0px 1fr'}
      gridTemplateColumns={'30% 68%'}
      h="100vh"
      gap="0.5"
      color="blackAlpha.700"
      fontWeight="bold">
      <GridItem pl="2" area={'header'}>
        {currentSessionId && sessions[currentSessionId]?.title}
      </GridItem>
      <GridItem area={'nav'} bgColor="gray.50">
        <Box p={2}>
          <Button width="100%">New Chat</Button>
        </Box>
        <Divider />
        {sessions.size == 0 && (
          <Center>
            <Text>No conversations</Text>
          </Center>
        )}
        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionChanged={async (id: number) => {
            setCurrentSessionId(id);
            await saveGlobalConfig(globalConfigKey_CurrentSessionId, id);
          }}
          onSessionClosed={(id: number) => {
            if (currentSessionId === id) {
              setCurrentSessionId(null);
            }
            setSessions(prev => {
              deleteSession(id).catch(err => {
                console.error(err);
              });
              const newSessions = new Map(prev);
              newSessions.delete(id);
              return newSessions;
            });
          }}
        />
      </GridItem>
      <GridItem pl="2" area={'main'}>
        {currentSessionId && <ChatBox settings={settings} sessionId={currentSessionId} />}
      </GridItem>
    </Grid>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
