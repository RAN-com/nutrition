# Nutrition App

This repository contains the source code for the Nutrition desktop application. The build, packaging, and release pipelines are fully automated using GitHub Actions.

## Development Workflow

### Prerequisites

Make sure you have Node.js version 20 or higher installed on your local environment.

### Installation

Install the necessary project dependencies before running the application:

```powershell
npm ci
```

### Local Development

To launch the application locally in development mode:

```powershell
npm run dev
```

---

## Release and Deployment Guide

The production release process is managed completely by continuous integration. Pushing a version tag matching the `v*.*.*` pattern automatically triggers the delivery pipeline.

### Step 1: Commit and Push Source Code

Stage all modified files, commit them to your local history, and push the branch upstream to the master branch:

```powershell
git add -A
git commit -m "Your descriptive commit message here"
git push origin master
```

### Step 2: Bump the Application Version

Execute the version command to increment the project version. This updates the version field in your package.json file and creates an identical local Git tracking tag:

```powershell
# Select the appropriate increment type: patch, minor, or major
npm version patch
```

### Step 3: Push the Tag to Trigger the Release Pipeline

Transmit the newly generated tag to the remote repository to initiate the compiler and packager on the remote Windows runner:

```powershell
git push origin --tags
```

---

## Automated Pipeline Infrastructure

When a valid release tag is detected, the GitHub Actions runner automatically processes the following pipeline operations:

- **Environment Provisioning**: Initializes a clean Windows runner instance running Node.js 20.
- **Secret Injection**: Extracts encrypted target keys from repository storage and writes them securely into a `.env.production` file.
- **Compilation**: Runs `npm run build` to compile the Vite frontend layers and the Electron main processes into the required `out/` directory.
- **Packaging**: Executes `electron-builder` to bundle the compiled output into target Windows installer assets.
- **Distribution Publishing**: Creates an official GitHub Release matching the target version tag and attaches the compiled application binaries directly to the release page.

Pipeline health status and compilation console logs can be audited under the Actions tab of the GitHub repository interface.
