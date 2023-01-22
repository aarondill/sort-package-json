#!/usr/bin/env node
import { globbySync } from 'globby'
import fs from 'node:fs'
import { parseArgs } from 'node:util'
import sortPackageJson from './index.js'

const cliArguments = parseCliArguments()

if (cliArguments.values.help) help()
else if (cliArguments.values.version) version()

const files = findFiles()
if (cliArguments.values.check) checkFiles(files)
else sortFiles(files)

function parseCliArguments() {
  try {
    return parseArgs({
      options: {
        check: { type: 'boolean', short: 'c' },
        quiet: { type: 'boolean', short: 'q' },
        version: { type: 'boolean', short: 'V' },
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
function help() {
  console.log(
    `Usage: sort-package-json [OPTION...] [FILE...]
Sort npm package.json files. Default: ./package.json
Strings passed as files are parsed as globs.

  -c, --check                check if FILES are sorted
  -q, --quiet                don't output success messages
  -h, --help                 display this help and exit
  -V, --version              display the version and exit
  `,
  )
  process.exit(0)
}

function version() {
  const cliParentDir = new URL('package.json', import.meta.url)
  const packageJsonBuffer = fs.readFileSync(cliParentDir)
  const { version } = JSON.parse(packageJsonBuffer)

  console.log(`sort-package-json ${version}`)
  process.exit(0)
}

function stdout(outputIfTTY = '', alwaysOutput = outputIfTTY) {
  if (cliArguments?.values.quiet) return
  const isTerminal = !!process.stdout.isTTY
  if (isTerminal) {
    console.log(outputIfTTY)
  } else if (alwaysOutput !== null) {
    console.log(alwaysOutput)
  }
}

function stderr(outputIfTTY = '', alwaysOutput = outputIfTTY) {
  if (cliArguments?.values.quiet) return
  const isTerminal = !!process.stderr.isTTY
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

function sortFiles(files) {
  files.forEach((file) => {
    const packageJson = fs.readFileSync(file, 'utf8')
    const sorted = sortPackageJson(packageJson)

    if (sorted !== packageJson) {
      fs.writeFileSync(file, sorted, 'utf8')
      stdout(`${file} is sorted!`)
    }
  })
}

function checkFiles(files) {
  let notSortedFiles = 0
  files.forEach((file) => {
    const packageJson = fs.readFileSync(file, 'utf8')
    const sorted = sortPackageJson(packageJson)

    if (sorted !== packageJson) {
      notSortedFiles++
      stdout(file)
    }
  })

  stdout()
  if (notSortedFiles) {
    stdout(
      notSortedFiles === 1
        ? `${notSortedFiles} of ${files.length} matched file is not sorted.`
        : `${notSortedFiles} of ${files.length} matched files are not sorted.`,
    )
  } else {
    stdout(
      files.length === 1
        ? `${files.length} matched file is sorted.`
        : `${files.length} matched files are sorted.`,
    )
  }
  process.exit(notSortedFiles)
}
