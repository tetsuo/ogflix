import { EventEmitter } from 'events'

interface Bitfield {
  get: Function
}

type Storage = string | ((name: string) => unknown)

export interface HypercorePeer<A> {
  feed: Hypercore<A>
  stream: any
  onextension: any
  remoteId: Buffer
  remoteBitfield: Bitfield
}
export interface Hypercore<T> extends EventEmitter {
  on(event: 'ready', cb: (err?: Error | null) => void): this
  on(event: 'close', cb: () => void): this
  on(event: 'sync', cb: () => void): this
  on(event: 'error', cb: (err: Error) => void): this
  on(event: 'download', cb: (index: number, data: Buffer) => void): this
  on(event: 'upload', cb: (index: number, data: T) => void): this
  on(event: 'data', cb: (idx: number, data: T) => void): this
  on(event: 'peer-add', cb: (peer: HypercorePeer<T>) => void): this
  on(event: 'peer-remove', cb: (peer: HypercorePeer<T>) => void): this
  on(event: 'extension', cb: (a: any, b: any) => void): this
  on(event: string, listener: Function): this
  peers: HypercorePeer<T>[]
  replicate: Function
  writable: boolean
  ready(cb: (err: Error) => void): void
  append(data: T | T[]): void
  append(data: T | T[], cb?: (err: Error | null) => void): void
  clear(index: number, cb: () => void): void
  clear(start: number, end: number, cb: () => void): void
  downloaded(): number
  downloaded(start: number): number
  downloaded(start: number, end: number): number
  has(index: number): boolean
  has(start: number, end: number): boolean
  signature(cb: (err: any, sig: any) => void): void
  signature(index: number, cb: (err: any, sig: any) => void): void
  verify(index: number, sig: Buffer, cb: (err: any, roots: any) => void): void
  close(cb?: (er: Error | null) => void): void
  get(index: number, cb: (err: Error, data: T) => void): void
  get(index: number, config: any, cb: (err: Error, data: T) => void): void
  getBatch(start: number, end: number, cb: (Err: any, data: T[]) => void): void
  getBatch(start: number, end: number, config: any, cb: (Err: any, data: T[]) => void): void
  update(cb: (er?: Error | null) => void): void
  update(seq: number, cb: (er: Error | null) => void): void
  discoveryKey: Buffer
  key: Buffer
  id: Buffer
  length: number
  bitfield: Bitfield
  sparse: boolean
  createWriteStream: Function
  createReadStream: Function
  closed: boolean
  opened: boolean
}

export interface HypercoreOptions {
  secretKey?: string | Buffer
  valueEncoding?: 'json' | 'binary'
}

export interface HypercoreConstructor {
  <T>(storage: Storage, options: HypercoreOptions): Hypercore<T>
  <T>(storage: Storage, key?: string | Buffer | null, options?: HypercoreOptions): Hypercore<T>
}

export interface HypertrieNode<A = any> {
  key: string
  keySplit: Array<string>
  seq: number
  value: A
}

export interface HypertrieOptions {
  secretKey?: string | Buffer
  valueEncoding?: any
}

export interface HypertrieConstructor {
  <A>(storage: string | Function, options: HypertrieOptions): Hypertrie<A>
  <A>(storage: string | Function, key?: string | Buffer, options?: HypertrieOptions): Hypertrie<A>
  <A>(storage: string | Function, a?: any, b?: any): Hypertrie<A>
}

export interface HypertrieReplicateOptions {
  live?: boolean
  encrypt?: boolean
  extensions?: Array<string>
}

export interface Hypertrie<A> {
  key: Buffer
  discoveryKey: Buffer
  get: <A>(key: string, cb?: (er: Error | null, a: HypertrieNode<A>) => void) => void
  getBySeq: <A>(seq: number, cb?: (er: Error | null, a: HypertrieNode<A>) => void) => void
  put: <A>(key: string, value: A, cb?: (er: Error | null, a: HypertrieNode<A>) => void) => void
  list: <A>(prefix: string, cb?: (er: Error | null, a: Array<HypertrieNode<A>>) => void) => void
  batch: <A>(records: Array<any>, cb?: (er: Error | null, a: Array<HypertrieNode<A>>) => void) => void
  ready: (cb: (er: Error | null) => void) => void
  snapshot: <T>() => Hypertrie<T>
  watch(prefix: string, onchange: () => void): EventEmitter & { destroy: () => void }
  version: number
  feed: Hypercore<A>
  iterator: <A>(
    key: string
  ) => {
    next: (cb: (er: Error | null, a: A) => void) => A
  }
  replicate: (opts: HypertrieReplicateOptions) => NodeJS.ReadWriteStream
  close: (cb: (er: Error | null) => void) => void
}

const hypertrie: HypertrieConstructor = require('hypertrie')

export default hypertrie
