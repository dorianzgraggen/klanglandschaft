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
  MathNodes,
  DataNode,
  OutputNode,
  PanNode,
  SoundNode,
  VibratoNode,
  VolumeNode,
  ReverbNode
  , DistortionNode
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
import { data_types } from './nodes/other/data';
import { PitchNode } from './nodes/effects/pitch';
import { layers, settings } from '@/global';
import { watch } from 'vue';



type AreaExtra = VueArea2D<any> | ContextMenuExtra;

/**
 * Each soundtrack has its own Tone.Player and the audio is loaded as soon as the editor is opened.
 * The player is always the beginning of a connection of nodes (the source, quasi), but a single
 * player can be the beginning of multiple connection paths.
 *  */
const all_players = Object.entries(sound_urls).reduce(
  (previous_value, [key, value]) => {
    const player = new Tone.Player({
      url: value.url,
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

const ramp_duration = 0.5;

const player_of_current_node_tree = new Array<Tone.Player>();

const end_gains = new Array<Tone.Gain>();

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

      rebuild = true;

      set_input_step_sizes(container);
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

      rebuild = true;

      set_input_step_sizes(container);
    }
    return context;
  });

  editor.addPipe((context) => {
    if (context.type === 'nodecreated') {
      set_input_step_sizes(container);
      check_data_nodes(editor);
    }
    return context;
  });

  editor.addPipe((context) => {
    if (context.type === 'noderemoved') {
      check_data_nodes(editor);
    }
    return context;
  });

  let preset = preset_traffic;

  if (new URLSearchParams(window.location.search).get('preset') === 'elevation') {
    preset = preset_elevation;
  }

  await add_nodes_from_preset(editor, arrange, preset);

  watch(settings, (old_settings, new_settings) => {
    if (!new_settings.editor_open) {
      return;
    }

    window.setTimeout(() => {
      AreaExtensions.zoomAt(area, editor.getNodes());
    }, 0);
  });

  set_input_step_sizes(container);

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

let rebuild = true;

export async function play() {
  for (const player of player_of_current_node_tree) {
    await player.context.resume();
    player.start();
    console.log('started');
  }
}

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
          play();
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

const sound_nodes_per_track = new Array<Array<Tone.ToneAudioNode>>();

const audio_debug = document.createElement('div');
audio_debug.classList.add('debug');
audio_debug.id = 'audio-debug';
document.body.appendChild(audio_debug);

export function handle_output(output_tracks: Array<{ effects: Array<AudioEffect> }>): void {
  // console.log('tracks:', output_tracks);

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
  
      <br>
      Outputs: ${Tone.getDestination().numberOfInputs}
  `;

  if (rebuild) {
    // TODO: only remove the players that aren't needed anymore
    // player_of_current_node_tree.forEach((player) => {
    //   player.stop();
    // });

    end_gains.forEach((gain) => {
      gain.gain.linearRampTo(0, ramp_duration);
    });

    end_gains.length = 0;

    player_of_current_node_tree.length = 0;
  }

  output_tracks.forEach((current_output_track, index) => {
    if (rebuild) {
      rebuild_audio_nodes(current_output_track.effects, index);
      connect_audio_nodes(index);
      // player.chain
    }

    const sound_nodes = sound_nodes_per_track[index];

    if (typeof sound_nodes === 'undefined') {
      return; // current sound nodes haven't been created yet
    }

    sound_nodes.forEach((sound_node, i) => {
      const effect = current_output_track.effects[i];
      if (typeof effect === 'undefined') {
        return;
      }
      const settings = effect.settings;
      if (settings) {
        for (const [key, value] of Object.entries(settings)) {
          const nd = (sound_node as any)[key];
          // console.('setting', nd.value, 'value to', value);
          nd.value = value;
        }
      }

      if (effect.meta) {
        if (typeof effect.meta.pitch !== 'undefined') {
          (sound_node as any).pitch = effect.meta.pitch;
        }

        if (typeof effect.meta.distortion !== 'undefined') {
          (sound_node as any).distortion = effect.meta.distortion;
        }
      }
    });
  });

  if (rebuild) {
    console.log({ players: player_of_current_node_tree });
  }

  rebuild = false;
}

function rebuild_audio_nodes(effects: Array<AudioEffect>, output_index: number) {
  console.log('rebuilding');
  sound_nodes_per_track[output_index] = effects.map((effect) => {
    switch (effect.type) {
      case 'gain':
        return new Tone.Gain();

      case 'pan':
        return new Tone.Panner();

      case 'vibrato':
        return new Tone.Vibrato();

      case 'pitch': {
        const pitch = new Tone.PitchShift();
        pitch.wet.value = 1;
        return pitch;
      }

      case 'distortion':
        return new Tone.Distortion();

      case 'reverb':
        return new Tone.Reverb();

      case 'source': {
        const url = effect.meta!.url as string;

        const _player = all_players[effect.meta!.sound_id];
        console.log('url', url);
        // _player.load(url);
        player_of_current_node_tree.push(_player);
        return _player;
      }
    }
  });
}

function connect_audio_nodes(output_index: number) {
  // player.connect("", 2, )

  const sound_nodes = sound_nodes_per_track[output_index];
  console.log(sound_nodes);

  // player.connect(current_nodes[0]);

  for (let i = 0; i < sound_nodes.length - 1; i++) {
    const current = sound_nodes[i];
    const next = sound_nodes[i + 1];
    current.connect(next);
  }

  const last_node = sound_nodes[sound_nodes.length - 1];
  const end_gain = new Tone.Gain(0);
  last_node.connect(end_gain);
  end_gain.gain.linearRampTo(1, ramp_duration);
  end_gain.toDestination();
  end_gains.push(end_gain);
  // player.chain(...sound_nodes, Tone.Destination);
}

function create_context_menu() {
  return new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      [
        'Data',
        Object.entries(data_types).map(([key, value]) => {
          return [value, () => new DataNode(key)];
        })
      ],
      [
        'Effects',
        [
          ['Volume Node', () => new VolumeNode()],
          ['Vibrato Node', () => new VibratoNode()],
          ['Pitch Node', () => new PitchNode()],
          ['Panner Node', () => new PanNode()],
          ['Reverb Node', () => new ReverbNode()],
          ['Distortion Node', () => new DistortionNode()]
        ]
      ],
      [
        'Sounds',
        Object.entries(sound_urls).map(([key, value]) => {
          return [value.title, () => new SoundNode(key)];
        })
      ],
      [
        'Math',
        [
          ['Add', () => new MathNodes.AddNode()],
          ['Subtract', () => new MathNodes.SubtractNode()],
          ['Multiply', () => new MathNodes.MultiplyNode()],
          ['Divide', () => new MathNodes.DivideNode()],
          ['Max', () => new MathNodes.MaxNode()],
          ['Min', () => new MathNodes.MinNode()],
          ['Sine', () => new MathNodes.SineNode()],
          ['Time', () => new MathNodes.TimeNode()]
        ]
      ]
    ])
  });
}

function set_input_step_sizes(parent: HTMLElement) {
  setTimeout(() => {
    const inputs = parent.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.step = '0.1';
    });
  }, 200);
}

function check_data_nodes(editor: NodeEditor<Schemes>) {
  const nodes = editor.getNodes().filter((n) => n instanceof DataNode) as Array<DataNode>;

  Object.keys(layers).forEach((key) => {
    const node = nodes.find((n) => n.type === key);

    (layers as { [key: string]: number })[key] = node ? 1 : 0.26;
  });

  settings.rerender = true;
}
