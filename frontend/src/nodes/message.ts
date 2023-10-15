import { ClassicPreset } from "rete";
import { TextSocket } from "../sockets";

export class Message extends ClassicPreset.Node<
  {},
  { text: ClassicPreset.Socket },
  { value: ClassicPreset.InputControl<"text"> }
> {
  width = 180;
  height = 140;

  constructor(initial: string) {
    super("Message");
    this.addControl(
      "value",
      new ClassicPreset.InputControl("text", { initial })
    );
    this.addOutput("text", new ClassicPreset.Output(new TextSocket(), "Text"));
  }

  execute() {}

  data() {
    return {
      text: this.controls.value.value || ""
    };
  }
}
