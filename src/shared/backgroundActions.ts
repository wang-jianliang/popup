import { browser } from 'webextension-polyfill-ts';
import Agent from '@src/agent/agent';

export const fetchAgents = async (offset: number, pageSize: number): Promise<Agent[]> => {
  console.info('fetchAgents, offset:', offset, 'pageSize:', pageSize);
  return await browser.runtime.sendMessage({ command: 'fetchAgents', data: { offset, pageSize } });
};
