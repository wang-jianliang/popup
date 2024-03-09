import Agent from '@src/agent/agent';
import { agentStoreBaseURL } from '@src/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchAgents(offset: number, pageSize: number): Promise<Agent[]> {
  return await fetch(agentStoreBaseURL + '/index.json')
    .then(response => response.json())
    .then(data => {
      return data.agents;
    });
}
