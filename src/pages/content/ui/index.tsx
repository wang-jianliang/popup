import { createRoot, Root } from 'react-dom/client';
import App from '@pages/content/ui/App';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import { contentContainerViewId } from '@root/src/constants';
import EmotionCacheProvider from './EmotionCacheProvider';
import CustomChakraProvider from './CustomChakraProvider';
import { Box } from '@chakra-ui/react';

refreshOnUpdate('pages/content');

let reactRoot: Root | null = null;

async function createContainerView() {
  console.log('[content.js]. createContainerView');
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
        <Box>
          <App />
        </Box>
      </CustomChakraProvider>
    </EmotionCacheProvider>,
  );
}

/**
 * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/pull/174
 *
 * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
 * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
 */

createContainerView().then(() => {});
