import { mount } from '@vue/test-utils'
import { describe, it, expect, test } from 'vitest'
import StatisticsComp from './StatisticsComp.vue'

test('stats', () => {
    const wrapper = mount(StatisticsComp);

    const statsTraffic = wrapper.find('#stats-traffic');
    expect(statsTraffic.attributes('style')).toContain('width: 20');
});

