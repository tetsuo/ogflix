import * as F from 'fp-ts-fluture/lib/Future'
import * as H from 'hyper-fluture/lib/middleware'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'
import { GET } from './middleware/method'
import { ServerError, AppError, providerError, NotFoundError, validationError } from './domain/error'
import { Location } from './router'
import { SearchResultSet, Movie } from './domain/tmdb'
import { TMDb } from './util/tmdb'
import { KV } from './util/kv'
import { HypertrieNode } from './util/hypertrie'

function sendJSON(body: unknown): H.Middleware<AppError, void> {
  return H.json(body, () => ServerError)
}

function results(tmdb: TMDb, query: string): H.Middleware<AppError, SearchResultSet> {
  return H.fromFuture(F.future.mapLeft(tmdb.search(query), providerError))
}

function movie(tmdb: TMDb, id: number): H.Middleware<AppError, Movie> {
  return H.fromFuture(F.future.mapLeft(tmdb.movie(id), providerError))
}

function put<A>(kv: KV<A>, key: string, value: A): H.Middleware<AppError, HypertrieNode<A>> {
  return H.fromFuture(F.future.mapLeft(kv.put(key, value), () => ServerError))
}

function get<A>(kv: KV<A>, key: string): H.Middleware<AppError, HypertrieNode<A>> {
  return H.fromFuture(F.future.mapLeft(kv.get(key), () => NotFoundError))
}

type Document = Movie | SearchResultSet

export function createFromLocation(tmdb: TMDb, kv: KV<Document>): (route: Location) => H.Middleware<AppError, void> {
  return route => {
    switch (route._tag) {
      case 'Movie':
        return pipe(
          GET,
          H.apSecond(
            pipe(
              H.stateFuture.map(get(kv, `/movies/${String(route.id)}`), node => node.value),
              H.orElse(() =>
                pipe(
                  movie(tmdb, route.id),
                  H.chain(value => H.stateFuture.map(put(kv, `/movies/${String(route.id)}`, value), node => node.value))
                )
              )
            )
          ),
          H.chain(sendJSON)
        )
      case 'Results': {
        const query = O.toNullable(route.query)
        if (query) {
          return pipe(
            GET,
            H.apSecond(
              pipe(
                H.stateFuture.map(get(kv, `/results/${query}`), node => node.value),
                H.orElse(() =>
                  pipe(
                    results(tmdb, query),
                    H.chain(value => H.stateFuture.map(put(kv, `/results/${query}`, value), node => node.value))
                  )
                )
              )
            ),
            H.chain(sendJSON)
          )
        } else {
          return pipe(GET, H.apSecond(H.left(validationError(new Error('empty search_query')))), H.apSecond(H.end()))
        }
      }
    }
  }
}
