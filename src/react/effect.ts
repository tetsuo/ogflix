import * as O from 'fp-ts/lib/Option'
import { none, Cmd } from '@tetsuo/elm-ts/lib/cmd'
import { pushHistory } from '@tetsuo/elm-ts/lib/navigation'
import { fold } from 'fp-ts/lib/Either'
import { get, Request } from 'axios-fp-ts/lib/client'
import { toTaskEither } from 'axios-fp-ts/lib/taskEither'
import { expected } from 'axios-fp-ts/lib/expected'
import { HttpError } from 'axios-fp-ts/lib/error'
import { attempt } from '@tetsuo/elm-ts/lib/task'
import { Lens } from 'monocle-ts'
import { Msg, Navigate, PushUrl, pushUrl as pushUrlMsg, setHttpError, setMovie, setSearchResults } from './msg'
import {
  Model,
  routeLens,
  searchTermOptional,
  searchTermLens,
  notificationLens,
  searchResultsLens,
  movieLens,
} from './model'
import { Movie, SearchResultSet } from '../domain/tmdb'
import { hrefs } from './router'
import { pipe } from 'fp-ts/lib/function'

export type Effect = [Model, Cmd<Msg>]

function withoutNotification(model: Model): Model {
  return notificationLens.set(undefined)(model)
}

function withoutSearchResults(model: Model): Model {
  return searchResultsLens.set([])(model)
}

function withoutMovie(model: Model): Model {
  return movieLens.set(undefined)(model)
}

function navigate(msg: Navigate, model: Model): Effect {
  return [withoutNotification(routeLens.set(msg.route)(model)), none]
}

function pushUrl(msg: PushUrl, model: Model): Effect {
  return [model, pushHistory(msg.url)]
}

function modify<A>(lens: Lens<Model, A>, f: (a: A) => A, model: Model): Effect {
  return [lens.modify(f)(model), none]
}

function request<A>(req: Request<A>, onLeft: (er: HttpError) => Msg, onRight: (a: A) => Msg, model: Model): Effect {
  return [model, attempt(toTaskEither(req), fold(onLeft, onRight))]
}

export function update(msg: Msg, model: Model): Effect {
  switch (msg._tag) {
    case 'SetMovie': {
      return modify(movieLens, () => msg.movie, model)
    }
    case 'SubmitSearch': {
      const searchTerm = O.toUndefined(searchTermOptional.getOption(model))
      if (!searchTerm || searchTerm.length === 0) {
        return [model, none]
      } else {
        return pushUrl(pushUrlMsg(hrefs.results({ search_query: searchTerm })), withoutNotification(model))
      }
    }
    case 'UpdateSearchTerm':
      return modify(searchTermLens, () => msg.term, model)
    case 'PushUrl':
      return pushUrl(msg, model)
    case 'Navigate': {
      const init = [withoutNotification, withoutMovie].reduce((b, a) => a(b), model)
      if (msg.route._tag === 'Results') {
        const q = O.toUndefined(msg.route.query)
        if (q) {
          return request(
            get(`/api/results?search_query=${q}`, expected(SearchResultSet)),
            setHttpError,
            res => pipe(res.results, setSearchResults),
            routeLens.set(msg.route)(init)
          )
        }
      } else if (msg.route._tag === 'Movie') {
        return request(
          get(`/api/movie/${msg.route.id}`, expected(Movie)),
          setHttpError,
          setMovie,
          routeLens.set(msg.route)(withoutSearchResults(init))
        )
      }
      return navigate(msg, withoutSearchResults(init))
    }
    case 'SetNotification':
      return modify(notificationLens, () => ({ severity: msg.severity, text: msg.text }), model)
    case 'SetHttpError':
      return modify(notificationLens, () => ({ severity: 'error' as const, text: msg.error._tag }), model)
    case 'SetSearchResults': {
      return modify(searchResultsLens, () => msg.results, model)
    }
  }
}
