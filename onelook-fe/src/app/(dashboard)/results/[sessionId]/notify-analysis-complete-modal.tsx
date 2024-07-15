import { SaveButton } from '@/components/buttons/save';
import { useForm } from '@/hooks/use-form';
import { Resource } from '@/types';
import { notifyOk } from '@/utils/notifications';
import { Group, Stack, Text, TextInput } from '@mantine/core';
import { isEmail } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useResourceParams } from '@refinedev/core';

const modalId = 'notify-analysis-complete-modal';

export default function NotifyAnalysisCompleteModal() {
  const { id } = useResourceParams();
  console.log(id);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: isEmail('Invalid email'),
    },
    refineCoreProps: {
      resource: 'session-analysis-completed-notifications' satisfies Resource,
      meta: {
        sessionId: id,
      },
      onMutationSuccess: () => {
        notifyOk(
          'Subscribed successfully. We will notify you when analysis is complete.',
        );
        modals.close(modalId);
      },
    },
  });

  function handleSubmit() {}

  return (
    <Stack>
      <div>
        <Text fz="sm" c="dimmed">
          Enter your email to be notified when analysis is complete.
        </Text>
        <Text fz="sm" c="dimmed">
          We will not share your email or use it for any other purposes.
        </Text>
      </div>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            {...form.getInputProps('email')}
          />

          <Group justify="flex-end">
            <SaveButton type="submit" {...form.saveButtonProps}>
              Notify Me
            </SaveButton>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}

NotifyAnalysisCompleteModal.open = function openNotifyAnalysisCompleteModal() {
  modals.open({
    modalId,
    children: <NotifyAnalysisCompleteModal />,
    withCloseButton: false,
    closeOnEscape: false,
  });
};
