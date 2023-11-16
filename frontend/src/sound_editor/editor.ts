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

import { type Schemes, Connection, type ConnProps, type NodeProps } from './connections';
import { getConnectionSockets } from './utils';
import { BaseNode } from './nodes/base_node';
import type { AudioEffect, SoundEffectKey } from './nodes/util';
import {
  test_preset,
  type NodeTreePreset,
  preset_traffic,
  preset_elevation
} from './nodes/node_tree_presets';
import { sound_urls } from './nodes/other/sound';

type AreaExtra = VueArea2D<any> | ContextMenuExtra;

const players = new Array<Tone.Player>();

const players2 = Object.entries(sound_urls).reduce(
  (previous_value, [key, value]) => {
    const player = new Tone.Player({
      url: value,
      loop: true,
      autostart: false
    });
    return {
      ...previous_value,
      [key]: player
    };
  },
  {} as { [key: string]: Tone.Player }
);

console.log('players2', players2);

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
          console.log({ sockets, source, target });

          const target_node = editor.getNode(target.nodeId);

          if (target_node instanceof BaseNode) {
            const bnode = target_node as BaseNode;
            if (target.key !== bnode.getOpenInput()) {
              log('Target is occupied', 'error');
              connection.drop();
              return false;
            }
          }

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

  // TODO: maybe unify addPipe and flow stuff? need to research
  editor.addPipe((context) => {
    // console.log('conecction', context.type);
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

  let preset = preset_traffic;

  if (new URLSearchParams(window.location.search).get('preset') === 'elevation') {
    preset = preset_elevation;
  }

  await add_nodes_from_preset(editor, arrange, preset);

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

async function add_nodes_from_preset(
  editor: NodeEditor<Schemes>,
  arrange: AutoArrangePlugin<Schemes, AreaExtra>,
  preset: NodeTreePreset
) {
  for (const node of Object.values(preset.nodes)) {
    await editor.addNode(node);
  }

  for (const connection_info of preset.connections) {
    let target_input = connection_info.targetInput;

    if (preset.nodes[connection_info.target] instanceof BaseNode) {
      console.log('Base Node');
      const b_target_node = preset.nodes[connection_info.target] as BaseNode;
      target_input = b_target_node.getOpenInput();
    }

    // need to create connection here because otherwise it says there's no
    // such input on nodes with a dynamic number of inputs
    const connection = new Connection<NodeProps, NodeProps>(
      preset.nodes[connection_info.source],
      connection_info.sourceOutput as never,
      preset.nodes[connection_info.target],
      target_input as never
    ); // (am i just bad at typescript? is it the libraries fault? we will never know)

    await editor.addConnection(connection);
  }

  await arrange.layout();
}

let sound_nodes = new Array<Tone.ToneAudioNode>();

const audio_debug = document.createElement('div');
audio_debug.classList.add('debug');
audio_debug.id = 'audio-debug';
document.body.appendChild(audio_debug);

export function handle_output(output_tracks: Array<{ effects: Array<AudioEffect> }>): void {
  console.log('tracks:', output_tracks);

  audio_debug.innerHTML = `
    Tracks: ${output_tracks.length}
    <br>

    ${output_tracks
      .map((track) => {
        return `
        Effects: ${track.effects.length}
        <br>
        ${track.effects
          .map((effect) => {
            return `
          ${effect.type}:
          <br>
          - settings: ${JSON.stringify(effect.settings)}:
          <br>
          - meta${JSON.stringify(effect.meta)}:
            
          `;
          })
          .join('<br>')}
      `;
      })
      .join('<br>')}
  
  `;

  if (rebuild) {
    // TODO: only remove the players that aren't needed anymore
    players.forEach((player) => {
      player.stop();
    });

    players.length = 0;
  }

  output_tracks.forEach((output) => {
    if (rebuild) {
      rebuild_audio_nodes(output.effects);
      connect_audio_nodes();
      // player.chain
    }

    console.log('sound nodes:', sound_nodes.length, sound_nodes);

    sound_nodes.forEach((sound_node, i) => {
      const settings = output.effects[i].settings;

      if (settings) {
        for (const [key, value] of Object.entries(settings)) {
          const nd = (sound_node as any)[key];
          console.log('setting', nd.value, 'value to', value);
          nd.value = value;
        }
      }
    });
  });

  if (rebuild) {
    console.log({ players });
  }

  rebuild = false;
}

// const gainNode = new Tone.Gain(1).toDestination();
// const pannerNode = new Tone.Panner(-1);
// pannerNode.connect(gainNode);
// player.connect(pannerNode);

function rebuild_audio_nodes(effects: Array<AudioEffect>) {
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

        const _player = players2[effect.meta!.sound_id];
        console.log('url', url);
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
