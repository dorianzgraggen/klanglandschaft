import { NodeEditor } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ClassicFlow, ConnectionPlugin, getSourceTarget } from 'rete-connection-plugin';
import { AutoArrangePlugin, Presets as ArrangePresets } from 'rete-auto-arrange-plugin';
import { DataflowEngine } from 'rete-engine';
import {
  type ContextMenuExtra,
  ContextMenuPlugin,
  Presets as ContextMenuPresets
} from 'rete-context-menu-plugin';
import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin';

import * as Tone from 'tone';

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

import { type Schemes, Connection } from './connections';
import { getConnectionSockets } from './utils';

type AreaExtra = VueArea2D<any> | ContextMenuExtra;

const player = new Tone.Player({
  loop: true
});

export async function init_editor(
  container: HTMLElement,
  log: (text: string, type: 'info' | 'error') => void
) {
  setup_audio();

  // Setup
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VuePlugin<Schemes, AreaExtra>();
  const arrange = new AutoArrangePlugin<Schemes, AreaExtra>();
  const engine = new DataflowEngine<Schemes>();

  area.use(create_context_menu());

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

  await add_default_nodes(editor, arrange);

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
}

let rebuild = true;

function setup_audio() {
  player.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3');

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'q') {
        return;
      }
      rebuild_audio_nodes();
      player.start();
    },
    false
  );
}

async function add_default_nodes(
  editor: NodeEditor<Schemes>,
  arrange: AutoArrangePlugin<Schemes, AreaExtra>
) {
  const population = new DataNode();
  const sound = new SoundNode();
  const output = new OutputNode(handle_output);
  const volume = new VolumeNode();
  const time = new TimeNode();
  const sine = new SineNode();
  const add = new AddNode(0);
  const multiply = new MultiplyNode(1);
  const multiply_time = new MultiplyNode(1);
  const pan = new PanNode();

  const connections = [
    new Connection(sound, 'sound_out', volume, 'sound_in'),
    new Connection(pan, 'sound_out', output, 'sound_in'),
    new Connection(population, 'value_out', volume, 'value_in'),
    new Connection(volume, 'sound_out', pan, 'sound_in'),

    new Connection(time, 'seconds', multiply_time, 'value_in'),
    new Connection(multiply_time, 'value_out', sine, 'value_in'),
    new Connection(sine, 'value_out', add, 'value_in'),
    new Connection(add, 'value_out', multiply, 'value_in'),
    new Connection(multiply, 'value_out', pan, 'value_in')
  ];

  await editor.addNode(population);
  await editor.addNode(sound);
  await editor.addNode(output);
  await editor.addNode(volume);
  await editor.addNode(pan);

  await editor.addNode(time);
  await editor.addNode(sine);
  await editor.addNode(add);
  await editor.addNode(multiply);
  await editor.addNode(multiply_time);

  for (const connection of connections) {
    await editor.addConnection(connection);
  }

  await arrange.layout();
}

function handle_output(output: { id: string; volume: number; pan: number }): void {
  console.log(output);
  if (rebuild) {
    rebuild = false;
  }
  gainNode.gain.value = output.volume;
  pannerNode.pan.value = output.pan;
}

const gainNode = new Tone.Gain(1).toDestination();
const pannerNode = new Tone.Panner(-1);
pannerNode.connect(gainNode);
player.connect(pannerNode);

function rebuild_audio_nodes() {
  console.log('rebuilding');
  // TODO: implement
}

function create_context_menu() {
  return new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Data Input Node', () => new DataNode()],
      ['Sound Node', () => new SoundNode()],
      ['Time Node', () => new TimeNode()],
      ['Multiply Node', () => new MultiplyNode()],
      ['Add Node', () => new AddNode()],
      ['Volume Node', () => new VolumeNode()],
      ['Panner Node', () => new PanNode()],
      ['Sine Node', () => new SineNode()],
      ['Output Node', () => new OutputNode(handle_output)]
    ])
  });
}
