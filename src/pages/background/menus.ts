import { browser, Menus } from 'webextension-polyfill-ts';
import AgentsLoader from '@src/agent/agentsRegister';
import { MENU_ITEM_ID_OPEN_SIDE_PANEL, MESSAGE_TYPE_MENU_CLICKED } from '@src/constants';
import OnClickData = Menus.OnClickData;
import Agent, { getContextTypes } from '@src/agent/agent';

export async function createAgentMenu(agent: Agent, id: string) {
  console.log('add agent:', agent, id, 'to menu:');
  browser.contextMenus.create({
    id: id,
    title: agent.name,
    contexts: getContextTypes(agent) as Menus.ContextType[],
  });
}

export async function removeAgentMenu(id: string) {
  console.log('remove agent from menu:', id);
  await browser.contextMenus
    .remove(id)
    .then()
    .catch(() => {
      console.error('failed to remove agent from context menu');
    });
}

export async function createAgentMenus() {
  const agentsRegistry = new AgentsLoader();

  browser.contextMenus?.onClicked.addListener(async function (info: OnClickData, tab) {
    const agent = agentsRegistry.getAgent(<string>info.menuItemId);

    console.log('[background.js', 'contextMenus onClicked', info);
    if (info.menuItemId === MENU_ITEM_ID_OPEN_SIDE_PANEL) {
      // This will open the panel in all the pages on the current window.
      // Only chrome supports this feature.
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } else {
      tab.id &&
        (await browser.tabs.sendMessage(tab.id, {
          type: MESSAGE_TYPE_MENU_CLICKED,
          agent: agent,
          info: info,
        }));
    }
  });

  await agentsRegistry.loadAgents().then(agents => {
    console.log('agents loaded', agents);
    agents.forEach(async (agent, id) => {
      console.log('add agent:', agent, id, 'to menu');
      // if the context menu of the agent exists, remove it first.
      await browser.contextMenus
        .remove(id)
        .then()
        .catch(() => {
          console.log('failed to remove context menu');
        });

      browser.contextMenus.create({
        id: id,
        title: agent.name,
        contexts: getContextTypes(agent) as Menus.ContextType[],
      });
    });
  });
}
