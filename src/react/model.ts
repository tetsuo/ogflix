import { toUndefined } from 'fp-ts/lib/Option'
import * as t from 'io-ts'
import { Lens, Optional } from 'monocle-ts'
import { Movie, SearchResult } from '../domain/tmdb'
import { Location } from './router'

export const Notification = t.interface({
  severity: t.literal('error'),
  text: t.string,
})

export type Notification = t.TypeOf<typeof Notification>

export const Model = t.interface({
  route: t.unknown,
  searchTerm: t.union([t.string, t.undefined]),
  searchResults: t.array(SearchResult),
  notification: t.union([Notification, t.undefined]),
  movie: t.union([Movie, t.undefined]),
})

export type Model = t.TypeOf<typeof Model> & { route: Location }

export const routeLens = Lens.fromProp<Model>()('route')

export const searchTermOptional = Optional.fromNullableProp<Model>()('searchTerm')

export const searchTermLens = Lens.fromProp<Model>()('searchTerm')

export const notificationOptional = Optional.fromNullableProp<Model>()('notification')

export const notificationLens = Lens.fromProp<Model>()('notification')

export const searchResultsLens = Lens.fromProp<Model>()('searchResults')

export const movieLens = Lens.fromProp<Model>()('movie')

export const movieOptional = Optional.fromNullableProp<Model>()('movie')

export function zero(route: Location): Model {
  return {
    route,
    searchTerm: route._tag === 'Results' ? toUndefined(route.query) : undefined,
    notification: undefined,
    searchResults: [],
    movie: undefined,
  }
}
