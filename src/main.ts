import * as core from '@actions/core'
// import * as github from '@actions/github'
// import * as glob from '@actions/glob'
// import { GitHub } from "@actions/github/lib/utils";

import { wait } from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const tagName: string = core.getInput('tag_name')
    core.notice(`this tag name is ${tagName}`)

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
