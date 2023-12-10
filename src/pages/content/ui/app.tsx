import ChatBox from './components/ChatBox';
import { Card, CardBody, CloseButton } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface Props {
  position: { x: number; y: number };
  onClose: (() => void) | null;
}

export default function App(props: Props) {
  const { position, onClose } = props;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
      console.log('selected text：' + selectedText);
      setMessages(prevMessages => {
        return [...prevMessages, { role: 'user', msg: selectedText }];
      });
    } else if ((event.target as HTMLElement).nodeName === 'IMG') {
      console.log('在图片上进行了点击');
      // 请在此处添加对于在图片上点击情况的逻辑
    } else {
      console.log('在空白处进行了点击');
      // 请在此处添加对于在空白处点击情况的逻辑
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          backgroundColor: '#FFFFFF',
        }}>
        <Card>
          <CloseButton marginLeft={2} marginTop={2} size="md" onClick={onClose} />
          <CardBody padding="2">
            <ChatBox messagesHistory={messages} maxH="600px" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

App.defaultProps = {
  position: { x: 0, y: 0 },
  onClose: null,
};
