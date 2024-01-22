import React, { useEffect, useState } from 'react';
import '@pages/sidepanel/SidePanel.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Box, Button, Center, Divider, Grid, GridItem, List, ListItem, Text } from '@chakra-ui/react';
import { ChatSession, getSessions } from '@pages/storage/chat';
import ChatBox from '@pages/components/ChatBox';
import EngineSettings from '@src/engines/engineSettings';
import { browser } from 'webextension-polyfill-ts';
import { storageSyncKey_Settings } from '@src/constants';
import { globalConfigKey_CurrentSessionId, loadGlobalConfig, saveGlobalConfig } from '@pages/storage/global';

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
        loadGlobalConfig(globalConfigKey_CurrentSessionId).then(id => {
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
        {/*<Box>*/}
        {/*  <Heading size="md" p={2}>*/}
        {/*    Conversations*/}
        {/*  </Heading>*/}
        {/*</Box>*/}
        <Box p={2}>
          <Button width="100%">New Chat</Button>
        </Box>
        <Divider />
        {sessions.size == 0 && (
          <Center>
            <Text>No conversations</Text>
          </Center>
        )}
        <List spacing={3} padding={2} overflowY="auto" maxH="100%">
          {Array.from(sessions).map(([id, session]) => {
            return (
              <ListItem key={id} width="100%">
                <Box
                  p={2}
                  borderWidth="1px"
                  borderRadius="lg"
                  bgColor="white"
                  borderColor={currentSessionId === id ? 'blue.500' : 'gray.200'}
                  onClick={async () => {
                    setCurrentSessionId(id);
                    await saveGlobalConfig(globalConfigKey_CurrentSessionId, id);
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
        {currentSessionId && <ChatBox settings={settings} sessionId={currentSessionId} />}
      </GridItem>
    </Grid>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
