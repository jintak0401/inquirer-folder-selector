import type { Stats } from 'node:fs'
import type { Theme } from '@inquirer/core'
import type { PartialDeep } from '@inquirer/type'

export type FileSelectorTheme = {
  icon: {
    /**
     * The prefix to use for the line.
     * @default isLast => isLast ? └── : ├──
     */
    linePrefix: (isLast: boolean) => string
  }
  style: {
    /**
     * The style to use for the active item.
     * @default chalk.cyan
     */
    active: (text: string) => string
    /**
     * The style to use for the cancel text.
     * @default chalk.red
     */
    cancelText: (text: string) => string
    /**
     * The style to use for the empty text.
     * @default chalk.red
     */
    emptyText: (text: string) => string
    /**
     * The style to use for items of type directory.
     * @default chalk.yellow
     */
    directory: (text: string) => string
    /**
     * The style to use for items of type file.
     * @default chalk.white
     */
    currentDir: (text: string) => string
    /**
     * The style to use for the keys in the key bindings help.
     * @default chalk.cyan
     */
    key: (text: string) => string
  }
}

export type FolderStats = Stats & {
  /**
   * The name of the file or directory.
   */
  name: string
  /**
   * The path to the file or directory.
   */
  path: string
}

export type FileSelectorConfig = {
  message: string
  /**
   * The path to the directory where it will be started.
   * @default process.cwd()
   */
  basePath?: string
  /**
   * The maximum number of items to display in the list.
   * @default 10
   */
  pageSize?: number
  /**
   * A function to filter files and directories. It returns `true` to include the file or directory in the list,
   * and `false` to exclude it.
   *
   * If not provided, all files and directories will be included by default.
   */
  filter?: (file: FolderStats) => boolean
  /**
   * If `true`, the list will include files and directories that are excluded by the `filter` function.
   * @default false
   */
  showExcluded?: boolean
  /**
   * The label to display when a file is disabled.
   * @default ' (No more directory)'
   */
  disabledLabel?: string
  /**
   * The message that will be displayed when the directory is empty.
   * @default 'Directory is empty.'
   */
  emptyText?: string
  /**
   * The theme to use for the file selector.
   */
  theme?: PartialDeep<Theme<FileSelectorTheme>>
}
