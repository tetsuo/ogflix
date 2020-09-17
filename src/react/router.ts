import * as t from 'io-ts'
import { Match, parse as parse_, Route as Route_, end, zero, lit, query, int } from 'fp-ts-routing'
import { fromNullable, Option } from 'fp-ts/lib/Option'

export const SearchQuery = t.interface({
  search_query: t.union([t.string, t.undefined]),
})

export const resultsMatch = lit('results').then(query(SearchQuery))

export const movieMatch = lit('movie').then(int('id'))

export type Movie = {
  _tag: 'Movie'
  id: number
}

export type Results = {
  _tag: 'Results'
  query: Option<string>
}

const NotFound = { _tag: 'NotFound' } as const

const Home = { _tag: 'Home' } as const

export type Location = Movie | Results | typeof NotFound | typeof Home

const movie = (id: number): Movie => ({ _tag: 'Movie', id })

const results = (query: Option<string>): Results => ({ _tag: 'Results', query })

export const router = zero<Location>()
  .alt(end.parser.map(() => Home))
  .alt(movieMatch.parser.map(x => movie(x.id)))
  .alt(resultsMatch.parser.map(x => results(fromNullable(x.search_query))))

export function parse(s: string): Location {
  return parse_(router, Route_.parse(s), NotFound)
}

function toFormatter<A>(match: Match<A>): (a: A) => string {
  return a => match.formatter.run(Route_.empty, a).toString()
}

export const hrefs = {
  home: toFormatter(end)({}),
  movie: toFormatter(movieMatch),
  results: toFormatter(resultsMatch),
}

export const routes = {
  Home,
  NotFound,
}
