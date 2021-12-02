import * as core from '@actions/core'
// import * as github from '@actions/github'
// import * as glob from '@actions/glob'
import { GitHub } from '@actions/github/lib/utils'
// import { context } from '@actions/github'

import { wait } from './wait'

async function run(): Promise<void> {
  try {
    const github = new GitHub({ token: process.env.GITHUB_TOKEN });


    const rel = await github.rest.repos.getReleaseByTag({
      owner: 'andelf',
      repo: 'nightly-release',
      tag: 'nightly'
    })

    core.info(`got ${rel}`)

    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const tagName: string = core.getInput('tag_name')
    core.notice(`this tag name is ${tagName}`)

    core.info(`Waiting ${ms} milliseconds ...`)

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    //console.log(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
