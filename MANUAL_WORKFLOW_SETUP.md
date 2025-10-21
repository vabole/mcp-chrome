# Manual Workflow Setup Required

The GitHub Actions workflow files have been created but cannot be committed by the GitHub App due to permission restrictions.

## Quick Setup

You need to commit these files manually from your local machine. Here are the exact steps:

### 1. Pull the latest changes from the branch

```bash
git checkout claude/modify-mcp-server-011CULU2akxwHyZE1h3oc7gv
git pull
```

### 2. Apply the workflow changes

The workflow file contents are saved below. Create/update these files:

#### File: `.github/workflows/build-release.yml`

Replace the entire file with:

```yaml
name: Build Chrome Extension

on:
  push:
    branches: ['**']
  pull_request:
    branches: ['**']
  workflow_dispatch:

jobs:
  build-extension:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build shared package
      run: pnpm --filter chrome-mcp-shared build

    - name: Build WASM
      run: pnpm build:wasm

    - name: Build extension
      run: pnpm --filter chrome-mcp-server build

    - name: Create zip package
      run: pnpm --filter chrome-mcp-server zip

    - name: Get version from package.json
      id: package-version
      run: |
        VERSION=$(node -p "require('./app/chrome-extension/package.json').version")
        echo "version=$VERSION" >> $GITHUB_OUTPUT

    - name: Get short SHA
      id: short-sha
      run: echo "sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

    - name: Upload Chrome extension artifact
      uses: actions/upload-artifact@v4
      with:
        name: chrome-mcp-server-v${{ steps.package-version.outputs.version }}-${{ steps.short-sha.outputs.sha }}
        path: app/chrome-extension/.output/*.zip
        retention-days: 30

    - name: Upload Firefox extension artifact (if built)
      if: hashFiles('app/chrome-extension/.output/*firefox*.zip') != ''
      uses: actions/upload-artifact@v4
      with:
        name: firefox-mcp-server-v${{ steps.package-version.outputs.version }}-${{ steps.short-sha.outputs.sha }}
        path: app/chrome-extension/.output/*firefox*.zip
        retention-days: 30
```

#### File: `.github/workflows/release.yml` (new file)

Create this new file:

```yaml
name: Create Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., 1.0.30)'
        required: true
        type: string
      publish_npm:
        description: 'Publish to npm'
        required: false
        type: boolean
        default: false

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
        registry-url: 'https://registry.npmjs.org'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build all packages
      run: |
        pnpm --filter chrome-mcp-shared build
        pnpm build:wasm
        pnpm --filter chrome-mcp-server build
        pnpm --filter mcp-chrome-bridge build

    - name: Create Chrome extension zip
      run: pnpm --filter chrome-mcp-server zip

    - name: Create Firefox extension zip
      run: pnpm --filter chrome-mcp-server zip:firefox

    - name: Create tarball for npm package
      run: |
        cd app/native-server
        npm pack

    - name: Create GitHub Release
      uses: softprops/action-gh-release@v2
      with:
        tag_name: v${{ inputs.version }}
        name: Release v${{ inputs.version }}
        draft: false
        prerelease: false
        files: |
          app/chrome-extension/.output/*.zip
          app/native-server/*.tgz
        body: |
          ## Release v${{ inputs.version }}

          ### Chrome Extension
          - Download `chrome-mv3-prod.zip` and install in Chrome via chrome://extensions (enable Developer mode, then "Load unpacked" after extracting the zip)

          ### Native Server (MCP Bridge)
          **Option 1: Install from npm** (if published)
          ```bash
          npm install -g mcp-chrome-bridge@${{ inputs.version }}
          mcp-chrome-bridge register
          ```

          **Option 2: Install from tarball**
          ```bash
          npm install -g mcp-chrome-bridge-${{ inputs.version }}.tgz
          mcp-chrome-bridge register
          ```

          **Option 3: Install from source**
          ```bash
          git clone <your-repo-url>
          cd mcp-chrome/app/native-server
          pnpm install
          pnpm build
          npm install -g .
          mcp-chrome-bridge register
          ```

    - name: Publish to npm
      if: ${{ inputs.publish_npm }}
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      run: |
        cd app/native-server
        npm publish
```

### 3. Commit and push

```bash
git add .github/workflows/build-release.yml .github/workflows/release.yml
git commit -m "ci: add GitHub Actions workflows for building and releasing"
git push
```

## What These Workflows Do

- **build-release.yml**: Automatically builds the Chrome extension on every push and uploads artifacts
- **release.yml**: Manual workflow for creating GitHub releases with extension zips and optional npm publishing

See `DEVELOPMENT.md` and `WORKFLOW_FILES_README.md` for more details.
