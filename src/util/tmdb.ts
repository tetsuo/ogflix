import * as t from 'io-ts'
import * as F from 'fp-ts-fluture/lib/Future'
import { toFuture } from 'axios-fp-ts/lib/future'
import { get } from 'axios-fp-ts/lib/client'
import { expected } from 'axios-fp-ts/lib/expected'
import { HttpError } from 'axios-fp-ts/lib/error'
import { SearchResultSet, Movie } from '../domain/tmdb'

const API_URL = 'https://api.themoviedb.org/3'

export interface TMDb {
  search: (term: string) => F.Future<HttpError, SearchResultSet>
  movie: (id: number) => F.Future<HttpError, t.TypeOf<typeof Movie>>
}

export function themoviedb(apiKey: string): TMDb {
  return {
    search: (term: string) =>
      toFuture(
        get(
          `${API_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(term)}&include_adult=false`,
          expected(SearchResultSet)
        )
      ),
    movie: (id: number) =>
      toFuture(
        get(
          `${API_URL}/movie/${String(id)}?api_key=${apiKey}&append_to_response=videos&include_adult=false`,
          expected(Movie)
        )
      ),
  }
}
