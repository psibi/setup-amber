import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {promises as fs, constants as fs_constants} from 'fs'
import {Octokit} from '@octokit/rest'

export enum OS {
  Linux,
  Mac,
  Windows
}

export type Release = {
  asset_id: number
  name: string
  os: OS
  tag_name: string
  download_url: string
}

export function associateOs(assetName: string): OS {
  if (assetName.includes('linux')) {
    return OS.Linux
  } else if (assetName.includes('darwin')) {
    return OS.Mac
  }
  return OS.Windows
}

// https://octokit.github.io/rest.js/v18#repos-get-latest-release
// https://octokit.github.io/rest.js/v18#repos-get-release
export async function getRelease(tag: string): Promise<Release[]> {
  try {
    const octokit = new Octokit({auth: process.env.GITHUB_TOKEN})
    const release_info = await octokit.rest.repos.getReleaseByTag({
      owner: 'fpco',
      repo: 'amber',
      tag
    })
    const releases = release_info.data.assets.map(x => ({
      asset_id: x.id,
      name: x.name,
      os: associateOs(x.name),
      tag_name: tag,
      download_url: x.browser_download_url
    }))
    return releases
  } catch (e) {
    return []
  }
}

export async function getLatestRelease(): Promise<Release[]> {
  try {
    const octokit = new Octokit({auth: process.env.GITHUB_TOKEN})
    const release_info = await octokit.rest.repos.getLatestRelease({
      owner: 'fpco',
      repo: 'amber'
    })
    const version = release_info.data.tag_name
    const releases = release_info.data.assets.map(x => ({
      asset_id: x.id,
      name: x.name,
      os: associateOs(x.name),
      tag_name: version,
      download_url: x.browser_download_url
    }))
    return releases
  } catch (e) {
    return []
  }
}

export function getAmberForMachine(releases: Release[]): Release | null {
  if (process.platform === 'linux') {
    const release = releases.filter(r => r.os === OS.Linux)
    if (release.length > 0) return release[0]
  }
  if (process.platform === 'win32') {
    const release = releases.filter(r => r.os === OS.Windows)
    if (release.length > 0) return release[0]
  }
  if (process.platform === 'darwin') {
    const release = releases.filter(r => r.os === OS.Mac)
    if (release.length > 0) return release[0]
  }
  return null
}

async function handleBadBinaryPermissions(file: string): Promise<void> {
  await fs.chmod(file, '755')
  core.debug(`Fixed file permissions (-> 0o755) for ${file}`)
}

export async function run(): Promise<void> {
  try {
    const versionSpec = core.getInput('amber-version')

    let releases
    if (!versionSpec) {
      releases = await getLatestRelease()
    } else {
      releases = await getRelease(versionSpec)
    }

    const release = getAmberForMachine(releases)

    if (release === null) {
      core.setFailed('Installation Failed')
      return
    }

    // TODO: Possibly fail if it's other architecture
    let amberFile = tc.find('amber', release.tag_name, 'x64')
    await handleBadBinaryPermissions(amberFile)

    if (!amberFile) {
      const artifact = await tc.downloadTool(release.download_url)
      core.debug(`Successfully downloaded amber ${release.tag_name}`)
      amberFile = await tc.cacheFile(
        artifact,
        'amber',
        'amber',
        release.tag_name
      )

      core.info(artifact);
      await handleBadBinaryPermissions(artifact)
    }
    core.addPath(amberFile)

    core.info(`Successfully setup amber ${release.tag_name}`)
  } catch (error: unknown) {
    core.info((error as Error).message)
    core.setFailed('Installation Failed')
  }
}

run()
