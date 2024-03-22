import Agent from '@src/agent/agent';
import ObjectStore from '@pages/storage/db';

export const saveAgent = async (id: string, agent: Agent): Promise<number> => {
  console.log('saveAgent:', agent);
  const agentStore: ObjectStore<Agent> = await new ObjectStore<Agent>('agent').open();
  return await agentStore.saveItemWithKey(agent, id);
};

export const getAgents = async (maxCount: number): Promise<Map<string, Agent>> => {
  console.log('getAgents, maxCount:', maxCount);
  const agentStore: ObjectStore<Agent> = await new ObjectStore<Agent>('agent').open();
  return (await agentStore.loadItems(maxCount)) as Map<string, Agent>;
};

export const deleteAgent = async (id: string): Promise<void> => {
  console.log('deleteAgent:', id);
  const agentStore: ObjectStore<Agent> = await new ObjectStore<Agent>('agent').open();
  await agentStore.deleteItem(id);
};
