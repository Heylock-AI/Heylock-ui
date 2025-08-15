# @heylock-dev/ui

React component library for integrating Heylock agents (chat UI, input, messages, provider, expanding chat widget).

## Installation

```bash
npm install @heylock-dev/ui heylock framer-motion tailwind-merge
```

Peer dependencies you must already have in your app:

```bash
npm install react react-dom
```

## Quick Start

Wrap your app with `HeylockProvider` providing your agent key.

```tsx
import React from 'react';
import { HeylockProvider, HeylockExpandingChat } from '@heylock-dev/ui';

export default function App(){
	return (
		<HeylockProvider agentKey={process.env.NEXT_PUBLIC_HEYLOCK_AGENT_KEY}>
			<HeylockExpandingChat />
		</HeylockProvider>
	);
}
```

### Individual Components

```tsx
import { HeylockInput, HeylockMessages, HeylockProvider } from '@heylock-dev/ui';

function Chat() {
	return (
		<HeylockProvider agentKey="your-agent-key">
			<div className="space-y-4">
				<HeylockMessages />
				<HeylockInput />
			</div>
		</HeylockProvider>
	);
}
```

## Theming

Components accept a `theme` prop: `light | dark | auto`.

```tsx
<HeylockExpandingChat theme="auto" />
```

## Building (Contributors)

Dev build (non‑minified with source maps):

```bash
npm run build
```

Production build (minified, no source maps):

```bash
npm run build:prod
```

Run a smoke test against the built output:

```bash
npm run test:smoke
```

## Publishing

`prepublishOnly` runs the build automatically:

```bash
npm publish
```

## Exports

All components are exported from the root module:

```ts
import { HeylockProvider, HeylockInput, HeylockMessages, HeylockExpandingChat } from '@heylock-dev/ui';
```

## Types

Type declarations are maintained manually in `src/types.d.ts` and copied to `dist/types.d.ts` during build.

## License

Apache-2.0

