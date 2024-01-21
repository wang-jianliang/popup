import React, { useEffect, useState } from 'react';
import '@pages/sidepanel/SidePanel.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Box, Grid, GridItem, List, ListItem } from '@chakra-ui/react';
import { ChatSession, getSessions } from '@pages/storage/chat';
import ChatBox from '@pages/components/ChatBox';
import EngineSettings from '@src/engines/engineSettings';
import { browser } from 'webextension-polyfill-ts';
import { storageSyncKey_Settings } from '@src/constants';

const SidePanel = () => {
  const [sessions, setSessions] = useState<Map<number, ChatSession>>(new Map<number, ChatSession>());
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [settings, setSettings] = useState<EngineSettings | null>(null);

  useEffect(() => {
    browser.storage.sync.get([storageSyncKey_Settings]).then(result => {
      const settings: EngineSettings = result[storageSyncKey_Settings];
      setSettings(settings);
    });
  }, []);

  useEffect(() => {
    getSessions(100).then(sessions => {
      console.log('sessions', sessions);
      if (sessions.size > 0) {
        setSessions(sessions);
        setCurrentSessionId(sessions.keys().next().value);
      }
    });
  }, []);

  return (
    <Grid
      templateAreas={`"nav header"
                  "nav main"`}
      gridTemplateRows={'30px 1fr'}
      gridTemplateColumns={'30% 68%'}
      h="100vh"
      gap="0.5"
      color="blackAlpha.700"
      fontWeight="bold">
      <GridItem pl="2" area={'header'}>
        {currentSessionId && sessions[currentSessionId]?.title}
      </GridItem>
      <GridItem area={'nav'} bgColor="gray.50">
        <List spacing={3} padding={2}>
          {Array.from(sessions).map(([id, session]) => {
            return (
              <ListItem key={id} width="100%">
                <Box
                  p={2}
                  borderWidth="1px"
                  borderRadius="lg"
                  bgColor="white"
                  borderColor={currentSessionId === id ? 'blue.500' : 'gray.200'}
                  onClick={() => {
                    setCurrentSessionId(id);
                  }}>
                  <Box w="100%" fontSize="small" whiteSpace="normal">
                    {session.title}
                  </Box>
                  <Box as="span" color="gray.400" fontSize="xsm">
                    {session.messageIds.length} messages
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </GridItem>
      <GridItem pl="2" area={'main'}>
        {currentSessionId && (
          <ChatBox
            engineType={sessions[currentSessionId]?.agent.engine}
            model={sessions[currentSessionId]?.agent.model}
            settings={settings}
            sessionId={currentSessionId}
          />
        )}
      </GridItem>
    </Grid>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
