import { useEffect, useRef, useState } from 'react';
import { fetchAgents } from '@src/agent/agentService';
import Agent from '@src/agent/agent';
import { Box, Card, CardBody, Divider, Heading, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react';

export default function AgentsMarket() {
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map());
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const loadMoreRef = useRef(null);
  const offsetRef = useRef(offset);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const loadAgents = () => {
    console.log('load agents', offset, limit);
    fetchAgents(offsetRef.current, limit).then(agents => {
      // Append new agents to the existing ones
      setAgents(prev => {
        const newAgents = new Map(prev);
        agents.forEach((agent, name) => {
          newAgents.set(name, agent);
        });
        return newAgents;
      });
      setOffset(prev => prev + limit);
    });
  };

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (target) {
      const observer = new IntersectionObserver(
        entries => {
          const first = entries[0];
          if (first.isIntersecting) {
            loadAgents();
          }
        },
        { threshold: 1 },
      );
      observer.observe(target);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <Box>
      <Wrap spacing={3} maxH="700px" overflow="auto">
        {Array.from(agents.values()).map(agent => {
          return (
            <WrapItem key={agent.name}>
              <Card width="260px" height="130px" bg="gray.50">
                <CardBody>
                  <Stack justifyContent="space-between" divider={<Divider />} spacing={1} height="100%">
                    <Box height="70%">
                      <Heading size="sm">{agent.name}</Heading>
                      <Text fontSize="12px">{agent.description}</Text>
                    </Box>
                    <Text fontSize="10px" color="gray">
                      {agent.engine}({agent.model})
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            </WrapItem>
          );
        })}
        <Box ref={loadMoreRef}>No more agents</Box>
      </Wrap>
    </Box>
  );
}
