# setup-amber

[![Github CI](https://github.com/psibi/setup-amber/actions/workflows/test.yml/badge.svg)](https://github.com/psibi/setup-amber/actions/workflows/test.yml)

Github action to install and cache the [amber](https://github.com/fpco/amber) tool.

# Usage

In most cases all you need is the following in your workflow:

``` yaml
- uses: psibi/setup-amber@v1
```

If you want a specific version of amber, you can specify this by
passing the amber-version input:

``` yaml
- uses: psibi/setup-amber@v1
  with:
    amber-version: 'v0.1.3'
```

In rare circumstances you might get rate limiting errors, this is
because this workflow has to make requests to GitHub API in order to
list available releases. If this happens you can set the
`GITHUB_TOKEN` environment variable.

``` yaml
- uses: psibi/setup-amber@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

| Name           | Required | Description                             | Type   | Default |
| -------------- | -------- | --------------------------------------- | ------ | ------- |
| `amber-version` | no       | A valid NPM-style semver specification. | string | *       |
