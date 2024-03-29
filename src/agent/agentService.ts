import Agent from '@src/agent/agent';
import { AGENT_STORE_BASE_URL } from '@src/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchAgents(offset: number, pageSize: number): Promise<Agent[]> {
  return await fetch(`${AGENT_STORE_BASE_URL}/agents?offset=${offset}&pageSize=${pageSize}`)
    .then(response => {
      return response.json();
    })
    .then(agents => {
      return agents;
    });
}
