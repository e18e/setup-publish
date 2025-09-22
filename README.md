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
| `--template <name>` | Template to use for workflow generation | `default` | <ul><li>`default` - Manual GitHub release management</li><li>`changelogithub` - Automated changelog with changelogithub</li><li>`changesets` - Automated releases with changesets</li></ul> |
| `--env <env>` | GitHub environment for deployment protection | _none_ | Any environment name |
| `--interactive` | Run CLI in interactive mode | `true` | boolean |

### Examples

```bash
# Interactive mode (default)
setup-publish

# Generate workflow with changesets template (non-interactive)
setup-publish --no-interactive --template changesets

# Custom output path with GitHub environment (non-interactive)
setup-publish --no-interactive --output .github/workflows/release.yml --env production

# Use changelogithub template with custom environment
setup-publish --no-interactive --template changelogithub --env staging
```

# License

MIT
