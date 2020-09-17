import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import { pipe, flow, identity } from 'fp-ts/lib/function'
import { warn } from 'fp-ts/lib/Console'
import { run, Html } from '@tetsuo/elm-ts/lib/react'
import { program } from '@tetsuo/elm-ts/lib/navigation'
import { perform } from '@tetsuo/elm-ts/lib/task'
import { Dispatch } from '@tetsuo/elm-ts/lib/platform'
import { render } from 'react-dom'
import { createElement } from 'react'
import { navigate, Msg, pushUrl, updateSearchTerm, SubmitSearch } from './msg'
import { Model, zero } from './model'
import { memoize } from './function'
import { update } from './effect'
import Layout from './components/Layout'

const getHandlers = memoize((go: Dispatch<Msg>) => ({
  onLink: (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault()
    const href = ev.currentTarget.getAttribute('href')
    if (href) {
      go(pushUrl(href))
    } else {
      warn(`target missing 'href'`)()
    }
  },
  onSearchChange: (ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    ev.preventDefault()
    go(updateSearchTerm(ev.target.value))
  },
  onSearchSubmit: (ev?: React.FormEvent<HTMLDivElement>): void => {
    if (ev) {
      ev.preventDefault()
      ev.stopPropagation()
    }
    go(SubmitSearch)
  },
}))

function view(model: Model): Html<Msg> {
  return f => createElement(Layout, { model, ...getHandlers(f) })
}

const ogflix = program(
  navigate,
  flow(navigate, cmd => [
    zero(cmd.route),
    perform(
      T.task.fromIO(() => cmd),
      identity
    ),
  ]),
  update,
  view
)

export default ogflix

if (!module.parent) {
  pipe(
    O.fromNullable(document.getElementById('content')),
    O.fold(warn('#content missing'), el => run(ogflix, dom => render(dom, el)))
  )
}
