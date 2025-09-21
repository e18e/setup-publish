# `@e18e/setup-publish`

> A tiny CLI to assist with setting up GitHub workflows for publishing packages to npm.

## Install

```bash
$ npm install -g @e18e/setup-publish
```

## Usage

```bash
$ setup-publish
```

### Options

By default, the CLI runs in **interactive mode**, prompting you for configuration options. You can also provide options directly via the command line with `--no-interactive` to skip the prompts entirely.

| Option | Description | Default | Values |
|--------|-------------|---------|--------|
| `--output <path>` | Output path for the generated workflow file | `.github/workflows/publish.yml` | Any valid file path |
| `--split` | Generate separate jobs for build and publish stages | `false` | `true` \| `false` |
| `--no-scripts` | Disable install scripts when installing dependencies | `false` | `true` \| `false` |
| `--trigger <event>` | Event that triggers the workflow | `release_published` | `release_published` \| `release_created` \| `tag` \| `push_main` |
| `--env <env>` | GitHub environment for deployment protection | _none_ | Any environment name |
| `--prerelease` | Enable publishing of prerelease versions | `false` | `true` \| `false` |
| `--interactive` | Run in interactive mode | `true` | `true` \| `false` |
| `--changelog <tool>` | Changelog generation tool | `none` | `changelogithub` \| `changesets` \| `none` |

### Examples

```bash
# Interactive mode (default)
setup-publish

# Generate split workflow with changesets (non-interactive)
setup-publish --no-interactive --split --changelog changesets --trigger push_main

# Custom output path with GitHub environment (non-interactive)
setup-publish --no-interactive --output .github/workflows/release.yml --env production
```

# License

MIT
