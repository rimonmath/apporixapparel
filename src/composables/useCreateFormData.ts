import { API_BASE_URL } from '@/utils/data';
import type { ErrorResponse, SuccessResponse } from '@/utils/types';
import { ofetch, type FetchError } from 'ofetch';
import { ref, shallowRef } from 'vue';

export function useCreateFormData<
  TResponse = SuccessResponse,
  TPayload extends Record<string, any> = Record<string, any>
>(url: string, withCredentials = false, method = 'POST') {
  const loading = shallowRef(false);
  const dialog = shallowRef(false);
  const response = ref<TResponse>();
  const error = ref<ErrorResponse | null>(null);

  async function start(payload: TPayload, customUrl: string | null = null): Promise<void> {
    const formData = new FormData();

    // 🔹 convert payload object into FormData entries
    for (const [key, value] of Object.entries(payload)) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // handle arrays: append with same key
        value.forEach((v) => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    const headers: Record<string, string> = {};
    // headers['Content-Type'] = 'multipart/form-data';
    if (withCredentials) {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const lastUserAgent = localStorage.getItem('lastUserAgent');
      if (lastUserAgent) headers['Last-User-Agent'] = lastUserAgent;
    }

    try {
      document.body.classList.add('lazy-loading');
      loading.value = true;
      error.value = null;

      response.value = await ofetch<TResponse>(API_BASE_URL + (customUrl || url), {
        method,
        body: formData, // ✅ send FormData, no need for Content-Type
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
