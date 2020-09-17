import * as t from 'io-ts'
import * as assert from 'assert'
import * as H from 'hyper-fluture/lib/middleware'
import * as F from 'fp-ts-fluture/lib/Future'
import { Action, ExpressConnection } from 'hyper-fluture/lib/express'
import { toArray } from 'hyper-fluture/lib/llist'
import { pipe } from 'fp-ts/lib/pipeable'
import { promise } from 'fluture'
import { TMDb } from '../src/util/tmdb'
import { HttpError } from 'axios-fp-ts/lib/error'
import { Movie, SearchResultSet } from '../src/domain/tmdb'
import { kv as KV } from '../src/util/kv'
import hypertrie from '../src/util/hypertrie'
import { ogflix } from '../src'

const ram = require('random-access-memory')

const testData = {
  hello: require('../test-data/results-hello.json') as SearchResultSet,
  dulevande: require('../test-data/movie-5817.json') as Movie,
}

class MockRequest {
  constructor(
    readonly originalUrl: string = '',
    readonly body?: unknown,
    readonly headers: Record<string, string> = {},
    readonly method: string = 'GET'
  ) {}
  header(name: string) {
    return this.headers[name]
  }
}

class MockConnection extends ExpressConnection {
  constructor(req: MockRequest) {
    super(req as any, null as any)
  }
}

function createTMDb(
  search: (term: string) => F.Future<HttpError, SearchResultSet>,
  movie: (id: number) => F.Future<HttpError, t.TypeOf<typeof Movie>>
): TMDb {
  return { search, movie }
}

type Document = Movie | SearchResultSet

function assertSuccess<A>(m: H.Middleware<any, A>, cin: MockConnection, actions: Array<Action>) {
  return promise(m(cin)).then(e =>
    assert.deepStrictEqual(
      pipe(e, ([a, cout]) => [a, toArray((cout as MockConnection).actions)]),
      [undefined, actions]
    )
  )
}

// function assertFailure<L>(m: H.Middleware<L, any>, conn: MockConnection, f: (l: Error) => void) {
//   return promise(pipe(m(conn), F.mapLeft(E.toError))).catch(f)
// }

const reject = <A = never>() =>
  F.left<HttpError, A>({
    _tag: 'BadUrl',
    value: 'beep',
  })

describe('ogflix', () => {
  it('should hit cache', () => {
    const tmdb = createTMDb(reject, id => F.right({ ...testData.dulevande, ...{ id } }))
    const kv = KV<Document>(hypertrie(ram, { valueEncoding: 'json' }))
    const m = ogflix(tmdb, kv)
    return assertSuccess(m, new MockConnection(new MockRequest('/api/movie/42')), [
      { name: 'Content-Type', type: 'setHeader', value: 'application/json' },
      { body: JSON.stringify({ ...testData.dulevande, ...{ id: 42 } }), type: 'setBody' },
    ])
      .then(() => promise(kv.get('/movies/42')))
      .then(({ value }) => assert.deepStrictEqual(value, { ...testData.dulevande, ...{ id: 42 } }))
      .then(() => promise(kv.put('/movies/42', 'beepboop' as any)))
      .then(() =>
        assertSuccess(m, new MockConnection(new MockRequest('/api/movie/42')), [
          { name: 'Content-Type', type: 'setHeader', value: 'application/json' },
          { body: JSON.stringify('beepboop'), type: 'setBody' },
        ])
      )
  })
  it('should return 404 on invalid route', () => {
    const tmdb = createTMDb(reject, reject)
    const kv = KV<Document>(hypertrie(ram, { valueEncoding: 'json' }))
    const m = ogflix(tmdb, kv)
    return assertSuccess(m, new MockConnection(new MockRequest('/api/movie/stringsnotaccepted')), [
      { status: 404, type: 'setStatus' },
      { name: 'Content-Type', type: 'setHeader', value: 'application/json' },
      { body: '{"_tag":"NotFoundError"}', type: 'setBody' },
    ])
  })
  it('should raise 500 and forward provider error', () => {
    const tmdb = createTMDb(reject, reject)
    const kv = KV<Document>(hypertrie(ram, { valueEncoding: 'json' }))
    const m = ogflix(tmdb, kv)
    return assertSuccess(m, new MockConnection(new MockRequest('/api/movie/42')), [
      { status: 500, type: 'setStatus' },
      { name: 'Content-Type', type: 'setHeader', value: 'application/json' },
      { body: '{"_tag":"ProviderError","error":{"_tag":"BadUrl","value":"tmdb"}}', type: 'setBody' },
    ])
  })
  it('should not respond to empty search_query', () => {
    const tmdb = createTMDb(reject, reject)
    const kv = KV<Document>(hypertrie(ram, { valueEncoding: 'json' }))
    const m = ogflix(tmdb, kv)
    return assertSuccess(m, new MockConnection(new MockRequest('/api/results')), [
      { status: 400, type: 'setStatus' },
      { name: 'Content-Type', type: 'setHeader', value: 'application/json' },
      { body: '{"_tag":"ValidationError","messages":["empty search_query"]}', type: 'setBody' },
    ])
  })
})
