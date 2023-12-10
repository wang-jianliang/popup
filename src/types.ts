export type UserEventType = MouseEvent | TouchEvent | PointerEvent;

export interface BrowserMessage {
  type: string;
  body: any;
}
