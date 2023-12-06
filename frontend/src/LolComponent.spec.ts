import { mount } from '@vue/test-utils';
import LolComponent from './LolComponent.vue';
import { expect, test } from 'vitest';
const wrapper = mount(LolComponent);

test('has Miauu', async () => {
  expect(LolComponent).toContain('miau');
});
