import { browser } from 'webextension-polyfill-ts';
import {
  createNewSession,
  getMessages,
  getSession,
  getSessions,
  saveMessage,
  saveMessages,
  updateMessage,
} from '@pages/storage/chat';
import { fetchAgents } from '@src/agent/agentService';
import { getGlobalConfig, saveGlobalConfig } from '@pages/storage/global';
import { mapToArray } from '@root/utils/map';
import { deleteAgent, getAgents, saveAgent } from '@pages/storage/agent';
import { createAgentMenu, createAgentMenus, removeAgentMenu } from '@pages/background/menus';

export function registryCommands() {
  browser.runtime.onMessage.addListener(async (message: { command: string; data: any }) => {
    const command = message.command;
    switch (command) {
      case 'createNewSession':
        return await createNewSession(message.data.title, message.data.agent);
      case 'getMessages':
        return await getMessages(message.data);
      case 'updateMessage':
        return await updateMessage(message.data.id, message.data.message);
      case 'storeNewMessages':
        return await saveMessages(message.data.sessionId, message.data.messages);
      case 'storeNewMessage':
        return await saveMessage(message.data.sessionId, message.data.message);
      case 'getSessions':
        return await getSessions(message.data);
      case 'getSession':
        return await getSession(message.data);
      case 'fetchAgents':
        return await fetchAgents(message.data.offset, message.data.pageSize);
      case 'saveGlobalConfig':
        return await saveGlobalConfig(message.data.key, message.data.value);
      case 'getGlobalConfig':
        return await getGlobalConfig(message.data.key);
      case 'getAgents':
        return mapToArray(await getAgents(message.data));
      case 'saveAgent':
        return await saveAgent(message.data.key, message.data.agent);
      case 'deleteAgent':
        return await deleteAgent(message.data);
      case 'createAgentMenus':
        return await createAgentMenus();
      case 'createAgentMenu':
        return await createAgentMenu(message.data.agent, message.data.id);
      case 'removeAgentMenu':
        return await removeAgentMenu(message.data);
      default:
        console.log('unknown command:', command);
        return null;
    }
  });
}
