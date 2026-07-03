import { onMounted, onUnmounted } from 'vue';

export function useSsoSignin(successRedirect?: string) {
  let popup = null;
  const domain = 'https://khudroshop.com';

  function openPopup() {
    popup = window.open(`${domain}/sso`, 'LoginWithKhudroshop', 'width=500,height=600');
  }

  function handleMessage(event: any) {
    const msg = event.data;

    // A asks for origin
    if (msg?.type === 'REQUEST_ORIGIN') {
      event.source.postMessage(
        {
          type: 'ORIGIN_INFO',
          requester: window.location.origin
        },
        event.origin
      );
      return;
    }

    // A sends token
    if (msg?.type === 'TOKEN') {
      localStorage.setItem('accessToken', msg.token);
      popup?.close();
      location.href = successRedirect || '/customer';
    }
  }

  onMounted(() => window.addEventListener('message', handleMessage));
  onUnmounted(() => window.removeEventListener('message', handleMessage));

  return { openPopup };
}
