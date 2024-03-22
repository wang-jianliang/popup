import { MENU_ITEM_ID_OPEN_SIDE_PANEL, MESSAGE_TYPE_MENU_CLICKED } from '@root/src/constants';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import AgentsLoader from '@src/agent/agentsRegister';
import { browser, Menus } from 'webextension-polyfill-ts';
import {
  createNewSession,
  getMessages,
  getSession,
  getSessions,
  saveMessage,
  saveMessages,
  updateMessage,
} from '@pages/storage/chat';
import OnClickData = Menus.OnClickData;
import { fetchAgents } from '@src/agent/agentService';
import { getGlobalConfig, saveGlobalConfig } from '@pages/storage/global';
import { deleteAgent, getAgents, saveAgent } from '../storage/agent';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

const agentsRegistry = new AgentsLoader();

if (chrome.sidePanel) {
  browser.contextMenus.create({
    id: MENU_ITEM_ID_OPEN_SIDE_PANEL,
    title: '[Popup] Open Side Panel',
    contexts: ['all'],
  });
}

agentsRegistry.loadAgents().then(agents => {
  console.log('agents loaded', agents);
  agents.forEach((agent, id) => {
    console.log('agent:', agent.prompts);
    browser.contextMenus.create({
      id: id,
      title: agent.name,
      contexts: Object.keys(agent.prompts) as unknown as Menus.ContextType[],
    });
  });
});

browser.contextMenus?.onClicked.addListener(async function (info: OnClickData, tab) {
  const agent = agentsRegistry.getAgent(<string>info.menuItemId);

  console.log('[background.js', 'contextMenus onClicked', info);
  if (info.menuItemId === MENU_ITEM_ID_OPEN_SIDE_PANEL) {
    // This will open the panel in all the pages on the current window.
    // Only chrome supports this feature.
    await chrome.sidePanel.open({ windowId: tab.windowId });
    await browser.sidebarAction.open();
  } else {
    tab.id &&
      (await browser.tabs.sendMessage(tab.id, {
        type: MESSAGE_TYPE_MENU_CLICKED,
        agent: agent,
        info: info,
      }));
  }
});

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
      return await getAgents(message.data);
    case 'saveAgent':
      return await saveAgent(message.data.key, message.data.agent);
    case 'deleteAgent':
      return await deleteAgent(message.data);
    default:
      console.log('unknown command:', command);
      return null;
  }
});
