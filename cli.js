#!/usr/bin/env node
import { globbySync } from 'globby'
import fs from 'node:fs'
import { parseArgs } from 'node:util'
import sortPackageJson from './index.js'
let notSortedFiles = 0
const cliArguments = parseCliArguments()

if (cliArguments.values.help) showHelp()
else if (cliArguments.values.version) showVersion()

const files = findFiles()
if (cliArguments.values.check) checkFiles(files)
else sortFiles(files)

function parseCliArguments() {
  try {
    return parseArgs({
      options: {
        check: { type: 'boolean', short: 'c' },
        quiet: { type: 'boolean', short: 'q' },
        version: { type: 'boolean', short: 'v' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
      strict: true,
    })
  } catch (err) {
    const { message } = err
    console.error(message)
    process.exit(2)
  }
}
function showHelp() {
  console.log(
    `Usage: sort-package-json [OPTION...] [FILE...]
Sort npm package.json files. Default: ./package.json
Strings passed as files are parsed as globs.

  -c, --check                check if FILES are sorted
  -q, --quiet                don't output success messages
  -h, --help                 display this help and exit
  -v, --version              display the version and exit
  `,
  )
  process.exit(0)
}

function showVersion() {
  const packageJsonUrl = new URL('package.json', import.meta.url)
  const packageJsonBuffer = fs.readFileSync(packageJsonUrl)
  const { version } = JSON.parse(packageJsonBuffer)

  console.log(`sort-package-json ${version}`)
  process.exit(0)
}

function stdout(outputIfTTY = '', alwaysOutput = outputIfTTY) {
  if (cliArguments?.values.quiet) return
  const isTerminal =
    !!process.stdout.isTTY || Boolean(process.env.STDOUT_IS_TTY)
  if (isTerminal) {
    console.log(outputIfTTY)
  } else if (alwaysOutput !== null) {
    console.log(alwaysOutput)
  }
}

function stderr(outputIfTTY = '', alwaysOutput = outputIfTTY) {
  const isTerminal =
    !!process.stderr.isTTY || Boolean(process.env.STDERR_IS_TTY)
  if (isTerminal) {
    console.error(outputIfTTY)
  } else if (alwaysOutput !== null) {
    console.error(alwaysOutput)
  }
}

function findFiles() {
  const patterns = cliArguments.positionals

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  const files = globbySync(patterns)

  if (files.length === 0) {
    stderr('No matching files.')
    process.exit(1)
  }
  return files
}

function handleError(error, file) {
  notSortedFiles++
  stderr(
    `could not ${cliArguments.values.check ? 'check' : 'sort'} ${file}`,
    file,
  )
  stderr(error.message, null)
}

function sortFiles(files) {
  files.forEach((file) => {
    let sorted, packageJson
    try {
      packageJson = fs.readFileSync(file, 'utf8')
      sorted = sortPackageJson(packageJson)
    } catch (error) {
      handleError(error, file)
      return
    }

    if (sorted !== packageJson) {
      try {
        fs.writeFileSync(file, sorted, 'utf8')
      } catch (error) {
        handleError(error, file)
        return
      }
      stdout(`${file} is sorted!`, file)
    }
  })
}

function checkFiles(files) {
  files.forEach((file) => {
    let sorted, packageJson
    try {
      packageJson = fs.readFileSync(file, 'utf8')
      sorted = sortPackageJson(packageJson)
    } catch (error) {
      handleError(error, file)
      return
    }

    if (sorted !== packageJson) {
      notSortedFiles++
      stdout(file)
    }
  })

  stdout('', null)
  if (notSortedFiles) {
    stdout(
      notSortedFiles === 1
        ? `${notSortedFiles} of ${files.length} matched file is not sorted.`
        : `${notSortedFiles} of ${files.length} matched files are not sorted.`,
      null,
    )
  } else {
    stdout(
      files.length === 1
        ? `${files.length} matched file is sorted.`
        : `${files.length} matched files are sorted.`,
      null,
    )
  }
}
process.exit(Math.min(notSortedFiles, 255))
