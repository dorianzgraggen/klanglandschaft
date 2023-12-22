import { mount } from '@vue/test-utils';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import { test, expect } from 'vitest';
import { loaded_audios } from '@/global';
import { it } from 'node:test';

test('LoadingIndicator.vue', async () =>  {
    const wrapper = mount(LoadingIndicator);

    it('renders without errors', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('checks if 8 loaded audios lead to 100% loading indicator', async () => {
        loaded_audios.value = 8;

        await wrapper.vm.$nextTick();

        const percentageDiv = wrapper.get('div');
        expect(percentageDiv.text()).toBe('100%');
    });
});