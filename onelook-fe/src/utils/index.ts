import dayjs from 'dayjs';

import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(duration);

const ERR_NAME = '__INVARIANT__';

/**
 * Creates an invariant error if condition is met.
 */
export function invariant(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) {
    const err = new Error(message);
    err.name = ERR_NAME;
    throw err;
  }
}

/**
 * Gets invariant message or default Bad Request message.
 */
export function getInvariantMessage(err: Error) {
  return err.name === ERR_NAME ? err.message : 'Bad Request';
}
