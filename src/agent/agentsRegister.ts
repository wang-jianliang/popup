import * as AgentWhatIs from './whats-this.json';
import * as AgentChat from './chat-with-the-bot.json';
import Agent from '@src/agent/agent';
import { getAgents } from '@pages/storage/agent';

export default class AgentsLoader {
  private agents: Map<string, Agent>;
  constructor() {
    this.agents = new Map([
      ['what_is', AgentWhatIs as Agent],
      ['chat', AgentChat as Agent],
    ]);
  }

  public async loadAgents(): Promise<Map<string, Agent>> {
    await getAgents(1000).then(agents => {
      agents.forEach((agent, id) => {
        this.agents.set(id, agent);
      });
    });
    return this.agents;
  }

  public getAgent(id: string): Agent {
    return this.agents.get(id);
  }
}
