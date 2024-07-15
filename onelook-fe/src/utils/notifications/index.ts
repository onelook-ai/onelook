import { notifications } from '@mantine/notifications';

export function notifyOk(message: string) {
  notifications.show({
    message,
    color: 'green',
  });
}
