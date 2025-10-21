# Development Guide

This guide explains how to develop, build, and install your fork of the MCP Chrome server.

## Quick Start for Development

### Prerequisites

- Node.js >= 18.19.0
- pnpm (install with `npm install -g pnpm`)
- Chrome/Chromium browser

### Initial Setup

```bash
# Clone your fork
git clone <your-fork-url>
cd mcp-chrome

# Install dependencies
pnpm install

# Build everything
pnpm build
```

## Chrome Extension Development

### Building the Extension

```bash
# Build the extension for Chrome
pnpm build:extension

# Create a zip file (for distribution)
pnpm --filter chrome-mcp-server zip

# Build for Firefox
pnpm --filter chrome-mcp-server build:firefox
pnpm --filter chrome-mcp-server zip:firefox
```

### Installing the Extension Locally

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the directory: `app/chrome-extension/.output/chrome-mv3-prod`

Whenever you make changes:
```bash
pnpm build:extension
```
Then click the "Reload" button on your extension in `chrome://extensions`.

### Installing from CI Builds

Every push to your fork automatically builds the extension via GitHub Actions.

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click on the latest workflow run
4. Download the artifact zip file
5. Extract and load in Chrome as described above

## Native Server (MCP Bridge) Development

### Building the Native Server

```bash
# Build the native server
pnpm build:native

# Or build just the native server directly
cd app/native-server
pnpm install
pnpm build
```

### Installing Locally for Development

Option 1: Install globally from your local build
```bash
cd app/native-server
pnpm build
npm install -g .
```

Option 2: Use pnpm link (recommended for active development)
```bash
cd app/native-server
pnpm build
pnpm link --global

# Then register the native messaging host
mcp-chrome-bridge register
```

### Testing Changes

After making changes to the native server:

```bash
cd app/native-server
pnpm build

# If you used npm install -g, reinstall:
npm install -g .

# If you used pnpm link, just rebuild (the link is already active)
# The build output updates the linked files
```

## Publishing Your Fork

### Manual Publishing to npm

When you're ready to publish a new version to npm:

1. Update the version in `app/native-server/package.json`
2. Build the package:
   ```bash
   cd app/native-server
   pnpm build
   ```
3. Login to npm (if not already):
   ```bash
   npm login
   ```
4. Publish:
   ```bash
   npm publish
   ```

### Creating a GitHub Release

Use the GitHub Actions workflow:

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "Create Release" workflow
4. Click "Run workflow"
5. Enter the version number (e.g., "1.0.30")
6. Optionally check "Publish to npm" if you want to publish to npm automatically
7. Click "Run workflow"

This will:
- Create a GitHub release with the version tag
- Attach the Chrome extension zip
- Attach the native server tarball
- Optionally publish to npm

## Common Development Workflows

### Making a Quick Fix to the Extension

```bash
# 1. Make your changes to files in app/chrome-extension/
# 2. Build
pnpm build:extension
# 3. Reload extension in Chrome (chrome://extensions)
```

### Making a Quick Fix to the Native Server

```bash
# 1. Make your changes to files in app/native-server/src/
# 2. Build and reinstall
cd app/native-server
pnpm build
npm install -g .
# 3. Restart any running MCP clients that use the server
```

### Working on Shared Code

The shared package (`packages/shared/`) contains types and constants used by both the extension and native server.

For the **Chrome extension**, it uses the shared package as a workspace dependency (automatically handled by pnpm).

For the **native server**, the shared code is copied into `app/native-server/src/shared/` to avoid workspace dependencies in the published npm package.

If you need to update shared code:

1. Edit files in `packages/shared/src/`
2. Copy to native server:
   ```bash
   cp packages/shared/src/*.ts app/native-server/src/shared/
   ```
3. Rebuild both packages:
   ```bash
   pnpm build:shared
   pnpm build:extension
   pnpm build:native
   ```

## Troubleshooting

### Extension not loading

- Make sure you've run `pnpm build:extension`
- Check Chrome DevTools console for errors
- Verify you're loading from `.output/chrome-mv3-prod` directory

### Native server not connecting

- Check if the native messaging host is registered:
  ```bash
  # On macOS/Linux
  cat ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.chrome_mcp.native_host.json
  # Or
  cat ~/.config/google-chrome/NativeMessagingHosts/com.chrome_mcp.native_host.json
  ```
- Re-register: `mcp-chrome-bridge register`
- Check that the path in the JSON points to your installed binary

### Changes not taking effect

- For extension: Make sure you clicked "Reload" in chrome://extensions
- For native server: Make sure you reinstalled globally after rebuilding
- Clear any caches if necessary

## Project Structure

```
mcp-chrome/
├── app/
│   ├── chrome-extension/     # Chrome extension source
│   │   ├── entrypoints/      # Extension entry points (background, popup, etc.)
│   │   ├── utils/            # Utility functions
│   │   └── workers/          # Web workers (WASM, embeddings)
│   └── native-server/        # Native messaging host (npm package)
│       ├── src/
│       │   ├── shared/       # Copied from packages/shared
│       │   ├── mcp/          # MCP server implementation
│       │   └── scripts/      # Build and registration scripts
│       └── dist/             # Built output
├── packages/
│   ├── shared/               # Shared types and constants
│   └── wasm-simd/           # WASM module for vector operations
└── .github/workflows/        # CI/CD workflows
    ├── build-release.yml    # Builds extension on every push
    └── release.yml          # Creates releases
```

## CI/CD Workflows

### Build Chrome Extension (automatic)

Runs on every push to any branch. Creates artifacts you can download and install.

### Create Release (manual)

Triggered manually via GitHub Actions UI. Creates a GitHub release with:
- Chrome extension zip
- Native server tarball
- Optional npm publish

## Installing from Your Published Package

Once you've published to npm:

```bash
# Install globally
npm install -g mcp-chrome-bridge

# Register the native messaging host
mcp-chrome-bridge register

# Verify installation
mcp-chrome-bridge --help
```

For the Chrome extension, users download the zip from your GitHub releases and install as described in "Installing the Extension Locally".
