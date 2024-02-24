import { Box, CloseButton, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import AgentsMarket from '@pages/components/AgentsMarket';
import BaseSettings from '@pages/components/BaseSettings';

type Props = {
  onClosed: (() => void) | null;
};

export default function Settings(props: Props = { onClosed: null }) {
  return (
    <Box>
      <Flex justifyContent="space-between">
        <Box></Box>
        <CloseButton onClick={props.onClosed} />
      </Flex>
      <Box padding={1}>
        <Tabs variant="enclosed" isLazy={true}>
          <TabList>
            <Tab>Base</Tab>
            <Tab>Agents</Tab>
          </TabList>
          <TabPanels padding={1}>
            <TabPanel>
              <BaseSettings />
            </TabPanel>
            <TabPanel>
              <AgentsMarket />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
