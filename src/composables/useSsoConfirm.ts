import { ref, onMounted, onUnmounted } from 'vue';

export function useSsoConfirm() {
  const requester = ref(null);

  function askForOpenerOrigin() {
    // Ask opener (Site B) for its domain
    window.opener.postMessage({ type: 'REQUEST_ORIGIN' }, '*');
  }

  function handleMessage(event: any) {
    if (event.data?.type === 'ORIGIN_INFO') {
      requester.value = event.data.requester;
    }
  }

  function approve() {
    const token = localStorage.getItem('customerToken');

    window.opener.postMessage({ type: 'TOKEN', token }, requester.value);

    window.close();
  }

  function cancel() {
    window.close();
  }

  onMounted(() => {
    window.addEventListener('message', handleMessage);

    // Immediately request site info
    askForOpenerOrigin();
  });

  onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
  });

  return { requester, approve, cancel };
}
