import { browser } from 'webextension-polyfill-ts';
import Agent from '@src/agent/agent';

export const fetchAgents = async (offset: number, pageSize: number): Promise<Agent[]> => {
  console.info('fetchAgents, offset:', offset, 'pageSize:', pageSize);
  return await browser.runtime.sendMessage({ command: 'fetchAgents', data: { offset, pageSize } });
};

export const createAgentMenus = async () => {
  console.info('createAgentMenus');
  return await browser.runtime.sendMessage({ command: 'createAgentMenus' });
};

export const createAgentMenu = async (agent: Agent, id: string) => {
  console.info('createAgentMenu, agent:', agent, 'id:', id);
  return await browser.runtime.sendMessage({ command: 'createAgentMenu', data: { agent, id } });
};

export const removeAgentMenu = async (id: string) => {
  console.info('removeAgentMenu, id:', id);
  return await browser.runtime.sendMessage({ command: 'removeAgentMenu', data: id });
};
