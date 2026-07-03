import { API_BASE_URL } from '@/utils/data';
import type { ErrorResponse, SuccessResponse } from '@/utils/types';
import { ofetch, type FetchError } from 'ofetch';
import { ref, shallowRef, watch } from 'vue';

type PaginatedResponse<T> = { total: number; page: number; pageSize: number; data: T };

export function useRead<TResponse = SuccessResponse, Paginated extends boolean = false>(
  url: string,
  withCredentials = false,
  paginationData: Paginated extends true ? { route: any; router: any } : null = null as any
) {
  const loading = shallowRef(false);
  const error = ref<ErrorResponse | null>(null);

  // Conditional type: if paginated, response.value is TResponse, otherwise TResponse
  const response = ref<Paginated extends true ? TResponse : TResponse>();

  const params = new URLSearchParams(window.location.search);
  const page = shallowRef(paginationData ? Number(params.get('page')) || 1 : 0);
  const pageSize = shallowRef(paginationData ? Number(params.get('pageSize')) || 10 : 0);
  const pageCount = shallowRef(0);

  async function start(): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (withCredentials) {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const lastUserAgent = localStorage.getItem('lastUserAgent');
      if (lastUserAgent) headers['Last-User-Agent'] = lastUserAgent;
    }

    try {
      loading.value = true;
      error.value = null;

      const extension = paginationData ? `?page=${page.value}&pageSize=${pageSize.value}` : '';

      // Fetch with conditional type
      const readResult = await ofetch<
        Paginated extends true ? PaginatedResponse<TResponse> : TResponse
      >(API_BASE_URL + url + extension, { method: 'GET', headers });

      if (paginationData) {
        // Type narrowing for paginated response
        const paged = readResult as PaginatedResponse<TResponse>;
        response.value = paged.data as any;
        pageCount.value = Math.ceil(paged.total / pageSize.value);
      } else {
        response.value = readResult as any;
      }
    } catch (err) {
      if ((err as FetchError).response) {
        const fetchErr = err as FetchError<ErrorResponse>;
        error.value = fetchErr.data || { message: fetchErr.message };
      } else {
        error.value = { message: (err as Error).message };
      }
    } finally {
      loading.value = false;
    }
  }

  // Watchers for pagination
  watch([page, pageSize], async ([newPage, newPageSize]) => {
    await paginationData?.router?.push({
      query: {
        ...paginationData?.route.query,
        page: newPage,
        pageSize: newPageSize
      }
    });
  });

  watch(
    () => [paginationData?.route.query.page, paginationData?.route.query.pageSize],
    async ([newPage, newPageSize]) => {
      if (newPage != page.value || newPageSize !== pageSize.value) {
        page.value = Number(newPage);
        pageSize.value = Number(newPageSize);
      }
      start();
    }
  );

  return { start, loading, error, response, page, pageSize, pageCount };
}
