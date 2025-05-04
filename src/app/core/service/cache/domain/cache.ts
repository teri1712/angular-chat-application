export interface Cache<I, T> {
      get(i: I): T | undefined

      save(i: I, data: T): void
}