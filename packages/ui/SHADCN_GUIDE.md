# Using shadcn/ui in WhatsMyToken Extension

This guide explains how to use shadcn/ui components in the WhatsMyToken browser extension.

## Setup Complete ✅

The following has been configured:
- ✅ components.json configuration
- ✅ CSS variables and Tailwind extensions
- ✅ Path aliases and TypeScript configuration
- ✅ All necessary Radix UI dependencies
- ✅ Example Button component

## Adding New Components

### Method 1: Using the Helper Script
```bash
cd packages/ui
./add-component.sh button card dialog
```

### Method 2: Manual Installation
```bash
cd packages/ui
pnpm dlx shadcn@latest add <component-name>
```

## Using Components in the Extension

1. Import from `@extension/ui`:
```tsx
import { Button, Card, Dialog } from "@extension/ui";
```

2. Use in your components:
```tsx
<Button variant="destructive" size="sm">
  Delete
</Button>
```

## Available Components

Currently installed:
- Button ✅

Available to add:
- accordion, alert, alert-dialog, aspect-ratio, avatar, badge
- breadcrumb, calendar, card, carousel, chart, checkbox
- collapsible, command, context-menu, dialog, drawer
- dropdown-menu, form, hover-card, input, input-otp
- label, menubar, navigation-menu, pagination, popover
- progress, radio-group, resizable, scroll-area, select
- separator, sheet, sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea, toggle, toggle-group, tooltip

## Theming

The extension supports light/dark themes through CSS variables:
- Light theme: Default
- Dark theme: Add `dark` class to root element

## Important Notes

1. **Chrome Extension CSP**: Some shadcn/ui components may need adjustments for Chrome Extension Content Security Policy.

2. **Bundle Size**: Be mindful of adding too many components as it affects extension size.

3. **Styling**: All components use Tailwind CSS with the configured theme colors.

## Troubleshooting

If components don't display correctly:
1. Ensure `pnpm ready` has been run in packages/ui
2. Check that global.css is imported in your page
3. Verify Tailwind is processing the component files