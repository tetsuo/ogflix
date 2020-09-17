import * as t from 'io-ts'
import * as F from 'fp-ts-fluture/lib/Future'
import { toFuture } from 'axios-fp-ts/lib/future'
import { get } from 'axios-fp-ts/lib/client'
import { expected } from 'axios-fp-ts/lib/expected'
import { HttpError } from 'axios-fp-ts/lib/error'
import { Movie, SearchResult } from './domain/tmdb'

export interface OGflix {
  search: (term: string) => F.Future<HttpError, SearchResult[]>
  movie: (id: number) => F.Future<HttpError, Movie>
}

export function ogflix(apiUrl: string): OGflix {
  return {
    search: (term: string) =>
      toFuture(get(`${apiUrl}/api/results?search_query=${encodeURIComponent(term)}`, expected(t.array(SearchResult)))),
    movie: (id: number) => toFuture(get(`${apiUrl}/api/movie/${id}`, expected(Movie))),
  }
}
