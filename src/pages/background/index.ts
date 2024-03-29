// Description: Background script for the extension.

// disable console
console.info = function () {};
console.log = console.info;

import { MENU_ITEM_ID_OPEN_SIDE_PANEL } from '@root/src/constants';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import { browser } from 'webextension-polyfill-ts';
import { createAgentMenus } from '@pages/background/menus';
import { registryCommands } from '@pages/background/command';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

if (chrome.sidePanel) {
  browser.contextMenus
    .remove(MENU_ITEM_ID_OPEN_SIDE_PANEL)
    .then()
    .catch(() => {
      console.log('failed to remove context menu');
    })
    .then(() => {
      browser.contextMenus.create({
        id: MENU_ITEM_ID_OPEN_SIDE_PANEL,
        title: '[Popup] Open Side Panel',
        contexts: ['all'],
      });
    });
}

createAgentMenus().then(() => console.log('agent menus created'));
registryCommands();
