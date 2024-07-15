import { DataProvider } from '@refinedev/core';
import { AxiosInstance } from 'axios';
import queryString from 'query-string';
import { getResourceUrl } from './resource-utils';
import { axiosInstance, generateFilter, generateSort } from './utils';

type MethodTypes = 'get' | 'delete' | 'head' | 'options';
type MethodTypesWithBody = 'post' | 'put' | 'patch';

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): Omit<
  Required<DataProvider>,
  'createMany' | 'updateMany' | 'deleteMany'
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = getResourceUrl({ apiUrl, resource, meta });

    const { current = 1, pageSize = 10, mode = 'server' } = pagination ?? {};

    const {
      headers: headersFromMeta,
      method,
      query: queryFromMeta,
    } = meta ?? {};

    const requestMethod = (method as MethodTypes) ?? 'get';

    const queryFilters = generateFilter(filters);

    const query: {
      page?: number;
    } = {};

    if (mode === 'server') {
      query.page = current;
    }

    // const generatedSort = generateSort(sorters);
    // if (generatedSort) {
    //   const { _sort, _order } = generatedSort;
    //   query._sort = _sort.join(',');
    //   query._order = _order.join(',');
    // }

    const combinedQuery = { ...query, ...queryFilters, ...queryFromMeta };
    const urlWithQuery = Object.keys(combinedQuery).length
      ? `${url}?${queryString.stringify(combinedQuery)}`
      : url;

    const authHeaders = await getAuthHeaders();

    const { data } = await httpClient[requestMethod](urlWithQuery, {
      headers: { ...authHeaders, ...headersFromMeta },
    });

    return data;
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const authHeaders = await getAuthHeaders();

    const { data } = await httpClient[requestMethod](
      `${getResourceUrl({ apiUrl, resource, meta })}?${queryString.stringify({ id: ids })}`,
      { headers: { ...authHeaders, ...headers } },
    );

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = getResourceUrl({ apiUrl, resource, meta });

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'post';

    const authHeaders = await getAuthHeaders();

    const { data } = await httpClient[requestMethod](url, variables, {
      headers: { ...authHeaders, ...headers },
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = getResourceUrl({ apiUrl, resource, meta, id });

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'put';

    const authHeaders = await getAuthHeaders();

    const { data } = await httpClient[requestMethod](url, variables, {
      headers: {
        ...authHeaders,
        ...headers,
      },
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = getResourceUrl({ apiUrl, resource, meta, id });

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const authHeaders = await getAuthHeaders();

    const { data } = await httpClient[requestMethod](url, {
      headers: {
        ...authHeaders,
        ...headers,
      },
    });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = getResourceUrl({ apiUrl, resource, meta, id });

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'delete';

    const authHeaders = await getAuthHeaders();

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers: {
        ...authHeaders,
        ...headers,
      },
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }) => {
    let requestUrl = `${url}?`;

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        const sortQuery = {
          _sort: _sort.join(','),
          _order: _order.join(','),
        };
        requestUrl = `${requestUrl}&${queryString.stringify(sortQuery)}`;
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      requestUrl = `${requestUrl}&${queryString.stringify(filterQuery)}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${queryString.stringify(query)}`;
    }

    let axiosResponse;
    switch (method) {
      case 'put':
      case 'post':
      case 'patch':
        axiosResponse = await httpClient[method](url, payload, {
          headers,
        });
        break;
      case 'delete':
        axiosResponse = await httpClient.delete(url, {
          data: payload,
          headers: headers,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers,
        });
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});

async function getAuthHeaders() {
  // const identity = await (authProvider.getIdentity?.() as Promise<
  //   LoggedInUser | undefined
  // >);

  return {
    // Authorization: `Bearer ${identity?.token}`,
  };
}
