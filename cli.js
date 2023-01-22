#!/usr/bin/env node
import fs from 'node:fs'
import { globbySync } from 'globby'
import sortPackageJson from './index.js'
import { parseArgs } from 'node:util'

const cliArguments = parseCliArguments()

function parseCliArguments() {
  try {
    return parseArgs({
      options: {
        check: { type: 'boolean', default: false, short: 'c' },
        quiet: { type: 'boolean', default: false, short: 'q' },
        version: { type: 'boolean', default: false, short: 'V' },
        help: { type: 'boolean', default: false, short: 'h' },
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

const patterns = cliArguments.positionals

if (!patterns.length) {
  patterns[0] = 'package.json'
}

const files = globbySync(patterns)

if (files.length === 0) {
  stderr('No matching files.')
  process.exit(1)
}

let notSortedFiles = 0

files.forEach((file) => {
  const packageJson = fs.readFileSync(file, 'utf8')
  const sorted = sortPackageJson(packageJson)

  if (sorted !== packageJson) {
    if (cliArguments.values.check) {
      notSortedFiles++
      stdout(file)
    } else {
      fs.writeFileSync(file, sorted, 'utf8')
      stdout(`${file} is sorted!`)
    }
  }
})

if (cliArguments.values.check) {
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
