import { createRoot, Root } from 'react-dom/client';
import App from '@pages/content/ui/App';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import { browser, Menus } from 'webextension-polyfill-ts';
import { BrowserMessage, UserEventType } from '@root/src/types';
import { getClientX, getClientY } from '@root/src/utils';
import { contentContainerViewId, messageType_MenuClicked } from '@root/src/constants';
import EmotionCacheProvider from './EmotionCacheProvider';
import CustomChakraProvider from './CustomChakraProvider';
import { Box } from '@chakra-ui/react';
import OnClickData = Menus.OnClickData;
import Agent from '@pages/agent/agent';

refreshOnUpdate('pages/content');

let reactRoot: Root | null = null;

async function createContainerView(x: number, y: number, agent: Agent, info: OnClickData) {
  const root = document.createElement('div');
  root.id = contentContainerViewId;

  document.body.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = 'content-shadow-root';

  const shadowRoot = root.attachShadow({ mode: 'open' });
  shadowRoot.appendChild(rootIntoShadow);

  /** Inject styles into shadow dom */
  const styleElement = document.createElement('style');
  styleElement.innerHTML = injectedStyle;
  shadowRoot.appendChild(styleElement);
  reactRoot = createRoot(rootIntoShadow);

  reactRoot.render(
    <EmotionCacheProvider rootId={root.id}>
      <CustomChakraProvider shadowRootId={rootIntoShadow.id}>
        <Box position="absolute" top={y} left={x}>
          <App agent={agent} info={info} onClose={hideContainerView} />
        </Box>
      </CustomChakraProvider>
    </EmotionCacheProvider>,
  );
}

async function hideContainerView() {
  const $containerRoot = document.getElementById(contentContainerViewId);
  if ($containerRoot != null) {
    reactRoot.unmount();
    $containerRoot.remove();
  }
}

/**
 * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/pull/174
 *
 * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
 * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
 */

let lastMouseEvent: UserEventType | undefined;

const mouseUpHandler = async (event: UserEventType) => {
  console.log('[content.js]. mouse up event:', event);
  lastMouseEvent = event;
};

// const mouseDownHandler = async (event: UserEventType) => {
//   console.log('[content.js]. mouse down event:', event);
//   await hideContainerView();
// };

document.addEventListener('mouseup', mouseUpHandler);
document.addEventListener('touchend', mouseUpHandler);
// document.addEventListener('mousedown', mouseDownHandler);

// Function called when a new message is received
const messagesFromContextMenu = async (msg: BrowserMessage) => {
  console.log('[content.js]. Message received', msg);

  if (msg.type === messageType_MenuClicked) {
    console.log(`menu ${msg} is clicked`);
    const root = document.createElement('div');
    document.body.appendChild(root);
    const x = lastMouseEvent ? getClientX(lastMouseEvent) : 0;
    const y = lastMouseEvent ? getClientY(lastMouseEvent) : 0;
    await createContainerView(x, y, msg.agent, msg.info);
  }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
browser.runtime.onMessage.addListener(messagesFromContextMenu);
