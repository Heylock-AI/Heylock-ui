import * as React from 'react';
import type Heylock from 'heylock';

/** Theme options supported across UI components */
export type HeylockTheme = 'light' | 'dark' | 'auto';

/** Props for the provider that instantiates and exposes a Heylock agent via context */
export interface HeylockProviderProps {
  /** Children that can access the agent through useAgent */
  children?: React.ReactNode;
  /** API agent key (required). Provider will throw early if missing. */
  agentKey: string;
}
export declare const HeylockProvider: React.FC<HeylockProviderProps>;

/** Hook to access the underlying Heylock agent instance. Throws if used outside provider. */
export declare function useAgent(): Heylock;

/** Props for the expanding chat wrapper component */
export interface HeylockExpandingChatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Outer container className (positioning, sizing). */
  className?: string;
  /** Class applied to the animated message container panel. */
  messageContainerClassName?: string;
  /** Class applied to the header bar inside the panel. */
  headerClassName?: string;
  /** Class applied to the close (X) button. */
  closeButtonClassName?: string;
  /** Whether input (and open interaction) is disabled. Defaults to false. */
  disabled?: boolean;
  /** Visual theme; 'auto' applies dark based on prefers-color-scheme. */
  theme?: HeylockTheme;
  /** Header text shown in the panel. */
  header?: string;
}
export declare const HeylockExpandingChat: React.FC<HeylockExpandingChatProps>;

/** Props for the chat input form */
export interface HeylockInputProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onChange' | 'onFocus'> {
  /** Disable the input externally (usage limits may also disable internally). */
  disabled?: boolean;
  /** Text shown when disabled due to limits or explicit disable. */
  disabledText?: string;
  /** Placeholder text shown while streaming a response. */
  respondingText?: string;
  /** Theme variant for styling. */
  theme?: HeylockTheme;
  /** Rotating placeholder strings (cycles over time). */
  placeholders?: string[];
  /** Interval (ms) for rotating placeholders. */
  placeholderInterval?: number;
  /** Root form className. */
  className?: string;
  /** Input element className. */
  inputClassName?: string;
  /** Placeholder element className. */
  placeholderClassName?: string;
  /** Submit button className. */
  buttonClassName?: string;
  /** Arrow SVG className. */
  arrowClassName?: string;
  /** Input change handler (fires only when not animating / not disabled). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Form submit handler (called prior to internal streaming). */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  /** Focus handler for the form. */
  onFocus?: React.FocusEventHandler<HTMLFormElement>;
}
export declare const HeylockInput: React.FC<HeylockInputProps>;

/** Props for the messages list component */
export interface HeylockMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Root container className (scroll area). */
  className?: string;
  /** ClassName applied to user messages. */
  userMessageClassName?: string;
  /** ClassName applied to assistant messages. */
  assistantMessageClassName?: string;
}
export declare const HeylockMessages: React.FC<HeylockMessagesProps>;

/** Re-export core Heylock types for convenience */
export type { Message, UsageRemaining, AgentOptions } from 'heylock/dist/types';
