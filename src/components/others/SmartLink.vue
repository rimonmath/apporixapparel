<script setup>
import { useRouter } from 'vue-router';
import { onUnmounted } from 'vue';

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  }
});

const router = useRouter();

let hoverTimer = null;
let preloaded = false; // prevents double-loading

const preload = () => {
  if (preloaded) return; // Already loaded once
  preloaded = true;

  const resolved = router.resolve(props.to);

  for (const record of resolved.matched) {
    const comp = record.components?.default;

    if (typeof comp === 'function') {
      comp(); // triggers dynamic import
    }
  }
};

// Delayed hover
const onHoverStart = () => {
  if (preloaded) return;

  hoverTimer = setTimeout(() => {
    preload();
    hoverTimer = null;
  }, 200); // hover delay
};

// Cancel hover preload if mouse leaves early
const onHoverCancel = () => {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
};

// Touchscreen: instant preload on first touch
const onTouchStart = () => {
  preload();
};

// Cleanup
onUnmounted(() => {
  if (hoverTimer) clearTimeout(hoverTimer);
});
</script>

<template>
  <RouterLink
    :to="to"
    @mouseenter="onHoverStart"
    @mouseleave="onHoverCancel"
    @focus="onHoverStart"
    @blur="onHoverCancel"
    @touchstart.passive="onTouchStart"
  >
    <slot />
  </RouterLink>
</template>
