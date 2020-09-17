import * as t from 'io-ts'
import * as F from 'fp-ts-fluture/lib/Future'
import * as path from 'path'
import { Server } from 'http'
import { sequenceS } from 'fp-ts/lib/Apply'
import { pipe, flow } from 'fp-ts/lib/function'
import { fork } from 'fluture'
import { chain, Middleware, orElse } from 'hyper-fluture/lib/middleware'
import { listen } from './util/express'
import { destroy } from './middleware/error'
import { createFromLocation } from './ogflix'
import { parseLocation } from './router'
import { kv, KV } from './util/kv'
import { themoviedb, TMDb } from './util/tmdb'
import hypertrie from './util/hypertrie'
import { Movie, SearchResultSet } from './domain/tmdb'

export interface Options {
  port: string
  tmdb: TMDb
  kv: KV<any>
}

function printObject(o: unknown): string {
  if (typeof o !== 'object' || o === null) {
    return ''
  }
  return Object.entries(o)
    .map(([k, v]) => [k, v].join('='))
    .join(' ')
}

export const ogflix = (tmdb: TMDb, kv: KV<Movie | SearchResultSet /* Document */>): Middleware<never, void> =>
  pipe(parseLocation, chain(createFromLocation(tmdb, kv)), orElse(destroy))

const main = <E = never>(): ((ma: F.Future<E, Options>) => F.Future<E, string>) =>
  flow(
    F.chain<E, Options, Server>(({ port, tmdb, kv }) => listen(ogflix(tmdb, kv), port)),
    F.map(server => `listening on ${printObject(server.address())}`)
  )

function envOrElse(key: string, defaultValue?: string) {
  return pipe(
    F.fromEither(t.string.decode(process.env[key])),
    F.orElse(() => (defaultValue ? F.right(defaultValue) : F.left(`missing env variable: ${key}`)))
  )
}

const ado = sequenceS(F.future)

const optionsFromEnv: F.Future<string, Options> = pipe(
  ado({
    port: envOrElse('PORT', '8000'),
    kv: pipe(
      envOrElse('DATA_DIR', path.resolve(__dirname + '/../../data/')),
      F.map(dir => kv(hypertrie(dir, { valueEncoding: 'json' })))
    ),
    tmdb: pipe(envOrElse('THEMOVIEDB_API_KEY'), F.map(themoviedb)),
  })
)

export default main

if (!module.parent) {
  // eslint-disable-next-line no-console
  const log = fork(console.error)(console.log)

  log(pipe(optionsFromEnv, main()))
}
