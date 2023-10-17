import { NodeEditor } from 'rete';
import { AreaPlugin, AreaExtensions, type Area2D } from 'rete-area-plugin';
import {
  ClassicFlow,
  ConnectionPlugin,
  Presets as ConnectionPresets,
  getSourceTarget
} from 'rete-connection-plugin';
import { AutoArrangePlugin, Presets as ArrangePresets } from 'rete-auto-arrange-plugin';
import { DataflowEngine, ControlFlowEngine } from 'rete-engine';
import {
  type ContextMenuExtra,
  ContextMenuPlugin,
  Presets as ContextMenuPresets
} from 'rete-context-menu-plugin';
import {
  DataNode,
  SoundNode,
  OutputNode,
  PanNode,
  TimeNode,
  VolumeNode,
  MultiplyNode,
  AddNode,
  SineNode
} from './nodes';
import { ActionSocket, TextSocket } from './sockets';
import { type Schemes } from './types';
import { Connection } from './connection';
import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin';
import { getConnectionSockets } from './utils';

type AreaExtra = VueArea2D<any> | ContextMenuExtra;

export async function createEditor(
  container: HTMLElement,
  log: (text: string, type: 'info' | 'error') => void
) {
  // Setup
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VuePlugin<Schemes, AreaExtra>();
  const arrange = new AutoArrangePlugin<Schemes, AreaExtra>();
  const engine = new DataflowEngine<Schemes>();

  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Data Input Node', () => new DataNode()],
      ['Sound Node', () => new SoundNode()],
      ['Time Node', () => new TimeNode()],
      ['Multiply Node', () => new MultiplyNode()],
      ['Add Node', () => new AddNode()],
      ['Volume Node', () => new VolumeNode()],
      ['Panner Node', () => new PanNode()],
      ['Sine Node', () => new SineNode()],
      ['Output Node', () => new OutputNode()]
    ])
  });
  area.use(contextMenu);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  });

  render.addPreset(Presets.contextMenu.setup());
  render.addPreset(Presets.classic.setup());

  arrange.addPreset(ArrangePresets.classic.setup());

  connection.addPreset(
    () =>
      new ClassicFlow({
        canMakeConnection(from, to) {
          // this function checks if the old connection should be removed
          const forward = from.side === 'output' && to.side === 'input';
          const backward = from.side === 'input' && to.side === 'output';
          const [source, target] = forward ? [from, to] : backward ? [to, from] : [];

          if (!source || !target || from === to) return false;

          const sockets = getConnectionSockets(
            editor,
            new Connection(
              editor.getNode(source.nodeId),
              source.key as never,
              editor.getNode(target.nodeId),
              target.key as never
            )
          );
          console.log(sockets);

          if (!sockets.source.isCompatibleWith(sockets.target)) {
            log('Sockets are not compatible', 'error');
            connection.drop();
            return false;
          }

          return Boolean(source && target);
        },
        makeConnection(from, to, context) {
          const [source, target] = getSourceTarget(from, to) || [null, null];
          const { editor } = context;

          if (source && target) {
            editor.addConnection(
              new Connection(
                editor.getNode(source.nodeId),
                source.key as never,
                editor.getNode(target.nodeId),
                target.key as never
              )
            );
            return true;
          }
        }
      })
  );

  editor.use(engine);
  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  AreaExtensions.simpleNodesOrder(area);
  AreaExtensions.showInputControl(area);

  editor.addPipe((context) => {
    if (context.type === 'connectioncreate') {
      const { data } = context;
      const { source, target } = getConnectionSockets(editor, data);

      if (!source.isCompatibleWith(target)) {
        log('Sockets are not compatible', 'error');
        return;
      }
    }
    return context;
  });

  // Default Nodes
  const population = new DataNode();
  const sound = new SoundNode();
  const output = new OutputNode();
  const volume = new VolumeNode();
  const time = new TimeNode();
  const sine = new SineNode();
  const add = new AddNode(1);
  const multiply = new MultiplyNode(0.5);
  const pan = new PanNode();

  const con1 = new Connection(sound, 'sound_out', volume, 'sound_in');
  const con2 = new Connection(pan, 'sound_out', output, 'sound_in');
  const con3 = new Connection(population, 'value_out', volume, 'value_in');
  const con3b = new Connection(volume, 'sound_out', pan, 'sound_in');

  const con4 = new Connection(time, 'seconds', sine, 'value_in');
  const con5 = new Connection(sine, 'value_out', add, 'value_in');
  const con6 = new Connection(add, 'value_out', multiply, 'value_in');
  const con7 = new Connection(multiply, 'value_out', pan, 'value_in');

  await editor.addNode(population);
  await editor.addNode(sound);
  await editor.addNode(output);
  await editor.addNode(volume);
  await editor.addNode(pan);

  await editor.addNode(time);
  await editor.addNode(sine);
  await editor.addNode(add);
  await editor.addNode(multiply);

  await editor.addConnection(con1);
  await editor.addConnection(con2);
  await editor.addConnection(con3);
  await editor.addConnection(con3b);

  await editor.addConnection(con4);
  await editor.addConnection(con5);
  await editor.addConnection(con6);
  await editor.addConnection(con7);

  await arrange.layout();

  AreaExtensions.zoomAt(area, editor.getNodes());

  // Processing
  function process() {
    // console.log('process');
    engine.reset();

    editor
      .getNodes()
      .filter((n) => n instanceof OutputNode)
      .forEach((n) => engine.fetch(n.id));
  }

  setInterval(() => {
    process();
  }, 100);

  return {
    destroy: () => area.destroy()
  };
}
