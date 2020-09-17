import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import { HttpError } from 'axios-fp-ts/lib/error'

export const MethodError = { _tag: 'MethodError' } as const

export interface ValidationError {
  _tag: 'ValidationError'
  messages: Array<string>
}

export interface ProviderError {
  _tag: 'ProviderError'
  error: HttpError
}

export function validationError(es: t.Errors | Error): AppError {
  return { _tag: 'ValidationError', messages: es instanceof Error ? [es.message] : failure(es) }
}

export function providerError(er: HttpError): AppError {
  return { _tag: 'ProviderError', error: er }
}

export const ServerError = { _tag: 'ServerError' } as const

export const NotFoundError = { _tag: 'NotFoundError' } as const

export type AppError = ValidationError | ProviderError | typeof ServerError | typeof NotFoundError | typeof MethodError
