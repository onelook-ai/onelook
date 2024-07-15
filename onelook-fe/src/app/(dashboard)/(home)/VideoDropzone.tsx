import { maxFileSize } from '@/constants';
import { Group, Text, rem } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconCloudUpload, IconDownload, IconX } from '@tabler/icons-react';

const maxSizeLabel = '2GB';
const rejectMsg = `Only Mp4/Webm file less than ${maxSizeLabel} accepted`;

interface Props {
  onDrop: (file: File) => void;
}

export default function VideoDropzone({ onDrop }: Props) {
  return (
    <Dropzone
      onDrop={(files) => {
        files[0] && onDrop(files[0]);
      }}
      onReject={() => {
        notifications.show({
          message: rejectMsg,
          color: 'yellow',
        });
      }}
      maxSize={maxFileSize}
      maxFiles={1}
      accept={[MIME_TYPES.mp4, 'video/webm']}
    >
      <Group justify="center">
        <Dropzone.Accept>
          <IconDownload
            style={{ width: rem(50), height: rem(50) }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconCloudUpload
            style={{ width: rem(50), height: rem(50) }}
            stroke={1.5}
          />
        </Dropzone.Idle>
      </Group>

      <Text ta="center" fw={700} fz="lg" mt="xl">
        <Dropzone.Accept>Drop video here</Dropzone.Accept>
        <Dropzone.Reject>{rejectMsg}</Dropzone.Reject>
        <Dropzone.Idle>Upload video</Dropzone.Idle>
      </Text>
      <div>
        <Text ta="center" fz="sm" mt="xs" c="dimmed">
          Drag&apos;n&apos;drop files here to upload. We can accept only{' '}
          <i>.mp4</i> and <i>.webm</i> files that are less than {maxSizeLabel}{' '}
          in size.
        </Text>
      </div>
    </Dropzone>
  );
}
