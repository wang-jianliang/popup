import { browser } from 'webextension-polyfill-ts';
import { STORAGE_KEY_AGENTS } from '@src/constants';
import * as AgentWhatIs from './whats-this.json';
import * as AgentChat from './chat-with-the-bot.json';
import Agent from '@src/agent/agent';

export default class AgentsLoader {
  private agents: Map<string, Agent>;
  constructor() {
    this.agents = new Map([
      ['what_is', AgentWhatIs as Agent],
      ['chat', AgentChat as Agent],
    ]);
  }

  public async loadAgents() {
    return await browser.storage.sync.get([STORAGE_KEY_AGENTS]).then(result => {
      result[STORAGE_KEY_AGENTS] && (this.agents = result[STORAGE_KEY_AGENTS]);
      return this.agents;
    });
  }

  public getAgent(id: string): Agent {
    return this.agents.get(id);
  }
}
