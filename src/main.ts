/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as core from '@actions/core'
// import * as github from '@actions/github'
// import * as glob from '@actions/glob'
import { GitHub } from '@actions/github/lib/utils'
import { context } from '@actions/github'

import { wait } from './wait'

async function run(): Promise<void> {
  try {
    const { GITHUB_SHA } = process.env
    const github = new GitHub({ auth: process.env.GITHUB_TOKEN })

    const tagName: string = core.getInput('tag_name')
    core.notice(`this tag name is ${tagName}`)

    //const { owner, repo } = context.repo;
    core.info(`got ${context}`)
    const owner = 'andelf'
    const repo = 'nightly-release'

    // get release
    const rel = await github.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag: 'nightly'
    })
    core.info(`got ${rel}`)

    // delete release assets
    const { data: release } = rel
    for (const asset of release.assets) {
      core.info(`found ${asset.name}`)
      await github.rest.repos.deleteReleaseAsset({
        owner,
        repo,
        asset_id: asset.id
      })
    }

    // update or create ref
    let ref
    try {
      ref = await github.rest.git.getRef({
        ...context.repo,
        ref: `tags/${tagName}`
      })
    } catch (e) {
      // Reference does not exist
    }
    if (!ref) {
      await github.rest.git.createRef({
        ...context.repo,
        ref: `refs/tags/${tagName}`,
        sha: GITHUB_SHA!
      })
      core.info(`set ref ${tagName} to ${GITHUB_SHA}`)
    } else {
      await github.rest.git.updateRef({
        ...context.repo,
        ref: `refs/tags/${tagName}`,
        sha: GITHUB_SHA!
      })
      core.info(`update ref ${tagName} to ${GITHUB_SHA}`)
    }

    const ret = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: release.id,
      name: 'Nightly Release @ 2021-12-02',
      body: 'TODO: auto generated'
    })
    core.info(`${ret}`)
    // await github.rest.repos.deleteReleaseAsset({
    //  owner: 'andelf',
    //  repo: 'nightly-release',
    //
    //})

    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

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
