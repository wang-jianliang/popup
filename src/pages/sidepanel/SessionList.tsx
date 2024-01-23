import { Box, CloseButton, Flex, IconButton, List, ListItem } from '@chakra-ui/react';
import React from 'react';
import { ChatSession } from '@pages/storage/chat';

type SessionCardProps = {
  id: number;
  session: ChatSession;
  currentSessionId: number | null;
  onClick: () => void;
  onClose: () => void;
};

const SessionCard = ({ id, session, currentSessionId, onClick, onClose }: SessionCardProps) => {
  const [hover, setHover] = React.useState(false);
  return (
    <Box
      p={2}
      borderWidth="1px"
      borderRadius="lg"
      bgColor="white"
      borderColor={currentSessionId === id ? 'blue.500' : 'gray.200'}
      onClick={onClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}>
      <Flex justifyContent="space-between">
        <Box w="100%" fontSize="small" whiteSpace="normal">
          {session.title}
        </Box>
        <Box w="5%" />
        <IconButton
          visibility={hover ? 'visible' : 'hidden'}
          variant="outline"
          size="xs"
          aria-label={'Delete'}
          icon={<CloseButton />}
          onClick={onClose}
        />
      </Flex>
      <Box as="span" color="gray.400" fontSize="xsm">
        {session.messageIds.length} messages
      </Box>
    </Box>
  );
};

type Props = {
  sessions: Map<number, ChatSession>;
  currentSessionId: number | null;
  onSessionChanged: (id: number) => void;
  onSessionClosed: (id: number) => void;
};

export const SessionList = ({ sessions, currentSessionId, onSessionChanged, onSessionClosed }: Props) => {
  return (
    <List spacing={3} padding={2} overflowY="auto" maxH="100%">
      {Array.from(sessions).map(([id, session]) => {
        return (
          <ListItem key={id} width="100%">
            <SessionCard
              id={id}
              session={session}
              currentSessionId={currentSessionId}
              onClick={() => onSessionChanged(id)}
              onClose={() => onSessionClosed(id)}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
