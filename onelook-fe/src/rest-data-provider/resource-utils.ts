import { Resource } from '@/types';
import { invariant } from '@/utils';
import { BaseKey, MetaQuery } from '@refinedev/core';

type MethodTypes = 'get' | 'delete' | 'head' | 'options';
type MethodTypesWithBody = 'post' | 'put' | 'patch';

const resourcePath: Record<
  Resource,
  (params: { id?: BaseKey; meta?: MetaQuery }) => string
> = {
  'analysis-results': ({ id }) => {
    invariant(!!id, 'Missing id');

    return `analysis-results/${id}`;
  },
  'session-analysis-completed-notifications': ({ meta }) => {
    const { sessionId } = meta ?? {};

    invariant(!!sessionId, 'Missing sessionId in meta');

    return `session-analysis-completed-notifications/sessions/${sessionId}`;
  },
};

export const getResourceUrl = ({
  apiUrl,
  resource,
  id,
  meta,
}: {
  apiUrl: string;
  resource: string;
  meta?: MetaQuery;
  id?: BaseKey;
}) => {
  if (!(resource in resourcePath)) {
    console.log('invalid resource name -- ', resource);
    throw new Error('Invalid resource');
  }

  const pathFn = resourcePath[resource as Resource];

  return `${apiUrl}/${pathFn({ id, meta })}`;
};
