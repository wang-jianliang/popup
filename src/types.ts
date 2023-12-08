export type UserEventType = MouseEvent | TouchEvent | PointerEvent;

export interface Message {
  type: string;
  body: any;
}
