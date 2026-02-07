# @vritti/quantum-ui

A modern, TypeScript-first React component library built on Radix UI primitives and styled with Tailwind CSS v4. Fully typed, accessible, and tree-shakeable.

[![npm version](https://img.shields.io/npm/v/@vritti/quantum-ui.svg)](https://www.npmjs.com/package/@vritti/quantum-ui)
[![License](https://img.shields.io/npm/l/@vritti/quantum-ui.svg)](https://github.com/vritti-ai-platforms/quantum-ui/blob/main/LICENSE)

## Features

- 🎨 **Tailwind CSS v4** - Modern utility-first styling
- ♿ **Accessible** - Built on Radix UI primitives
- 📦 **Tree-shakeable** - Import only what you need
- 🔷 **TypeScript** - Fully typed with excellent IntelliSense support
- 🎭 **Themeable** - Dark mode support with ThemeToggle component
- 📚 **Documented** - Comprehensive Storybook documentation

## Documentation

📖 [View full documentation and interactive examples on Storybook](https://vritti-ai-platforms.github.io/quantum-ui)

## Installation

```bash
npm install @vritti/quantum-ui
```

```bash
yarn add @vritti/quantum-ui
```

```bash
pnpm add @vritti/quantum-ui
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install react react-dom
```

This library supports React 18.x and 19.x.

## Usage

Import components individually for optimal tree-shaking:

```tsx
import { Button } from '@vritti/quantum-ui/Button';
import { Card } from '@vritti/quantum-ui/Card';
import { TextField } from '@vritti/quantum-ui/TextField';

function App() {
  return (
    <Card>
      <TextField label="Email" placeholder="Enter your email" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

Or import from the main entry point:

```tsx
import { Button, Card, TextField } from '@vritti/quantum-ui';
```

## Available Components

- **Button** - Versatile button component with multiple variants
- **Card** - Container component for grouping content
- **TextField** - Text input with label and validation support
- **PasswordField** - Secure password input with show/hide toggle
- **Checkbox** - Accessible checkbox component
- **Typography** - Text styling component
- **ThemeToggle** - Dark/light mode toggle

## Development

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/vritti-ai-platforms/quantum-ui.git
cd quantum-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start Storybook for development:
```bash
npm run storybook
```

4. Build the library:
```bash
npm run build
```

### Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build the library for production
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production
- `npm run lint` - Lint the codebase

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Issues and Support

Found a bug or have a feature request? Please [open an issue](https://github.com/vritti-ai-platforms/quantum-ui/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Documentation (Storybook)](https://vritti-ai-platforms.github.io/quantum-ui)
- [GitHub Repository](https://github.com/vritti-ai-platforms/quantum-ui)
- [npm Package](https://www.npmjs.com/package/@vritti/quantum-ui)
- [Report Issues](https://github.com/vritti-ai-platforms/quantum-ui/issues)
