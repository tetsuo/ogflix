export function memoize<A, B>(f: (a: A) => B): (a: A) => B {
  let memo: B
  let memoized = false
  return a => {
    if (!memoized) {
      memo = f(a)
      memoized = true
    }
    return memo
  }
}
