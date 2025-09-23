# `@e18e/setup-publish`

[![npm version](https://img.shields.io/npm/v/@e18e/setup-publish.svg)](https://www.npmjs.com/package/@e18e/setup-publish)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚀 A tiny CLI to assist with setting up GitHub workflows for publishing packages to npm.

## 📦 Install

```bash
npm install -g @e18e/setup-publish
```

## 🚀 Usage

```bash
setup-publish
```

## 🛠️ Features

- **Granular permissions** - Each workflow step has minimal required permissions
- **SHA-pinned actions** - GitHub actions referenced by commit SHA for security
- **Install scripts disabled** - Prevents malicious package install scripts from running
- **Separated jobs** - Build and publish run as independent jobs for better isolation
- **Secure publish** - Publish job only uploads pre-built artifacts, no external code execution

## ⚙️ Options

By default, the CLI runs in **interactive mode**, prompting you for configuration options. You can also provide options directly via the command line with `--no-interactive` to skip the prompts entirely.

| Option | Description | Default | Available Values |
|--------|-------------|---------|------------------|
| `--output <path>` | Output path for the generated workflow file | `.github/workflows/publish.yml` | Any valid file path |
| `--template <name>` | Template to use for workflow generation | `default` | <ul><li>`default` - Manual GitHub release management</li><li>`changelogithub` - Automated changelog with changelogithub</li><li>`changesets` - Automated releases with changesets</li></ul> |
| `--env <env>` | GitHub environment for deployment protection | _none_ | Any environment name |
| `--interactive` | Run CLI in interactive mode | `true` | boolean |

## 📚 Examples

### Interactive Mode (Default)

```bash
setup-publish
```

### Non-Interactive Mode

```bash
# Generate workflow with changesets template
setup-publish --no-interactive --template changesets

# Custom output path with GitHub environment
setup-publish --no-interactive --output .github/workflows/release.yml --env production

# Use changelogithub template with custom environment
setup-publish --no-interactive --template changelogithub --env staging
```

## 📋 Templates

### 🎯 **Default**

Manual GitHub release management - this is the most baic setup, allowing you to create releases manually via GitHub's interface.

### 📝 **Changelogithub**

Automated changelog generation using [changelogithub](https://github.com/antfu/changelogithub) - ideal for projects following conventional commits.

### 🔄 **Changesets**

Automated releases with [changesets](https://github.com/changesets/changesets) - great for monorepos and coordinated releases.

## 📄 License

MIT
