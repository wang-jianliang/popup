import { useEffect, useRef, useState } from 'react';
import { createAgentMenu, fetchAgents, removeAgentMenu } from '@src/shared/backgroundActions';
import Agent from '@src/agent/agent';
import {
  Box,
  Card,
  CardBody,
  Divider,
  Heading,
  Spinner,
  Stack,
  Switch,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { deleteAgent, getAgents, saveAgent } from '../content/storageUtils';

type AgentCardProps = {
  agent: Agent;
  initialEnabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
};

function AgentCard({ agent, initialEnabled, onEnabledChange }: AgentCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled || false);
  const bg = useColorModeValue('gray.50', 'gray.600');

  useEffect(() => {
    if (onEnabledChange) {
      onEnabledChange(enabled);
    }
  }, [enabled, onEnabledChange]);

  return (
    <Card width="260px" height="130px" bg={bg}>
      <CardBody>
        <Stack justifyContent="space-between" divider={<Divider borderColor="gray.200" />} spacing={1} height="100%">
          <Box height="70%">
            <Heading size="sm">{agent.name}</Heading>
            <Text fontSize="12px">{agent.description}</Text>
          </Box>
          <Box justifyContent="space-between" display="flex" alignItems="center">
            <Text fontSize="10px" color="gray">
              {agent.engine}({agent.models[0]})
            </Text>
            <Switch isChecked={enabled} onChange={event => setEnabled(event.target.checked)} />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default function AgentsMarket() {
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map());
  const [enabledAgents, setEnabledAgents] = useState<Map<string, Agent>>(new Map());
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const loadMoreRef = useRef(null);
  const offsetRef = useRef(offset);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const disableAgent = (id: string, agent: Agent) => {
    console.log('disable agent:', id, agent);
    if (!enabledAgents.has(id)) {
      return;
    }
    setEnabledAgents(prev => {
      const newAgents = new Map(prev);
      newAgents.delete(id);
      return newAgents;
    });
    deleteAgent(id)
      .then(async () => {
        await removeAgentMenu(id);
      })
      .catch(err => {
        alert('Failed to disable agent: ' + err);
      });
  };

  const enableAgent = (enabled: boolean, id: string, agent: Agent) => {
    console.log('enable agent:', enabled, id, agent);
    if (enabledAgents.has(id)) {
      return;
    }
    setEnabledAgents(prev => {
      const newAgents = new Map(prev);
      newAgents.set(id, agent);
      return newAgents;
    });
    saveAgent(id, agent)
      .then(async () => {
        await createAgentMenu(agent, id);
      })
      .catch(err => {
        alert('Failed to enable agent: ' + err);
      });
  };

  const loadAgents = () => {
    setLoading(true);
    console.log('fetching agents', offset, limit);
    fetchAgents(offsetRef.current, limit)
      .then(async agents => {
        console.log('fetched agents', agents);

        // Load enabled agents from storage
        const enabledAgentFromStorage = await getAgents(1000);
        console.log('enabled agents from storage:', enabledAgentFromStorage);

        setEnabledAgents(enabledAgentFromStorage);
        // Append new agents to the existing ones
        setAgents(prev => {
          const newAgents = new Map(prev);
          agents.forEach(agent => {
            newAgents.set(agent.identifier, agent);
          });
          return newAgents;
        });
        setOffset(prev => prev + limit);
        setLoading(false);
      })
      .catch(e => {
        alert('Failed to fetch agents: ' + e);
        setLoading(false);
      });
  };

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
      {loading && <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />}
      <Wrap spacing={3} maxH="700px" overflow="auto">
        {Array.from(enabledAgents.keys()).map(id => {
          return (
            <WrapItem key={id}>
              <AgentCard
                initialEnabled={true}
                agent={enabledAgents.get(id)}
                onEnabledChange={enabled => {
                  if (!enabled) {
                    disableAgent(id, enabledAgents.get(id));
                  }
                }}
              />
            </WrapItem>
          );
        })}
        <Divider marginY={2} w="90%" borderColor="gray" />
        {Array.from(agents.keys()).map(id => {
          if (enabledAgents.has(id)) {
            return null;
          }
          return (
            <WrapItem key={id}>
              <AgentCard
                initialEnabled={false}
                agent={agents.get(id)}
                onEnabledChange={enabled => {
                  if (enabled) {
                    enableAgent(enabled, id, agents.get(id));
                  }
                }}
              />
            </WrapItem>
          );
        })}
        {!loading && <Box ref={loadMoreRef}>No more agents</Box>}
      </Wrap>
    </Box>
  );
}
