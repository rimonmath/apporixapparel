import { API_BASE_URL } from '@/utils/data';
import type { ErrorResponse, SuccessResponse } from '@/utils/types';
import { ofetch, type FetchError } from 'ofetch';
import { nextTick, ref, shallowRef, watch } from 'vue';

// let loadingTimer = 0;

// ✅ lightweight debounce util (no lodash needed)
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

type PaginatedResponse<T> = { total: number; page: number; pageSize: number; data: T };

export function useRead<TResponse = SuccessResponse, Paginated extends boolean = false>(
  url: string,
  withCredentials = false,
  paginationData: Paginated extends true
    ? { route: any; router: any; extra: any }
    : null = null as any
) {
  const loading = shallowRef(false);
  const error = ref<ErrorResponse | null>(null);
  const response = ref<Paginated extends true ? TResponse : TResponse>();

  const params = new URLSearchParams(window.location.search);
  const page = shallowRef(paginationData ? Number(params.get('page')) || 1 : 0);
  const pageSize = shallowRef(paginationData ? Number(params.get('pageSize')) || 10 : 0);
  const pageCount = shallowRef(0);
  const s = shallowRef('');
  const lastCalledTime = shallowRef(0);

  async function customStart() {}

  async function start(forceURL = ''): Promise<void> {
    if (lastCalledTime.value + 500 > Date.now()) {
      return;
    }

    lastCalledTime.value = Date.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (withCredentials) {
      const accessToken = localStorage.getItem('accessToken');
      const customerToken = localStorage.getItem('customerToken');

      const computedURL = API_BASE_URL + (forceURL || url);

      console.log(computedURL);

      const token = computedURL.indexOf('/api/store') > -1 ? accessToken : customerToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const lastUserAgent = localStorage.getItem('lastUserAgent');
      if (lastUserAgent) headers['Last-User-Agent'] = lastUserAgent;
    }

    try {
      // loadingTimer = setTimeout(() => {
      //   document.body.classList.add('lazy-loading');
      // }, 1000);
      document.body.classList.add('lazy-loading');
      loading.value = true;
      error.value = null;

      let extension = paginationData
        ? `?page=${page.value}&pageSize=${pageSize.value}&s=${s.value}`
        : '';

      if (paginationData?.extra.value) {
        if (extension) {
          extension += `&` + paginationData?.extra.value;
        } else {
          extension += `?` + paginationData?.extra.value;
        }
      }

      const readResult = await ofetch<
        Paginated extends true ? PaginatedResponse<TResponse> : TResponse
      >(API_BASE_URL + (forceURL || url + extension), { method: 'GET', headers });

      if (paginationData) {
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
      // clearTimeout(loadingTimer);
      document.body.classList.remove('lazy-loading');
    }
  }

  // Watchers for pagination
  watch([page, pageSize], async ([newPage, newPageSize]) => {
    // console.log(newPage, newPageSize);
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
    async ([newPage, newPageSize], [oldPage, oldPageSize]) => {
      if (newPage != page.value || newPageSize != pageSize.value) {
        page.value = Number(newPage) || 1;
        pageSize.value = Number(newPageSize) || 10;
      }

      if (newPageSize != oldPageSize && newPage == oldPage) {
        if (page.value != 1) {
          page.value = 1;
          return;
        }
      }
      start();
    }
  );

  // ✅ Debounced search watcher
  const debouncedStart = debounce(start, 500); // 500ms delay
  watch(s, () => {
    resetPage;
    debouncedStart();
  });

  function resetPage() {
    page.value = 1;
  }

  return { start, loading, error, response, page, pageSize, pageCount, s, resetPage, customStart };
}
