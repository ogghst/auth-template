# Material UI Setup Instructions

To use the Material UI components in this Next.js app, you need to install the required packages.

## Installation

Run one of the following commands from the root of the monorepo:

### Using pnpm (recommended for this monorepo)

```bash
# From the root directory
pnpm install @mui/material @emotion/react @emotion/styled @mui/icons-material -F web
```

### Using yarn

```bash
cd apps/web
yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Using npm

```bash
cd apps/web
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

## Configuration

After installing the packages, you should be able to use the Material UI components without linter errors.

## Fonts Setup (Optional)

For better typography, you can add Roboto font to your project:

```bash
# Using pnpm
pnpm install @fontsource/roboto -F web

# Using yarn
yarn add @fontsource/roboto

# Using npm
npm install @fontsource/roboto
```

Then import it in your layout.tsx:

```typescript
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
```

## Theme Customization

The current setup includes a basic theme in `layout.tsx`. You can customize this theme by modifying the `createTheme` configuration to match your application's design requirements. 