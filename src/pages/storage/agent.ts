import Agent from '@src/agent/agent';
import ObjectStore from '@pages/storage/db';

export const saveAgent = async (key: string, agent: Agent): Promise<number> => {
  console.log('saveAgent:', agent);
  const agentStore: ObjectStore<Agent> = await new ObjectStore<Agent>('agent').open();
  return await agentStore.saveItemWithKey(agent, key);
};

export const getAgents = async (maxCount: number): Promise<Map<string, Agent>> => {
  console.log('getAgents');
  const agentStore: ObjectStore<Agent> = await new ObjectStore<Agent>('agent').open();
  return (await agentStore.loadItems(maxCount)) as Map<string, Agent>;
};

export const deleteAgent = async (id: number): Promise<void> => {
  console.log('deleteAgent:', id);
  const agentStore: ObjectStore<Agent> = await new ObjectStore<Agent>('agent').open();
  await agentStore.deleteItem(id);
};
