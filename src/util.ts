import { basename } from 'path'
// eslint-disable-next-line sort-imports
import { readFileSync, statSync } from 'fs'
import { getType } from 'mime'

export const parseInputFiles = (files: string): string[] => {
  return files.split(/\r?\n/).reduce<string[]>(
    (acc, line) =>
      acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()),
    []
  )
}

export interface ReleaseAsset {
  name: string
  mime: string
  size: number
  data: Buffer
}

export const mimeOrDefault = (path: string): string => {
  return getType(path) || 'application/octet-stream'
}

export const readAsset = (path: string): ReleaseAsset => {
  return {
    name: basename(path),
    mime: mimeOrDefault(path),
    size: statSync(path).size,
    data: readFileSync(path)
  }
}

export const uploadUrl = (url: string): string => {
  const templateMarkerPos = url.indexOf('{')
  if (templateMarkerPos > -1) {
    return url.substring(0, templateMarkerPos)
  }
  return url
}
