import * as t from 'io-ts'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts-routing'
import * as F from 'fp-ts-fluture/lib/Future'
import { pipe } from 'fp-ts/lib/pipeable'
import { lit, query, int, zero } from 'fp-ts-routing'
import { Middleware, fromConnection } from 'hyper-fluture/lib/middleware'
import { NotFoundError, AppError } from './domain/error'

export const SearchQuery = t.interface({
  search_query: t.union([t.string, t.undefined]),
})

export const results = lit('api').then(lit('results').then(query(SearchQuery)))

export const movie = lit('api').then(lit('movie').then(int('id')))

export type Movie = {
  _tag: 'Movie'
  id: number
}

export type Results = {
  _tag: 'Results'
  query: O.Option<string>
}

export function movieLocation(id: number): Movie {
  return { _tag: 'Movie', id }
}

export function resultsLocation(query: O.Option<string>): Results {
  return { _tag: 'Results', query }
}

export type Location = Movie | Results

const locationParser = zero<Location>()
  .alt(
    movie.parser.map(({ id }) => ({
      _tag: 'Movie',
      id,
    }))
  )
  .alt(
    results.parser.map(q => ({
      _tag: 'Results',
      query: O.fromNullable(q.search_query),
    }))
  )

export function fromParser<L, A extends object>(parser: P.Parser<A>, error: L): Middleware<L, A> {
  const e = F.left<L, A>(error)
  return fromConnection(c =>
    pipe(
      O.tryCatch(() => P.Route.parse(c.getOriginalUrl())),
      O.chain(x => parser.run(x)),
      O.map(([a]) => F.right<L, A>(a)),
      O.getOrElse(() => e)
    )
  )
}

export const parseLocation = fromParser<AppError, Location>(locationParser, NotFoundError)
