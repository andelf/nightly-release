/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as core from '@actions/core'
// import * as github from '@actions/github'
// import * as glob from '@actions/glob'
import { GitHub } from '@actions/github/lib/utils'
import { context } from '@actions/github'

async function run(): Promise<void> {
  try {
    const { GITHUB_SHA } = process.env
    const github = new GitHub({ auth: process.env.GITHUB_TOKEN })

    const tagName: string = core.getInput('tag_name')
    const isDraft: boolean = core.getInput('draft') === 'true'
    const isPrerelease: boolean = core.getInput('prerelease') === 'true'
    let name = core.getInput('name')

    core.notice(`tag name is ${tagName}`)
    if (name.includes('$$')) {
      const today = new Date()
      const nightlyName = today.toISOString().split('T')[0].replaceAll('-', '')

      name = name.replace('$$', nightlyName)
    }

    //const { owner, repo } = context.repo;
    core.info(`got context ${JSON.stringify(context.repo)}`)
    const { owner, repo } = context.repo

    // get release
    const rel = await github.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag: 'nightly'
    })
    core.info(`got release ${rel.data.name} by ${rel.data.author}`)

    // delete release assets
    const { data: release } = rel
    for (const asset of release.assets) {
      core.info(`deleting ${asset.name}`)
      await github.rest.repos.deleteReleaseAsset({
        owner,
        repo,
        asset_id: asset.id
      })
    }
    if (release.assets.length > 0) {
      core.info(`deleted ${release.assets.length} assets`)
    }

    // update or create ref
    let ref
    try {
      ref = await github.rest.git.getRef({
        owner,
        repo,
        ref: `tags/${tagName}`
      })
    } catch (e) {
      // Reference does not exist
    }
    if (!ref) {
      core.info(`set ref tags/${tagName} to ${GITHUB_SHA}`)
      await github.rest.git.createRef({
        owner,
        repo,
        ref: `tags/${tagName}`,
        sha: GITHUB_SHA!
      })
    } else {
      core.info(
        `update ref tags/${tagName} from ${ref.data.object.sha} to ${GITHUB_SHA}`
      )
      await github.rest.git.updateRef({
        owner,
        repo,
        ref: `tags/${tagName}`,
        sha: GITHUB_SHA!
      })
    }

    core.info(`update release info`)
    const ret = await github.rest.repos.updateRelease({
      owner,
      repo,
      release_id: release.id,
      name: 'Nightly Release @ 2021-12-02',
      body: 'TODO: auto generated',
      draft: isDraft,
      prerelease: isPrerelease
    })
    core.info(`${JSON.stringify(ret)}`)
    // await github.rest.repos.deleteReleaseAsset({
    //  owner: 'andelf',
    //  repo: 'nightly-release',
    //
    //})

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.error(`error: ${JSON.stringify(error)}`)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
