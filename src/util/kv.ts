import * as F from 'fp-ts-fluture/lib/Future'
import { pipe } from 'fp-ts/lib/function'
import { node } from 'fluture'
import { Hypertrie, HypertrieNode } from './hypertrie'

export interface KV<A> {
  get: (key: string) => F.Future<Error, HypertrieNode<A>>
  put: (key: string, value: A) => F.Future<Error, HypertrieNode<A>>
}

export function kv<A>(db: Hypertrie<A>): KV<A> {
  const update = () => db.feed.update(update)
  if (db.feed.sparse) {
    update()
  }
  return {
    get: key =>
      pipe(
        node<Error, HypertrieNode<A>>(done => db.get(key, done)),
        F.chain(a => (!a ? F.left(new Error('Not found')) : F.right(a)))
      ),
    put: (key, value) => node(done => db.put(key, value, done)),
  }
}
