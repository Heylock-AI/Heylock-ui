# @heylock-dev/ui

> React UI components for embedding a Heylock AI chat experience.

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Tailwind Integration](#tailwind-integration)
5. [Components](#components)
6. [Hooks](#hooks)
7. [Minimal Example](#minimal-example)
8. [Customization](#customization)
9. [Troubleshooting](#troubleshooting-quick)
10. [License](#license)
11. [Support](#support)

## Overview
Drop‑in, accessible chat UI built on top of the core `heylock` SDK. Provides provider + opinionated chat pieces so you can ship usable AI chat in minutes.

## Installation

Install the UI package:

```bash
npm install @heylock-dev/ui
```

Peer dependencies: React 18+, Tailwind CSS.

## Quick Start
1. Install packages (above).
2. Import the UI package CSS source in your global stylesheet so Tailwind can pick up its styles:

```css
/* globals.css */
@source "../node_modules/@heylock-dev/ui/dist/index.js";
```

3. Wrap your app with the provider and render the expanding chat.

```tsx
// App.tsx or similar
import { HeylockProvider, HeylockExpandingChat } from '@heylock-dev/ui';

export default function App() {
	return (
		<HeylockProvider agentKey={process.env.HEYLOCK_AGENT_KEY}>
			<main className="min-h-screen">
				{/* your app */}
				<HeylockExpandingChat />
			</main>
		</HeylockProvider>
	);
}
```

That's enough for a functioning expanding chat widget that streams replies.

## Components
| Component | Purpose |
|-----------|---------|
| `HeylockProvider` | Initializes and exposes a Heylock agent via context. |
| `HeylockMessages` | Animated, auto‑scrolling message list (user + assistant). |
| `HeylockInput` | Message composer with throttling, rotating placeholders, streaming awareness, disabled state on quota exhaustion. |
| `HeylockExpandingChat` | Floating chat combining the above primitives. |

## Hooks
| Hook | Description |
|------|-------------|
| `useAgent()` | Returns the underlying Heylock SDK instance (throws if used outside provider). Use for custom streaming, context updates, usage checks. |

### Hook Example
```tsx
import { useAgent } from '@heylock-dev/ui';

export function ManualSend() {
	const agent = useAgent();

	async function handleSend() {
		// The messages will appear in <HeylockMessages />
		const reply = await agent.message('Hello');

		console.log('Reply:', reply);
	}

	return <button onClick={handleSend}>Send Hello</button>;
}
```

## Types

TypeScript users can import the UI types or rely on the bundled `types.d.ts`. Key exported types and props include:

- `HeylockTheme` — `'light' | 'dark' | 'auto'`.
- `HeylockProviderProps` — props for `<HeylockProvider>` (requires `agentKey: string`).
- `HeylockExpandingChatProps` — props for the expanding chat wrapper (`className`, `messageContainerClassName`, `theme`, `header`, etc.).
- `HeylockInputProps` — input form props (`placeholders`, `placeholderInterval`, `inputClassName`, `onSubmit`, ...).
- `HeylockMessagesProps` — message list props (`className`, `userMessageClassName`, `assistantMessageClassName`).
- `useAgent()` — hook that returns the underlying `Heylock` SDK instance (typed) so you can call `.message()`, `.messageStream()`, `.addContextEntry()`, etc.
- Re‑exports from the core SDK: `Message`, `UsageRemaining`, `AgentOptions`.

Quick examples:

```ts
import type { HeylockInputProps } from '@heylock-dev/ui';
import { useAgent } from '@heylock-dev/ui';

function Example(props: HeylockInputProps) {
	const agent = useAgent(); // typed Heylock instance

	async function send() {
		const reply = await agent.message('Hello');
		console.log(reply);
	}

	return <button onClick={send}>Send</button>;
}
```

Notes:
- The package bundles `.d.ts` files so editors and compilers pick up types automatically when you install the package.

## Minimal Example
```tsx
import { HeylockProvider, HeylockExpandingChat } from '@heylock-dev/ui';

export function Root() {
	return (
		// Obtain an agentKey by signing up at https://heylock.dev and creating an agent
		<HeylockProvider agentKey="YOUR_AGENT_KEY">
			<HeylockExpandingChat />
		</HeylockProvider>
	);
}
```

Note: you must sign up at https://heylock.dev to create an agent and obtain an agent key. Configure your agent (personality, knowledge) in the Heylock dashboard and use the generated key in `HeylockProvider`.

## Customization

### Themes
Pass `theme="light" | "dark" | "auto"` to supported components (`HeylockInput`, `HeylockExpandingChat`). `auto` uses the user’s system color scheme.

### Class Overrides
Each component exposes class props you can use to restyle it:

| Component | Key Class Props |
|-----------|-----------------|
| `HeylockExpandingChat` | `className`, `messageContainerClassName`, `headerClassName`, `closeButtonClassName` |
| `HeylockMessages` | `className`, `userMessageClassName`, `assistantMessageClassName` |
| `HeylockInput` | `className`, `inputClassName`, `placeholderClassName`, `buttonClassName`, `arrowClassName` |

Example (override header + user bubble colors):
```tsx
<HeylockExpandingChat
	headerClassName="bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
	messageContainerClassName="h-[28rem]"
	closeButtonClassName="hover:bg-white/10"
/>
```

### Placeholders & Disabled Text
`HeylockInput` cycles through `placeholders` (defaults). Control speed via `placeholderInterval` (ms). Provide `disabledText` and `respondingText` for clear state messaging.

### Usage Limits & Disabled State
`HeylockInput` auto‑disables when `usageRemaining.messages <= 0`. You can still force disable with the `disabled` prop.

### Custom Layout
Skip `HeylockExpandingChat` and compose primitives directly:

```jsx
import { HeylockProvider, HeylockMessages, HeylockInput, useAgent } from '@heylock-dev/ui';

function ResetButton(){
	const agent = useAgent();
	return (
		<button
			onClick={() => agent.clearMessageHistory()}
			className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
		>Reset</button>
	);
}

function ChatSurface(){
	return (
		<div className="flex flex-col gap-3 w-full max-w-md border rounded-xl p-4">
			<HeylockMessages className="h-72" />
			<HeylockInput placeholders={["Ask anything","How can I help?"]} />
			<ResetButton />
		</div>
	);
}

export default function Page(){
	return (
		<HeylockProvider agentKey={process.env.HEYLOCK_AGENT_KEY!}>
			<ChatSurface />
		</HeylockProvider>
	);
}
```

### Direct Agent Access (Hook)
`useAgent()` gives you the raw Heylock SDK instance for advanced flows (manual streaming UI, adding context entries, checking usage). Must be used inside a `HeylockProvider`.

#### Manual Streaming
```tsx
async function manualStream(agent, prompt, onChunk){
	let full = '';

	for await (const chunk of agent.messageStream(prompt)) {
		full += chunk;
		onChunk(full); // update UI progressively
	}

	return full;
}
```

Typical usage inside a component:
```tsx
const agent = useAgent();
const [reply, setReply] = useState('');

async function handleAsk(){
	setReply('');
	await manualStream(agent, 'Explain streaming briefly.', setReply);
}
```

### Accessibility
The default message list animates and auto‑scrolls. If you build a custom list, retain accessible roles (e.g. `role="log"`, `aria-live="polite"`) and ensure focus management (focus the input after sending; keep close buttons reachable).

## Troubleshooting (quick)
| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| Styles missing | CSS source not imported | Add `@source "../node_modules/@heylock-dev/ui/dist/index.js";` to `globals.css` or similar |
| No messages appear | Invalid / missing agent key or network error | Verify key; check console for initialization errors |
| Input disabled unexpectedly | Usage limit reached | Check `agent.usageRemaining.messages`; upgrade or reset quota |

Ask questions at support@heylock.dev so we know what to add to the table. 

## License
Apache 2.0

## Support
Email: support@heylock.dev