import React, { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import cn from 'classnames';
import { Cross2Icon } from '@radix-ui/react-icons';

interface DialogContentProps extends DialogPrimitive.DialogContentProps {
  containerClass?: string;
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(
  (
    { containerClass, children, className, ...props },
    forwardedRef
  ) => (
    <DialogPrimitive.Content asChild {...props} ref={forwardedRef}>
      <section className={cn('dialog-container', containerClass)}>
        <div className={cn('dialog', className)}>
          {children}
          <DialogPrimitive.Close className="icon-button absolute top-6 right-6">
            <Cross2Icon className="h-4 w-4" />
          </DialogPrimitive.Close>
        </div>
      </section>
    </DialogPrimitive.Content>
  )
);

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

type DialogProps = DialogPrimitive.DialogProps &
  DialogContentProps & {
    trigger?: ReactNode;
  };

export default function Dialog({
  children,
  open,
  modal,
  defaultOpen,
  onOpenChange,
  trigger,
  ...content
}: DialogProps) {
  const props = { open, modal, defaultOpen, onOpenChange };
  return (
    <DialogPrimitive.Root {...props}>
      {trigger}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 transform-gpu bg-black opacity-30" />
        <DialogContent {...content}>{children}</DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
