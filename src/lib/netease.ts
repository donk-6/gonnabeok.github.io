/**
 * 网易云音乐歌单解析与播放数据获取工具。
 *
 * 歌单元数据来自 Meting API 公共实例（https://api.i-meto.com/meting/api），
 * 它返回带 CORS 头（Access-Control-Allow-Origin: *）的 JSON。
 * 注意：该接口返回的 type=url 音频地址目前会 404，因此播放地址改用
 * 网易云官方外链 https://music.163.com/song/media/outer/url?id=<songId>.mp3。
 * 若歌单接口整体不可用，组件会回退到网易云官方 outchain 播放器。
 */

export interface NeteaseTrack {
  title: string
  artist: string
  url: string
  pic: string
  songId: number | null
  /** Meting 原始音源地址，仅作调试参考（其 type=url 接口目前已失效）。 */
  sourceUrl?: string
}

export interface ParsedNeteaseLink {
  kind: 'playlist' | 'song' | 'album' | 'unknown'
  id?: string
}

const METING_API = 'https://api.i-meto.com/meting/api'

/**
 * 解析常见的网易云音乐歌单分享链接：
 * - https://music.163.com/#/playlist?id=3778678
 * - https://y.music.163.com/m/playlist?id=3778678
 * - https://music.163.com/playlist?id=3778678
 * - https://music.163.com/playlist/3778678.html
 */
export function parseNeteaseLink(raw: string): ParsedNeteaseLink {
  const input = raw.trim()
  if (!input) return { kind: 'unknown' }

  // 纯数字 ID 也直接当作歌单 ID，方便粘贴短链接解析失败时手动使用
  if (/^\d+$/.test(input)) return { kind: 'playlist', id: input }

  const normalized = input.replace(/\s+/g, '')
  const direct = normalized.match(/\/playlist(?:[\/?&#.]|[^0-9]*id=)(\d+)/)
  const fallback = normalized.includes('playlist')
    ? normalized.match(/[?&#]id=(\d+)/)
    : null
  const id = direct?.[1] || fallback?.[1]
  if (id) return { kind: 'playlist', id }

  if (/\/song(?:[\/?&#.]|[^0-9]*id=)/.test(normalized)) return { kind: 'song' }
  if (/\/album(?:[\/?&#.]|[^0-9]*id=)/.test(normalized)) return { kind: 'album' }

  return { kind: 'unknown' }
}

interface RawMetingTrack {
  title?: string
  author?: string
  url?: string
  pic?: string
}

function toTrack(raw: RawMetingTrack): NeteaseTrack {
  const sourceUrl = raw.url || ''
  const songId = sourceUrl.match(/[?&]id=(\d+)/)?.[1]
  return {
    title: raw.title || '未知歌曲',
    artist: raw.author || '未知歌手',
    // Meting 的 type=url 音频接口目前返回 404，改用网易云官方外链播放
    url: songId ? buildOuterAudioUrl(Number(songId)) : sourceUrl,
    pic: raw.pic || '',
    songId: songId ? Number(songId) : null,
    sourceUrl,
  }
}

/** 通过歌单 id 获取歌曲列表（含可直接播放的音频地址）。 */
export async function fetchPlaylist(id: string): Promise<NeteaseTrack[]> {
  const url =
    METING_API +
    '?server=netease&type=playlist&id=' +
    encodeURIComponent(id)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      throw new Error('歌单加载失败，请稍后重试')
    }
    const data: unknown = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('歌单是空的或暂不可用')
    }
    return data.map((item) => toTrack(item as RawMetingTrack))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('歌单加载超时，请稍后重试')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** 网易云官方单曲试听直链（无需跨域，可被 <audio> 直接播放）。 */
export function buildOuterAudioUrl(songId: number): string {
  return 'https://music.163.com/song/media/outer/url?id=' + songId + '.mp3'
}

/** 网易云官方外链播放器 iframe 地址（作为接口不可用时的兜底）。 */
export function buildPlaylistPlayerUrl(id: string): string {
  return (
    'https://music.163.com/outchain/player?type=2&id=' +
    encodeURIComponent(id) +
    '&auto=0&height=66'
  )
}
