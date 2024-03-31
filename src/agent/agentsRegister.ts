import * as AgentWhatIs from './whats-this.json';
import * as AgentChat from './chat-with-the-bot.json';
import Agent from '@src/agent/agent';
import { getAgents } from '@pages/storage/agent';
import AgentV2 from '@src/agent/agentV2';

export default class AgentsLoader {
  private agents: Map<string, Agent>;
  constructor() {
    const agentObjects: any[] = [AgentWhatIs, AgentChat];
    this.agents = new Map();
    agentObjects.forEach(agentObject => {
      const schemaVersion = agentObject.schemaVersion;
      let agent: AgentV2 | Agent;
      switch (schemaVersion) {
        case 1:
          agent = agentObject as Agent;
          break;
        case 2:
          agent = agentObject as AgentV2;
          break;
        default:
          throw new Error(`Unknown schema version: ${schemaVersion}`);
      }
      this.agents.set(agent.identifier, agent);
    });
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
