export type MessageFrame = {
      displayTime: boolean,
      forceSplit: boolean,
      position: Position,
      receiveTime: Date,
      senderId: string
}


export enum Position {
      Top, Center, Bottom, Single
}
