import { mount } from '@vue/test-utils';
import { describe, it, expect, test } from 'vitest';
import StatisticsComp from './StatisticsComp.vue';
import { bridge } from '@/global';

describe('StatisticsComp.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(StatisticsComp);
    expect(wrapper.exists()).toBe(true);
  });

  it('computes percentage values correctly', async () => {
    // Mock bridge values
    bridge.elevation = 0.5;
    bridge.traffic_noise = 0.6;
    bridge.buildings = 0.7;
    const wrapper = mount(StatisticsComp);

    const vm = wrapper.vm as any;

    await wrapper.vm.$nextTick();

    expect(vm.stats.elevation.percentageValue).toBe(50);
    expect(vm.stats.traffic_noise.percentageValue).toBe(60);
    expect(vm.stats.buildings.percentageValue).toBe(70);
  });
});
