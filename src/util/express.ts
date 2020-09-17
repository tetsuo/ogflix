import express from 'express'
import { toRequestHandler } from 'hyper-fluture/lib/express'
import { Middleware } from 'hyper-fluture/lib/middleware'
import { Server } from 'http'
import { node } from 'fluture'
import { Future } from 'fp-ts-fluture/lib/Future'

export function listen<E = never>(ma: Middleware<E, void>, port: string): Future<E, Server> {
  return node(go => {
    const app = express().use(toRequestHandler(ma))
    const server: Server = app.listen(port, () => go(null, server))
  })
}
