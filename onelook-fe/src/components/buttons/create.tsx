import { ActionIcon, Anchor, Button, ButtonProps } from '@mantine/core';
import { useCreateButton } from '@refinedev/core';
import {
  RefineButtonClassNames,
  RefineCreateButtonProps,
} from '@refinedev/ui-types';
import { IconProps, IconSquarePlus } from '@tabler/icons-react';
import React from 'react';

type CreateButtonProps = RefineCreateButtonProps<
  ButtonProps,
  {
    svgIconProps?: Omit<IconProps, 'ref'>;
  }
>;

export const CreateButton: React.FC<CreateButtonProps> = ({
  resource: resourceNameFromProps,
  resourceNameOrRouteName,
  hideText = false,
  accessControl,
  svgIconProps,
  meta,
  children,
  onClick,
  ...rest
}) => {
  const { to, label, title, disabled, hidden, LinkComponent } = useCreateButton(
    {
      resource: resourceNameFromProps ?? resourceNameOrRouteName,
      accessControl,
      meta,
    },
  );

  if (hidden) return null;

  const { variant, styles, ...commonProps } = rest;

  return (
    <Anchor
      component={LinkComponent as any}
      to={to}
      replace={false}
      onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {hideText ? (
        <ActionIcon
          title={title}
          disabled={disabled}
          aria-label={label}
          color='primary'
          {...(variant
            ? {
                variant,
              }
            : { variant: 'filled' })}
          className={RefineButtonClassNames.CreateButton}
          // {...commonProps}
        >
          <IconSquarePlus size={18} {...svgIconProps} />
        </ActionIcon>
      ) : (
        <Button
          disabled={disabled}
          leftSection={<IconSquarePlus size={18} {...svgIconProps} />}
          title={title}
          className={RefineButtonClassNames.CreateButton}
          variant='filled'
          {...rest}
        >
          {children ?? label}
        </Button>
      )}
    </Anchor>
  );
};
