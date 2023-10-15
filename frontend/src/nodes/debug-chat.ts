import { ClassicPreset } from 'rete';
import { botAvatar, userAvatar } from '../consts';

export type MessageModel = {
  avatar: string;
  message: string;
  own: boolean;
};

export class DebugChat extends ClassicPreset.Node<{}, {}, {}> {
  width = 400;
  height = 650;

  messages: MessageModel[] = [];

  constructor(private onSend: (message: MessageModel) => void) {
    super('Chat');
  }

  execute() {}

  data() {
    return {};
  }

  private addMessage(message: MessageModel) {
    this.messages.push(message);
    this.onSend(message);
  }

  public botSend(message: string) {
    this.addMessage({
      avatar: botAvatar,
      message,
      own: false
    });
  }

  public userSend(message: string) {
    this.addMessage({
      avatar: userAvatar,
      message,
      own: true
    });
  }
}
