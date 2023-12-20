import { Menus } from 'webextension-polyfill-ts';
import OnClickData = Menus.OnClickData;
import Agent from '@pages/agent/agent';

export type UserEventType = MouseEvent | TouchEvent | PointerEvent;

export interface BrowserMessage {
  type: string;
  agent: Agent;
  info: OnClickData;
}
