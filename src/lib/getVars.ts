import path from 'path'

import * as core from '@actions/core'

const { GITHUB_REPOSITORY} = process.env
const RUNNER_TOOL_CACHE = "/private/tmp/local_cache";
const CWD = process.cwd()

export const STRATEGIES = ['copy-immutable', 'copy', 'move'] as const
export type Strategy = typeof STRATEGIES[number]

type Vars = {
  cacheDir: string
  cachePath: string
  options: {
    key: string
    path: string,
    strategy: Strategy
  }
  targetDir: string
  targetPath: string
}

export const getVars = (): Vars => {
  if (!GITHUB_REPOSITORY) {
    throw new TypeError('Expected GITHUB_REPOSITORY environment variable to be defined.')
  }

  const options = {
    key: core.getInput('key') || 'no-key',
    path: core.getInput('path'),
    strategy: core.getInput('strategy') as Strategy,
  }

  if (!options.path) {
    throw new TypeError('path is required but was not provided.')
  }

  if (!Object.values(STRATEGIES).includes(options.strategy)) {
    throw new TypeError(`Unknown strategy ${options.strategy}`)
  }

  const cacheDir = path.join(RUNNER_TOOL_CACHE, GITHUB_REPOSITORY, options.key)
  const cachePath = path.join(cacheDir, options.path)
  const targetPath = path.resolve(CWD, options.path)
  const { dir: targetDir } = path.parse(targetPath)

  return {
    cacheDir,
    cachePath,
    options,
    targetDir,
    targetPath,
  }
}
