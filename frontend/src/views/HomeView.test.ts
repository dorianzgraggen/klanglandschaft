import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import HomeView from './HomeView.vue';

describe('HomeView.vue', () => {
  const wrapper = mount(HomeView);

  it('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('passes correct props to GuideComp', () => {
    const wrapper = mount(HomeView);
    const guideComp = wrapper.findComponent({ name: 'GuideComp' });

    expect(guideComp.props('title')).toBe('dashboard');
    expect(guideComp.props('iconSize')).toBe(24);
    expect(guideComp.props('height')).toBe('60%');
  });
})