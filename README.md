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

By default, the CLI will run in interactive mode, prompting you for options. You can also provide options directly via the command line.

The following options are available:

- `--output <path>`: Specify the output path for the generated workflow file. Default is `.github/workflows/publish.yml`.
- `--split`: Generate separate workflows for packing and publishing
- `--no-scripts`: Do not execute install scripts when installing dependencies
- `--trigger <event>`: Specify the event that triggers the workflow. Options are `release_published`, `release_created`, `tag`, and `push_main`. Default is `release_published`.
- `--env <env>`: Specify the GitHub environment to use. Default is none
- `--prerelease`: Allow publishing of prerelease versions
- `--interactive`: Run in interactive mode to prompt for options (default)
- `--changelog <tool>`: Specify the changelog tool to use. Options are `changelogithub`, `changesets`, and `none`. Default is `none`.

# License

MIT
