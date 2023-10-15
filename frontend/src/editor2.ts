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
import { DataNode, SoundNode, OutputNode } from './nodes';
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
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VuePlugin<Schemes, AreaExtra>();
  const arrange = new AutoArrangePlugin<Schemes, AreaExtra>();
  const engine2 = new DataflowEngine<Schemes>();

  const dataflow = new DataflowEngine<Schemes>(({ inputs, outputs }) => {
    return {
      inputs: () =>
        Object.entries(inputs)
          .filter(([_, input]) => input.socket instanceof TextSocket)
          .map(([name]) => name),
      outputs: () =>
        Object.entries(outputs)
          .filter(([_, output]) => output.socket instanceof TextSocket)
          .map(([name]) => name)
    };
  });
  const engine = new ControlFlowEngine<Schemes>(({ inputs, outputs }) => {
    return {
      inputs: () =>
        Object.entries(inputs)
          .filter(([_, input]) => input.socket instanceof ActionSocket)
          .map(([name]) => name),
      outputs: () =>
        Object.entries(outputs)
          .filter(([_, output]) => output.socket instanceof ActionSocket)
          .map(([name]) => name)
    };
  });

  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Data Input Node', () => new DataNode()],
      ['Sound Node', () => new SoundNode()],
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

  // editor.use(engine);
  // editor.use(dataflow);
  editor.use(engine2);
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

  const population = new DataNode();
  const sound = new SoundNode();
  const output = new OutputNode();

  const con1 = new Connection(population, 'value', sound, 'volume');
  const con2 = new Connection(sound, 'sound_options', output, 'sound_options');

  await editor.addNode(population);
  await editor.addNode(sound);
  await editor.addNode(output);

  await editor.addConnection(con1);
  await editor.addConnection(con2);

  await arrange.layout();

  AreaExtensions.zoomAt(area, editor.getNodes());

  const nodes = editor.getNodes();
  console.log('nodes', nodes);

  function process() {
    console.log('process');
    engine2.reset();

    editor
      .getNodes()
      .filter((n) => n instanceof OutputNode)
      .forEach((n) => engine2.fetch(n.id));
  }

  setInterval(() => {
    process();
  }, 1000);

  return {
    destroy: () => area.destroy()
  };
}
