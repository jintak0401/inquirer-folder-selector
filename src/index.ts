import * as path from 'node:path'
import {
  type Status,
  createPrompt,
  isEnterKey,
  makeTheme,
  useKeypress,
  useMemo,
  usePagination,
  usePrefix,
  useState,
} from '@inquirer/core'
import figures from '@inquirer/figures'
import chalk from 'chalk'
import {
  CURSOR_HIDE,
  ensureTrailingSlash,
  filterWithSearchTerm,
  getDirsSync,
  getMaxLength,
  isEscapeKey,
  isOnlyDownKey,
  isOnlyUpKey,
  isTabKey,
} from './utils'

import type { FileSelectorConfig, FileSelectorTheme } from './types'

const fileSelectorTheme: FileSelectorTheme = {
  icon: {
    linePrefix: (isLast: boolean) => {
      return isLast
        ? `${figures.lineUpRight}${figures.line.repeat(2)} `
        : `${figures.lineUpDownRight}${figures.line.repeat(2)} `
    },
  },
  style: {
    active: (text: string) => chalk.cyan(text),
    cancelText: (text: string) => chalk.red(text),
    emptyText: (text: string) => chalk.gray(text),
    directory: (text: string) => chalk.yellow(text),
    currentDir: (text: string) => chalk.magenta(text),
    key: (text: string) => chalk.cyan(text),
  },
}

const splitPath = (pathString: string): [string, string] => {
  const splitPaths = pathString.split(path.sep)

  const _last = splitPaths.at(-1)

  // 마지막 경로가 `.` 또는 `..`일 경우 lastPath는 빈 문자열
  const lastPath = _last && /^(\.)$/.test(_last) ? '' : splitPaths.pop()

  return [path.join(...splitPaths), lastPath as string]
}

export default createPrompt<string | undefined, FileSelectorConfig>(
  (config, done) => {
    const {
      pageSize = 10,
      emptyText = 'No more directory',
      filter = () => true,
    } = config

    const [status, setStatus] = useState<Status>('idle')
    const theme = makeTheme(fileSelectorTheme, config.theme)
    const prefix = usePrefix({ theme })

    const [basePath] = useState(config.basePath || process.cwd())
    const [insertedPath, setInsertedPath] = useState('')
    const [active, setActive] = useState(0)

    const [headPath, tailPath] = splitPath(insertedPath)
    const dirList = useMemo(() => {
      const dirs = getDirsSync(path.join(basePath, headPath)).filter((stat) =>
        filter(stat),
      )
      return dirs.map((dir) => dir.name)
    }, [headPath])

    const items = filterWithSearchTerm(dirList, tailPath)

    useKeypress((key, rl) => {
      if (isEnterKey(key)) {
        setStatus('done')
        done(path.join(basePath, insertedPath))
      } else if (isTabKey(key)) {
        rl.clearLine(0)
        if (!items[active]) {
          rl.write(insertedPath)
          return
        }
        const joinedPath = path.join(headPath, items[active], path.sep)
        setInsertedPath(joinedPath)
        rl.write(joinedPath)

        setActive(0)
      } else if (isOnlyUpKey(key)) {
        setActive(active === 0 ? items.length - 1 : active - 1)
      } else if (isOnlyDownKey(key)) {
        setActive((active + 1) % items.length)
      } else if (isEscapeKey(key)) {
        setStatus('done')
        done(undefined)
      } else {
        const line = rl.line
        setInsertedPath(line)
        setActive(0)
      }
    })

    const page = usePagination({
      items,
      active,
      renderItem({ item, index, isActive }) {
        const isLast = index === items.length - 1
        const linePrefix = theme.icon.linePrefix(isLast)

        const line = `${linePrefix}${ensureTrailingSlash(item)}`

        const baseColor = theme.style.directory
        const color = isActive ? theme.style.active : baseColor

        return color(line)
      },
      pageSize,
      loop: false,
    })

    const message = theme.style.message(config.message, status)

    if (status === 'done') {
      return `${prefix} ${message} ${theme.style.answer(insertedPath)}`
    }

    const header = theme.style.currentDir(insertedPath)

    const helpTip = useMemo(() => {
      const helpTipLines = [
        `${theme.style.key(figures.arrowUp + figures.arrowDown)} navigate`,
        `${theme.style.key('<tab>')} autocomplete, ${theme.style.key('<enter>')} select`,
      ]

      const helpTipMaxLength = getMaxLength(helpTipLines)
      const delimiter = figures.lineBold.repeat(helpTipMaxLength)

      return `${delimiter}\n${helpTipLines.join('\n')}`
    }, [])

    return `${prefix} ${message} ${header}\n${!page.length ? theme.style.emptyText(emptyText) : page}\n${helpTip}${CURSOR_HIDE}`
  },
)
