import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export function formatElapsedSecs(elapsedSecs: number) {
  const time = dayjs.duration(elapsedSecs, 'seconds');
  const format = time.hours() > 0 ? 'H:mm:ss' : 'mm:ss';
  return time.format(format);
}
