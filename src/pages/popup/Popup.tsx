import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.png';
import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import ChatBox from '@pages/components/ChatBox';
import { getSystemPrompt } from '@src/agent/agent';
import AgentsLoader from '@src/agent/agentsRegister';
import { Divider, Spinner } from '@chakra-ui/react';
import { createNewSession } from '@pages/content/storageUtils';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const [agent, setAgent] = useState(null);
  const [sessionId, setSessionId] = useState(-1);

  useEffect(() => {
    const agentsRegistry = new AgentsLoader();
    agentsRegistry.loadAgents().then(agents => {
      const agent = agents.get('chat-with-the-bot');
      setAgent(agent);
      createNewSession('Chat with the bot', agent).then(sessionId => {
        setSessionId(sessionId);
      });
    });
  }, []);

  return (
    <div className="Popup-App">
      <header className="App-header" style={{ color: theme === 'light' ? '#fff' : '#000' }}>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <Divider mb={2} />
      {agent && sessionId > 0 ? (
        <ChatBox
          preInput=""
          inputType="default"
          systemPrompt={getSystemPrompt(agent, 'default')}
          sessionId={sessionId}
          newMessages={[]}
          minW="400px"
          maxH="600px"
        />
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
