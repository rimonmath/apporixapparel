import { API_BASE_URL } from '@/utils/data';
import type { ErrorResponse, SuccessResponse } from '@/utils/types';
import { ofetch, type FetchError } from 'ofetch';
import { ref, shallowRef } from 'vue';

export function useUpdate<
  TResponse = SuccessResponse,
  TPayload extends Record<string, any> = Record<string, any>
>(withCredentials = false) {
  const loading = shallowRef(false);
  const dialog = shallowRef(false);
  const response = ref<TResponse>();
  const error = ref<ErrorResponse | null>(null);

  async function start(url: string, payload: TPayload): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (withCredentials) {
      const accessToken = localStorage.getItem('accessToken');
      const customerToken = localStorage.getItem('customerToken');

      const computedURL = API_BASE_URL + url;

      console.log(computedURL);

      const token = computedURL.indexOf('/api/store') > -1 ? accessToken : customerToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const lastUserAgent = localStorage.getItem('lastUserAgent');
      if (lastUserAgent) headers['Last-User-Agent'] = lastUserAgent;
    }

    try {
      document.body.classList.add('lazy-loading');
      loading.value = true;
      error.value = null;
      response.value = await ofetch<TResponse>(API_BASE_URL + url, {
        method: 'PUT',
        body: payload, // ✅ now correctly typed
        headers
      });
    } catch (err) {
      if ((err as FetchError).response) {
        const fetchErr = err as FetchError<ErrorResponse>;
        error.value = fetchErr.data || { message: fetchErr.message };
      } else {
        error.value = { message: (err as Error).message };
      }
    } finally {
      loading.value = false;
      document.body.classList.remove('lazy-loading');
    }
  }

  return { start, loading, error, response, dialog };
}
