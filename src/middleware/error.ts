import { pipe } from 'fp-ts/lib/pipeable'
import * as H from 'hyper-fluture/lib/middleware'
import { AppError, ProviderError } from '../domain/error'

function sendError<E = never>(code: H.Status, er: AppError): H.Middleware<E, void> {
  return pipe(H.status(code), H.apSecond(H.json(er, () => er._tag)), H.orElse(H.send))
}

export function destroy<E = never>(er: AppError): H.Middleware<E, void> {
  switch (er._tag) {
    case 'ProviderError':
      return sendError(H.Status.ServerError, {
        ...er,
        ...{ error: { _tag: er.error._tag, value: 'tmdb' } },
      } as ProviderError)
    case 'ValidationError':
      return sendError(H.Status.BadRequest, er)
    case 'ServerError':
      return sendError(H.Status.ServerError, er)
    case 'NotFoundError':
      return sendError(H.Status.NotFound, er)
    case 'MethodError':
      return sendError(H.Status.MethodNotAllowed, er)
  }
}
