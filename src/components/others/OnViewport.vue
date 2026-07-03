<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

type Direction = 'left' | 'right' | 'up' | 'down';

const props = withDefaults(
  defineProps<{
    direction?: Direction;
    distance?: number;
    duration?: number;
    once?: boolean;
    threshold?: number;
  }>(),
  {
    direction: 'left',
    distance: 40,
    duration: 600,
    once: false,
    threshold: 0.25
  }
);

const el = ref<HTMLElement | null>(null);
const shown = ref(false);

let observer: IntersectionObserver | null = null;

const transform = computed(() => {
  switch (props.direction) {
    case 'left':
      return `translateX(-${props.distance}px)`;
    case 'right':
      return `translateX(${props.distance}px)`;
    case 'up':
      return `translateY(${props.distance}px)`;
    case 'down':
      return `translateY(-${props.distance}px)`;
  }
});

onMounted(() => {
  if (!el.value) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        shown.value = true;
        if (props.once && observer) observer.disconnect();
      } else if (!props.once) {
        shown.value = false;
      }
    },
    { threshold: props.threshold }
  );

  observer.observe(el.value);
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div
    ref="el"
    class="reveal"
    :class="{ shown }"
    :style="{
      '--reveal-duration': duration + 'ms',
      '--reveal-transform': transform
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: var(--reveal-transform);
  transition:
    opacity var(--reveal-duration) ease-out,
    transform var(--reveal-duration) ease-out;
  will-change: transform, opacity;
}

.reveal.shown {
  opacity: 1;
  transform: translate(0, 0);
}
</style>
