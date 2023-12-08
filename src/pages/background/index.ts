import { messageType_AskGPT } from '@root/src/constants';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import browser from 'webextension-polyfill';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

browser.contextMenus.create({
  id: 'ask_gpt',
  title: 'Ask GPT',
  contexts: ['selection'],
});

browser.contextMenus?.onClicked.addListener(async function (info: any) {
  console.log('[background.js', 'contextMenus onClicked');
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  tab.id &&
    browser.tabs.sendMessage(tab.id, {
      type: messageType_AskGPT,
      info,
    });
});
