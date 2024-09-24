import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FolderStats } from '@/types'
import type { KeypressEvent } from '@inquirer/core'

/**
 * ANSI escape code to hide the cursor
 */
export const CURSOR_HIDE = '\x1B[?25l'

export function isTabKey(key: KeypressEvent) {
  return key.name === 'tab'
}

export function isOnlyUpKey(key: KeypressEvent) {
  return key.name === 'up'
}

export function isOnlyDownKey(key: KeypressEvent) {
  return key.name === 'down'
}

/**
 * Check if the given key is the escape key
 */
export function isEscapeKey(key: KeypressEvent) {
  return key.name === 'escape'
}

/**
 * Add a trailing slash at the end of the given path if it doesn't already have one
 */
export function ensureTrailingSlash(dir: string) {
  return dir.endsWith(path.sep) ? dir : `${dir}${path.sep}`
}

/**
 * Strip ANSI codes from the given string
 */
export function stripAnsiCodes(str: string): string {
  return str.replace(/x1B\[\d+m/g, '')
}

/**
 * Get the maximum length of the given array of strings
 */
export function getMaxLength(arr: string[]) {
  return arr.reduce(
    (max, item) => Math.max(max, stripAnsiCodes(item).length),
    0,
  )
}

const memo: Record<string, FolderStats[]> = {}

export function getDirsSync(dirPath: string): FolderStats[] {
  try {
    const isExist = fs.existsSync(dirPath)

    if (!isExist) {
      return []
    }

    memo[dirPath] =
      memo[dirPath] ??
      fs.readdirSync(dirPath).map((name) => {
        const _path = path.join(dirPath, name)
        const stat = fs.statSync(_path)

        return Object.assign(stat, {
          name,
          path: _path,
        })
      })

    return memo[dirPath].filter((stat) => {
      return stat.isDirectory?.() && !/(^|\/)\.[^\/.]/g.test(stat.name)
    })
  } catch (e) {
    console.error(e)
    return []
  }
}

export function filterWithSearchTerm(dirs: string[], searchTerm = '') {
  return searchTerm === ''
    ? dirs
    : dirs.filter((dir) => dir.includes(searchTerm))
}
