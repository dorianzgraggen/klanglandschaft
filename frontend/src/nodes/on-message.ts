import { ClassicPreset } from "rete";
import { ActionSocket, TextSocket } from "../sockets";

export class OnMessage extends ClassicPreset.Node<
  {},
  { exec: ClassicPreset.Socket; text: ClassicPreset.Socket },
  {}
> {
  width = 180;
  height = 135;
  inputMessage?: string;

  constructor() {
    super("On message");
    this.addOutput(
      "exec",
      new ClassicPreset.Output(new ActionSocket(), "Exec")
    );
    this.addOutput("text", new ClassicPreset.Output(new TextSocket(), "Text"));
  }

  execute(_: never, forward: (output: "exec") => void) {
    forward("exec");
  }

  data() {
    return {
      text: this.inputMessage || ""
    };
  }
}
