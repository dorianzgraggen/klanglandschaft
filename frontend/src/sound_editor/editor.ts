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
  SineNode,
  VibratoNode
} from './nodes';

import { type Schemes, Connection } from './connections';
import { getConnectionSockets } from './utils';
import { BaseNode } from './nodes/base_node';
import type { AudioEffect, SoundEffectKey } from './nodes/util';

type AreaExtra = VueArea2D<any> | ContextMenuExtra;

const players = new Array<Tone.Player>();

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
    console.log('conecction', context.type);
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

  editor.addPipe((context) => {
    if (context.type === 'connectioncreated') {
      const node = editor.getNode(context.data.target);
      console.log('node', node);

      if (node instanceof BaseNode) {
        const bnode = node as BaseNode;
        console.log('instance+');
        if (context.data.targetInput.includes('sound_in')) {
          bnode.addSoundInput();
          area.update('node', context.data.target);
        }
      }
    }
    return context;
  });

  editor.addPipe((context) => {
    if (context.type === 'connectionremoved') {
      const node = editor.getNode(context.data.target);
      console.log('removed', context.data, node);

      if (node instanceof BaseNode) {
        const bnode = node as BaseNode;
        if (context.data.targetInput.includes('sound_in')) {
          bnode.removeSoundInput(context.data.targetInput);
          area.update('node', context.data.target);
        }
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

    // editor.getNodes().forEach((n) => area.update('node', n.id));
  }

  setInterval(() => {
    process();
  }, 100);
}

let rebuild = false;

function setup_audio() {
  window.addEventListener(
    'keydown',
    async (e) => {
      switch (e.key) {
        case 'q': {
          rebuild = true;
          break;
        }

        case 'e': {
          for (const player of players) {
            console.log('start');
            await player.context.resume();
            player.start();
            console.log('started');
          }
          break;
        }

        default:
          break;
      }
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
  const vibrato = new VibratoNode();

  const connections = [
    new Connection(sound, 'sound_out', volume, 'sound_in'),
    new Connection(population, 'value_out', volume, 'value_in'),
    new Connection(volume, 'sound_out', pan, 'sound_in'),

    new Connection(time, 'seconds', multiply_time, 'value_in'),
    new Connection(multiply_time, 'value_out', sine, 'value_in'),
    new Connection(sine, 'value_out', add, 'value_in'),
    new Connection(add, 'value_out', multiply, 'value_in'),
    new Connection(multiply, 'value_out', pan, 'value_in'),

    new Connection(pan, 'sound_out', vibrato, 'sound_in'),
    new Connection(vibrato, 'sound_out', output, 'sound_in #1')
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

  await editor.addNode(vibrato);

  for (const connection of connections) {
    await editor.addConnection(connection);
  }

  await arrange.layout();
}

let sound_nodes = new Array<Tone.ToneAudioNode>();

function handle_output(output: { effects: Array<AudioEffect> }): void {
  // console.log(output);
  if (rebuild) {
    rebuild = false;
    rebuild_audio_nodes(output.effects);
    connect_audio_nodes();
    // player.chain
  }

  sound_nodes.forEach((sound_node, i) => {
    const settings = output.effects[i].settings;

    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        (sound_node as any)[key].value = value;
      }
    }
  });
}

// const gainNode = new Tone.Gain(1).toDestination();
// const pannerNode = new Tone.Panner(-1);
// pannerNode.connect(gainNode);
// player.connect(pannerNode);

function rebuild_audio_nodes(effects: Array<AudioEffect>) {
  // TODO: only remove the players that aren't needed anymore
  players.forEach((player) => {
    player.stop();
  });

  players.length = 0;

  console.log('rebuilding');
  sound_nodes = effects.map((effect) => {
    switch (effect.type) {
      case 'gain':
        return new Tone.Gain();

      case 'pan':
        return new Tone.Panner();

      case 'vibrato':
        return new Tone.Vibrato();

      case 'source': {
        const url = effect.meta!.url as string;
        const _player = new Tone.Player({
          url,
          loop: true
        });
        console.log('ulr', url);
        // _player.load(url);
        players.push(_player);
        return _player;
      }
    }
  });

  // TODO: implement
}

function connect_audio_nodes() {
  // player.connect("", 2, )

  console.log(sound_nodes);

  // player.connect(sound_nodes[0]);

  for (let i = 0; i < sound_nodes.length - 1; i++) {
    const current = sound_nodes[i];
    const next = sound_nodes[i + 1];
    current.connect(next);
  }

  sound_nodes[sound_nodes.length - 1].toDestination();
  // player.chain(...sound_nodes, Tone.Destination);
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
      ['Tremolo Node', () => new VibratoNode()],
      ['Panner Node', () => new PanNode()],
      ['Sine Node', () => new SineNode()],
      ['Output Node', () => new OutputNode(handle_output)]
    ])
  });
}
