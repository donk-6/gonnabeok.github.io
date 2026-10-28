/**
 * 网易云音乐歌单解析与播放数据获取工具。
 *
 * 歌单数据来自 Meting API 公共实例（https://api.i-meto.com/meting/api），
 * 它返回带 CORS 头（Access-Control-Allow-Origin: *）的 JSON，
 * 每条歌曲都附带可直接播放的音频流地址，因此前端可以用 <audio> 在线播放。
 * 若该接口不可用，组件会回退到网易云官方外链播放器保证可听。
 */

export interface NeteaseTrack {
  title: string
  artist: string
  url: string
  pic: string
  songId: number | null
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

  const direct = input.match(/\/playlist(?:[\/?&#]|\.html)[^0-9]*(\d+)/)
  const fallback = input.includes('playlist') ? input.match(/[?&#]id=(\d+)/) : null
  const id = direct?.[1] || fallback?.[1]
  if (id) return { kind: 'playlist', id }

  if (/\/song(?:[\/?&#]|\.html)/.test(input)) return { kind: 'song' }
  if (/\/album(?:[\/?&#]|\.html)/.test(input)) return { kind: 'album' }

  return { kind: 'unknown' }
}

interface RawMetingTrack {
  title?: string
  author?: string
  url?: string
  pic?: string
}

function toTrack(raw: RawMetingTrack): NeteaseTrack {
  const url = raw.url || ''
  const songId = url.match(/[?&]id=(\d+)/)?.[1]
  return {
    title: raw.title || '未知歌曲',
    artist: raw.author || '未知歌手',
    url,
    pic: raw.pic || '',
    songId: songId ? Number(songId) : null,
  }
}

/** 通过歌单 id 获取歌曲列表（含可直接播放的音频地址）。 */
export async function fetchPlaylist(id: string): Promise<NeteaseTrack[]> {
  const url =
    METING_API +
    '?server=netease&type=playlist&id=' +
    encodeURIComponent(id)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('歌单加载失败，请稍后重试')
  }
  const data: unknown = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('歌单是空的或暂不可用')
  }
  return data.map((item) => toTrack(item as RawMetingTrack))
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
