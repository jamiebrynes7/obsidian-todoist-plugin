# General

## Prerequisites

This plugin is built using Typescript and React. You will need the following tools installed to build and run the plugin:

- [`git`](https://git-scm.com/downloads)
- [`npm`](https://nodejs.org/en/download/)

Alternatively, if you use Nix, there is a flake and a `.envrc` to load the development environment for you. Simply run `direnv allow` to load the environment.

## Building

The plugin source is contained entirely within the `plugin` directory. To build the plugin:

1. Run `cd plugin`
2. Run `npm install` to pull down the required dependencies
3. Run `npm run dev` to build the plugin.

By default, this will build the plugin into `plugin/dist/`. You can manually copy the files an Obsidian vault for testing. For a smoother iteration cycle, you can tell the build process where it should place the output. The build process looks for the `VITE_OBSIDIAN_VAULT` environment variable to find a target vault.

A simple way to configure this once is:

1. Create a file at `plugin/.env.local`. This file is automatically loaded by the build script.
2. Add a line to this file setting the environment variable. For example:

   ```sh
   export VITE_OBSIDIAN_VAULT=/Users/jamiebrynes/Documents/my-vault
   ```

## Running tests

Its generally a good idea to write tests to ensure that the plugin's functionality is correct. The test suite is, at the time of writing, limited - but it can be useful for developing functionality against a set of tests. To run _all_ tests, from the `plugin` directory:

```
npm run test
```

Alternatively, to run a subset of tests, you can pass in a path to filter the tests ran:

```
npm run test ./src/utils
```

## Linting

This plugin uses [BiomeJS](https://biomejs.dev/) to format and lint our Typescript. This ensures a consistent code style across the plugin. To check the formatting, from the `plugin` directory, run:

```
npm run lint:check
```

Biome can also format code to fix most issues. Note this will modify files on disk:

```
npm run lint:fix
```
