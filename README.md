# MenuMaker

MenuMaker is a free, local-first menu creation app for restaurants, cafes, food trucks, bars, and anyone else who needs a clean printable menu without a subscription or account.

The app is built as a static Svelte 5 site with runes, Tailwind CSS, and Flowbite Svelte. It can be hosted on GitHub Pages and used directly in the browser.

## Project Principles

- Free to use: the goal is to keep menu creation available without fees, subscriptions, or locked exports.
- Local-first: menu drafts are currently stored in the browser's local storage on the user's device.
- No account required: the app should remain useful without login, payment, or a hosted backend.
- Printable by default: the live preview should match the printed or exported result as closely as practical.
- Easy starting points: future work should help users begin from templates, guided setup, and polished style presets.

## Current Features

- Editable menu name, subtitle, top text, and logo placement.
- Template gallery for common restaurant and menu types.
- Style presets for simple, elegant, professional, and hometown menus.
- Section and menu item management with live preview.
- Optional restaurant details, hours, website, footer notes, disclaimer text, and QR code.
- Editable draft import and export for backups or sharing.
- CSV import for bulk menu item entry.
- Browser local autosave.
- Print-focused menu output.

## Data And Privacy

MenuMaker currently stores drafts in browser local storage. That means drafts stay on the device and browser where they were created. Clearing site data or switching browsers can remove access to a saved draft.

Uploaded logos and generated QR codes are used in the browser for the current draft. The QR code feature runs client-side and does not require a paid API.

## Roadmap

The public GitHub issue backlog tracks planned features, including:

- Guided first-run wizard.
- Template gallery for common restaurant types.
- Reusable visual style presets.
- Custom theme editing.
- PDF and image export.
- Draft import/export.
- CSV import.
- Mobile editing improvements.
- Accessibility and keyboard navigation pass.

## Development

```bash
pnpm install
pnpm dev
```

The local development server runs through Vite.

## Build

```bash
pnpm build
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` publishes the `dist` folder to GitHub Pages whenever `main` is pushed.

## License

MenuMaker is available under the MIT License. See [LICENSE](LICENSE).
