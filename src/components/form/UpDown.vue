<script lang="ts" setup>
import { useCart } from '@/composables/useCart';
import { ChevronDownOutline, ChevronUpOutline } from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import { shallowRef } from 'vue';

type Props = {
  modelValue: number;
};

const props = defineProps<Props>();

const { direction } = useCart();

const emit = defineEmits(['update:modelValue']);

const increase = () => {
  emit('update:modelValue', props.modelValue + 1);
};

const decrease = () => {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1);
  }
};
</script>

<template>
  <div class="flex flex-col items-center">
    <NButton size="small" quaternary @click="increase">
      <NIcon>
        <ChevronUpOutline />
      </NIcon>
    </NButton>
    <span class="font-medium text-xs">
      <transition
        enter-active-class="transition duration-300"
        leave-active-class="transition duration-300"
        :enter-from-class="
          direction === 'down' ? 'opacity-0 translate-y-2' : 'opacity-0 -translate-y-2'
        "
        :leave-to-class="
          direction === 'down' ? 'opacity-0 -translate-y-2' : 'opacity-0 translate-y-2'
        "
        mode="out-in"
      >
        <span :key="modelValue" class="inline-block">
          {{ modelValue }}
        </span>
      </transition>
    </span>
    <NButton size="small" quaternary @click="decrease">
      <NIcon>
        <ChevronDownOutline />
      </NIcon>
    </NButton>
  </div>
</template>
