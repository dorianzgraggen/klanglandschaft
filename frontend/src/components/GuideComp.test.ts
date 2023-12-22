import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import GuideComp from './GuideComp.vue';

describe('GuideComp.vue', () => {
  const wrapper = mount(GuideComp, { props: { mainTitle: 'guide'}});

  it('renders without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('checks guide button hide button and show content functionality', async () => {

    await wrapper.find('#guide-button').trigger('click');
    expect(wrapper.get('#guide-content').isVisible()).toBe(true);
  });

  it('renders image', () => async () =>{
    await wrapper.vm.$nextTick();
    expect(wrapper.find('img').attributes('src')).toBe('../assets/questionmark-icon.png')
  })
})