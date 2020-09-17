import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { date } from 'io-ts-types/lib/date'

export const BaseMovie = t.interface({
  popularity: t.number,
  id: t.number,
  video: t.boolean,
  vote_average: t.number,
  vote_count: t.number,
  original_language: t.string,
  original_title: t.string,
  title: t.string,
  release_date: t.union([date, t.undefined, DateFromISOString, t.string]),
  backdrop_path: t.union([t.null, t.string]),
  poster_path: t.union([t.null, t.string]),
  adult: t.boolean,
  overview: t.string,
})

export const SearchResult = BaseMovie

export type SearchResult = t.TypeOf<typeof SearchResult>

export const SearchResultSet = t.interface({
  page: t.number,
  total_results: t.number,
  total_pages: t.number,
  results: t.array(SearchResult),
})

export const Genre = t.interface({
  id: t.number,
  name: t.string,
})

export const ProductionCompany = t.any

export const ProductionCountry = t.interface({
  iso_3166_1: t.string,
  name: t.string,
})

export const SpokenLanguage = t.interface({
  iso_639_1: t.string,
  name: t.string,
})

export const Video = t.interface({
  id: t.string,
  iso_639_1: t.string,
  iso_3166_1: t.string,
  key: t.string,
  name: t.string,
  site: t.string,
  size: t.number,
  type: t.string,
})

export const Collection = t.interface({
  backdrop_path: t.union([t.null, t.string]),
  poster_path: t.union([t.null, t.string]),
  name: t.string,
  id: t.number,
})

export const Movie = t.intersection([
  BaseMovie,
  t.interface({
    belongs_to_collection: t.union([t.null, Collection]),
    budget: t.number,
    genres: t.array(Genre),
    homepage: t.union([t.string, t.null]),
    imdb_id: t.union([t.string, t.null]),
    production_companies: t.array(ProductionCompany),
    production_countries: t.array(ProductionCountry),
    revenue: t.number,
    runtime: t.union([t.number, t.null]),
    spoken_languages: t.array(SpokenLanguage),
    status: t.string,
    tagline: t.string,
    videos: t.interface({
      results: t.array(Video),
    }),
  }),
])

export type Movie = t.TypeOf<typeof Movie>

export type SearchResultSet = t.TypeOf<typeof SearchResultSet>
