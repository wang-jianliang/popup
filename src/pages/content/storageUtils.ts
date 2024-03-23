import { ChatMessage } from '@pages/content/ui/types';
import { ChatSession } from '@pages/storage/chat';
import { browser } from 'webextension-polyfill-ts';
import Agent from '@src/agent/agent';
import { arrayToMap } from '@root/utils/map';

export const storeNewMessage = async (sessionId: number, message: ChatMessage): Promise<number> => {
  console.log('store new message:', message);
  return browser.runtime.sendMessage({ command: 'storeNewMessage', data: { sessionId, message } });
};

export const storeNewMessages = async (sessionId: number, messages: ChatMessage[]): Promise<void> => {
  console.log('store new messages:', messages);
  return browser.runtime.sendMessage({ command: 'storeNewMessages', data: { sessionId, messages } });
};

export const updateMessage = async (messageId: number, message: ChatMessage): Promise<void> => {
  console.log('update message:', messageId, message);
  return browser.runtime.sendMessage({ command: 'updateMessage', data: { messageId, message } });
};

export const getMessages = async (sessionId: number): Promise<ChatMessage[]> => {
  console.log('getMessages, sessionId:', sessionId);
  return browser.runtime.sendMessage({ command: 'getMessages', data: sessionId });
};

export const createNewSession = async (title: string, agent: Agent) => {
  console.log('createNewSession, title:', title);
  return browser.runtime.sendMessage({ command: 'createNewSession', data: { title, agent } });
};

export const getSession = async (sessionId: number): Promise<ChatSession> => {
  console.log('getSession, sessionId:', sessionId);
  return browser.runtime.sendMessage({ command: 'getSession', data: sessionId });
};

export const getSessions = async (maxCount: number): Promise<Map<number, ChatSession>> => {
  return browser.runtime.sendMessage({ command: 'getSessions', data: maxCount });
};

export const saveGlobalConfig = async (key: string, value: any) => {
  return browser.runtime.sendMessage({ command: 'saveGlobalConfig', data: { key, value } });
};

export const getGlobalConfig = async (key: string): Promise<any> => {
  return browser.runtime.sendMessage({ command: 'getGlobalConfig', data: { key } });
};

export const getAgents = async (maxCount: number): Promise<Map<string, Agent>> => {
  return arrayToMap(await browser.runtime.sendMessage({ command: 'getAgents', data: maxCount }));
};

export const saveAgent = async (key: string, agent: Agent): Promise<number> => {
  return browser.runtime.sendMessage({ command: 'saveAgent', data: { key, agent } });
};

export const deleteAgent = async (id: string): Promise<void> => {
  return browser.runtime.sendMessage({ command: 'deleteAgent', data: id });
};
