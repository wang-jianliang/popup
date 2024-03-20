import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import AgentsMarket from '@pages/components/AgentsMarket';
import BaseSettings from '@pages/components/BaseSettings';

export default function Settings() {
  return (
    <Box>
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
