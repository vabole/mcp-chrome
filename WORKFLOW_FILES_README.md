# GitHub Workflow Files - Manual Commit Required

The workflow files in `.github/workflows/` need to be committed manually from your local machine
because they require special GitHub permissions that the GitHub App doesn't have.

## Files to Commit

Two workflow files have been created/modified:

1. `.github/workflows/build-release.yml` - Builds Chrome extension on every push
2. `.github/workflows/release.yml` - Manual release workflow

## How to Commit These Files

Run these commands from your local machine:

```bash
# Add the workflow files
git add .github/workflows/build-release.yml
git add .github/workflows/release.yml

# Commit them
git commit -m "ci: add GitHub Actions workflows for building and releasing

- build-release.yml: Automatically builds Chrome extension on every push
  and uploads artifacts with version + commit SHA
- release.yml: Manual workflow for creating GitHub releases with
  extension zips, npm tarball, and optional npm publishing"

# Push to your repository
git push
```

## What These Workflows Do

### build-release.yml (Automatic)
- Triggers on every push to any branch
- Builds the Chrome extension using pnpm
- Creates zip files for Chrome and Firefox
- Uploads artifacts that you can download from the Actions tab
- Artifacts are named with version and commit SHA (e.g., `chrome-mcp-server-v0.0.6-abc1234`)

### release.yml (Manual)
- Triggered manually from GitHub Actions UI
- Prompts for version number (e.g., "1.0.30")
- Option to publish to npm (checkbox)
- Creates a GitHub release with:
  - Extension zips (Chrome and Firefox)
  - npm tarball
  - Installation instructions in release notes
- Optionally publishes to npm if checkbox is selected

## Using the Workflows

### Getting Extension Builds

After pushing code:
1. Go to your GitHub repo
2. Click "Actions" tab
3. Click on the latest workflow run
4. Download the artifact zip
5. Extract and install in Chrome

### Creating a Release

When ready to release:
1. Go to your GitHub repo
2. Click "Actions" tab
3. Click "Create Release" workflow
4. Click "Run workflow"
5. Enter version and choose whether to publish to npm
6. Click "Run workflow" button

The release will appear under the "Releases" section of your repo.

## Note on npm Publishing

If you want the workflow to publish to npm automatically:
1. Create an npm access token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add it as a secret in your GitHub repo:
   - Go to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: your npm token
3. When running the release workflow, check the "Publish to npm" box

Otherwise, you can always publish manually:
```bash
cd app/native-server
pnpm build
npm publish
```
