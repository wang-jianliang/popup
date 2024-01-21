import Agent from '@src/agent/agent';
import * as AgentWhatIs from '@src/agent/what_is.json';
import * as AgentChat from '@src/agent/chat.json';

export function fetchAgents(offset: number, pageSize: number): Promise<Map<string, Agent>> {
  return new Promise(resolve => {
    const agents = new Map([
      ['what_is', AgentWhatIs as Agent],
      ['chat', AgentChat as Agent],
    ]);

    for (let i = 0; i < pageSize; i++) {
      agents.set(`what_is_${i + offset * pageSize}`, AgentWhatIs as Agent);
    }
    resolve(agents);
  });
}
