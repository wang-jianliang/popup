import { messageType_MenuClicked } from '@root/src/constants';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import AgentsLoader from '@src/agent/agentsRegister';
import { browser, Menus } from 'webextension-polyfill-ts';
import { createNewSession, getMessages, storeNewMessage, storeNewMessages, updateMessage } from '@pages/storage/chat';
import { getSessions } from '@pages/content/storageUtils';
import OnClickData = Menus.OnClickData;

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

const agentsRegistry = new AgentsLoader();
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

browser.contextMenus?.onClicked.addListener(async function (info: OnClickData) {
  const agent = agentsRegistry.getAgent(<string>info.menuItemId);

  console.log('[background.js', 'contextMenus onClicked');
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  tab.id &&
    (await browser.tabs.sendMessage(tab.id, {
      type: messageType_MenuClicked,
      agent: agent,
      info: info,
    }));
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
      return await storeNewMessages(message.data.sessionId, message.data.messages);
    case 'storeNewMessage':
      return await storeNewMessage(message.data.sessionId, message.data.message);
    case 'getSessions':
      return await getSessions(message.data);
    default:
      console.log('unknown command:', command);
      return null;
  }
});
