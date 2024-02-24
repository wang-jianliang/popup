import ObjectStore from '@pages/storage/db';
import { ChatMessage } from '@pages/content/ui/types';
import Agent from '@src/agent/agent';

export interface ChatSession {
  title: string;
  messageIds: number[];
  currentMessageId: number;
  agent: Agent;
}

export const saveMessage = async (sessionId: number, message: ChatMessage): Promise<number> => {
  console.log('storeNewMessage:', sessionId, message);
  const messageStore: ObjectStore<ChatMessage> = await new ObjectStore<ChatMessage>('message').open();
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();

  return await messageStore.saveItem(message).then(async msgId => {
    const session = await sessionStore.loadItem(sessionId);
    session.messageIds.push(msgId);
    session.currentMessageId = msgId;
    await sessionStore.updateItem(sessionId, session);
    return msgId;
  });
};

export const saveMessages = async (sessionId: number, messages: ChatMessage[]): Promise<void> => {
  console.log('store new messages:', messages);

  const messageStore: ObjectStore<ChatMessage> = await new ObjectStore<ChatMessage>('message').open();
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();

  const msgIds = await messageStore.saveItems(messages);
  const session = await sessionStore.loadItem(sessionId);
  session.messageIds.push(...msgIds);
  session.currentMessageId = msgIds[msgIds.length - 1];
  await sessionStore.updateItem(sessionId, session);
};

export const updateMessage = async (messageId: number, message: ChatMessage): Promise<void> => {
  console.log('update message:', messageId, message);
  const messageStore: ObjectStore<ChatMessage> = await new ObjectStore<ChatMessage>('message').open();
  await messageStore.updateItem(messageId, message);
};

export const getMessages = async (sessionId: number): Promise<ChatMessage[]> => {
  console.log('getMessages, sessionId:', sessionId);
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();
  const session = await sessionStore.loadItem(sessionId);

  const messageStore: ObjectStore<ChatMessage> = await new ObjectStore<ChatMessage>('message').open();
  return await Promise.all(session.messageIds.map(async msgId => await messageStore.loadItem(msgId)));
};

export const createNewSession = async (title: string, agent: Agent) => {
  console.log('createNewSession, title:', title);
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();
  const id = await sessionStore.saveItem({ title, messageIds: [], currentMessageId: 0, agent });
  console.log(`session created: ${id}`);
  return id;
};

export const getSession = async (sessionId: number): Promise<ChatSession> => {
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();
  return await sessionStore.loadItem(sessionId);
};

export const getSessions = async (maxCount: number): Promise<Map<number, ChatSession>> => {
  console.log('getSessions, maxCount:', maxCount);
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();
  return (await sessionStore.loadItems(maxCount)) as Map<number, ChatSession>;
};

export const deleteSession = async (sessionId: number): Promise<void> => {
  console.log('deleteSession, sessionId:', sessionId);
  const sessionStore: ObjectStore<ChatSession> = await new ObjectStore<ChatSession>('session').open();
  await sessionStore.deleteItem(sessionId);
};
