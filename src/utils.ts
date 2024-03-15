import { UserEventType } from './types';

export const getPageX = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;
};

export const getPageY = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.pageY : event.changedTouches[0].pageY;
};

export const getClientX = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX;
};

export const getClientY = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY;
};

export const getDeviceId = () => {
  const userAgent = navigator.userAgent;
  const language = navigator.language;

  let deviceId = userAgent + language;
  deviceId = btoa(deviceId); // 使用 base64 编码

  return deviceId;
};
