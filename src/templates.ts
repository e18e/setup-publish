import type {Trigger, CLIOptions} from './types.js';

const createCommonBuildSteps = (opts: CLIOptions) => [
  {uses: 'actions/checkout@v5', with: {'persist-credentials': false}},
  {
    uses: 'actions/setup-node@v5',
    with: {'node-version': 24, 'package-manager-cache': false}
  },
  {run: opts['no-scripts'] ? installWithoutScripts : installWithScripts},
  {run: 'npm run build'},
  {
    run: 'npm version $TAG_NAME --git-tag-version=false',
    env: {
      TAG_NAME: '${{ github.ref_name }}'
    }
  }
];
const createBuildOnlyJob = (opts: CLIOptions) => ({
  'runs-on': 'ubuntu-latest',
  permissions: {contents: 'read'},
  outputs: {tarball: '${{ steps.pack.outputs.tarball }}'},
  steps: [
    ...createCommonBuildSteps(opts),
    {
      id: 'pack',
      run: `
TARBALL=$(npm pack)
echo "tarball=$TARBALL" >> $GITHUB_OUTPUT
      `.trim()
    },
    {
      uses: 'actions/upload-artifact@v4',
      with: {name: 'tarball', path: '${{ steps.pack.outputs.tarball }}'}
    }
  ]
});
const createPublishSteps = (opts: CLIOptions) => {
  if (opts.changelog === 'changesets') {
    return [
      {
        name: 'Create Release or Publish',
        uses: 'changesets/action@v1',
        with: {
          publish: 'npx changeset publish'
        },
        env: {
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
        }
      }
    ];
  }

  const steps: unknown[] = [];

  if (opts.prerelease) {
    steps.push(
      {
        run: 'npm publish --provenance --access public',
        if: '!github.event.release.prerelease'
      },
      {
        run: 'npm publish --provenance --access public --tag next',
        if: 'github.event.release.prerelease'
      }
    );
  } else {
    steps.push({
      run: 'npm publish --provenance --access public'
    });
  }

  if (opts.changelog === 'changelogithub') {
    steps.push({
      name: 'Generate Change Log',
      run: 'npx changelogithub',
      env: {
        GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
      }
    });
  }

  return steps;
};

const createBuildAndPublishJob = (opts: CLIOptions) => {
  const steps: unknown[] = [
    ...createCommonBuildSteps(opts),
    ...createPublishSteps(opts)
  ];

  return {
    'runs-on': 'ubuntu-latest',
    permissions: {contents: 'read'},
    outputs: {tarball: '${{ steps.pack.outputs.tarball }}'},
    steps
  };
};
const createPublishOnlyJob = (opts: CLIOptions) => {
  const steps: unknown[] = [
    {uses: 'actions/download-artifact@v5', with: {name: 'tarball'}},
    {
      uses: 'actions/setup-node@v5',
      with: {'node-version': 24, 'package-manager-cache': false}
    },
    ...createPublishSteps(opts)
  ];

  return {
    needs: ['test', 'build'],
    'runs-on': 'ubuntu-latest',
    environment: 'publish',
    permissions: {'id-token': 'write'},
    env: {TARBALL: '${{ needs.build.outputs.tarball }}'},
    steps
  };
};
const installWithScripts = 'npm ci';
const installWithoutScripts = 'npm ci --ignore-scripts';

const createTestJob = (opts: CLIOptions) => ({
  'runs-on': 'ubuntu-latest',
  permissions: {contents: 'read'},
  steps: [
    {uses: 'actions/checkout@v5', with: {'persist-credentials': false}},
    {uses: 'actions/setup-node@v5', with: {'node-version': 24, cache: 'npm'}},
    {run: opts['no-scripts'] ? installWithoutScripts : installWithScripts},
    {run: 'npm test'}
  ]
});
const createSplitJobs = (opts: CLIOptions) => ({
  jobs: {
    test: createTestJob(opts),
    build: createBuildOnlyJob(opts),
    'publish-npm': createPublishOnlyJob(opts)
  }
});
const createJobs = (opts: CLIOptions) => ({
  jobs: {
    test: createTestJob(opts),
    build: createBuildAndPublishJob(opts)
  }
});
const triggerTemplates: Record<Trigger, unknown> = {
  push_main: {
    push: {branches: ['main']}
  },
  release_published: {
    release: {types: ['published']}
  },
  release_created: {
    release: {types: ['created']}
  },
  tag: {
    push: {tags: ['v*']}
  }
};
export const createTemplate = (opts: CLIOptions) => ({
  name: 'Publish to npm',
  permissions: {},
  on: triggerTemplates[opts.trigger],
  jobs: opts.split ? createSplitJobs(opts) : createJobs(opts)
});
