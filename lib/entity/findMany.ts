/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react'
import { DocumentNode } from 'graphql'
import { Atom, WritableAtom, atom, useAtom } from 'jotai'
import { RESET, useResetAtom } from 'jotai/utils'
import { useQuery } from 'urql'
import { AtomEntity, PauseAtomEntity } from '@/lib/entity/atom'
import { defaultPagination, Pagination, PaginatedValue } from '@/lib/entity/pagination'
import { uniqBy } from '@/lib/entity/utils'

// eslint-disable-next-line
// @ts-ignore
const defaultPauseWhen: PauseAtomEntity = (atoms) => (get) => !get(atoms.paginationAtom)?.hasMore

export type FindManyEntitiesReturn<Value extends { id: string }> = ((vars?: any) => [
  {
    entities: Value[]
    loaded: boolean
    loading: boolean
    pagination: Pagination
    error?: Error | string
  },
  {
    refetch: (newValue?: Partial<Value> & Pick<Value, 'id'>) => void
    fetch: () => void
    reset: () => void
    loadPrevious: () => void
    loadNext: () => void
    setPagination: Dispatch<SetStateAction<Pagination>>
  },
]) & { entitiesAtom: WritableAtom<Value[], Value[]> }

export const findManyEntities = <Value extends { id: string }>(
  atomEntityInstance: AtomEntity<Value>,
  query: string | DocumentNode,
  hasData: (data: any) => Value[] | PaginatedValue<Value> = (data) => data,
  fromData: (data: any) => Value[] | PaginatedValue<Value> = hasData,
  listAtom?: Atom<Value[]>,
  pauseWhen: PauseAtomEntity | boolean = defaultPauseWhen,
  initialVariables: any = {},
  paginated = true,
  hydrate?: Value[],
): FindManyEntitiesReturn<Value> => {
  const hasFetchedAtom = atom<number>(hydrate?.length ? 1 : -1)
  const loadingAtom = atom(false)
  const errorAtom = atom(null as Error | string | null)
  const variablesAtom = paginated
    ? atom({
        ...initialVariables,
        pagination: initialVariables.pagination || defaultPagination,
      })
    : (atom(initialVariables) as WritableAtom<any, any>)
  const paginationAtom = paginated
    ? atom(
        (get) => (get(variablesAtom) as any).pagination || defaultPagination,
        (get, set, update: any) => {
          const prev = get(variablesAtom) as any
          if (update === RESET) {
            set(variablesAtom, { ...prev, pagination: defaultPagination })
          } else {
            set(variablesAtom, {
              ...prev,
              pagination: { ...prev.pagination, ...update },
            })
          }
        },
      )
    : atom({})
  const pauseAtom = atom<boolean>(
    typeof pauseWhen === 'boolean' || !pauseWhen
      ? Boolean(pauseWhen)
      : (pauseWhen({
          hasFetchedAtom,
          loadingAtom,
          variablesAtom,
          paginationAtom,
        }) as any),
  )
  const entityIdsAtom = listAtom
    ? null
    : atom<string[]>(
        (hydrate
          ?.map((entity) => {
            if (!entity?.id) {
              return null
            }
            atomEntityInstance(entity)
            return entity.id
          })
          .filter(Boolean) as string[]) || [],
      )
  const entitiesAtom =
    listAtom ||
    atom(
      (get) =>
        // eslint-disable-next-line
        get(entityIdsAtom!)
          ?.map((id) => get(atomEntityInstance({ id } as any)))
          ?.filter(Boolean),
      (_get, set, update: any[] | typeof RESET) => {
        if (update === RESET) {
          // eslint-disable-next-line
          set(entityIdsAtom!, [])
          return
        }
        set(
          // eslint-disable-next-line
          entityIdsAtom!,
          update.map((u) => {
            set(atomEntityInstance({ id: u.id } as any), u)
            return u.id
          }),
        )
      },
    )

  function findManyHook(vars?: any) {
    const entitiesRef = useRef<Value[]>([])
    const [hasFetched, setHasFetched] = useAtom(hasFetchedAtom as any)
    const resetHasFetched = useResetAtom(hasFetchedAtom as any)
    const [loading, setLoading] = useAtom(loadingAtom)
    const resetLoading = useResetAtom(loadingAtom as any)
    const [error, setError] = useAtom(errorAtom)
    const resetError = useResetAtom(errorAtom as any)
    const [variables, setVariables] = useAtom(variablesAtom)
    const resetVariables = useResetAtom(variablesAtom)
    const [pagination, setPagination] = useAtom(paginationAtom)
    const [pause] = useAtom(pauseAtom)
    const [entities, setEntities] = useAtom(entitiesAtom as any)
    const resetEntities = useResetAtom(entitiesAtom as any)

    // Ensure useEffect can have a non stale reference without triggering recalcs
    entitiesRef.current = entities as any

    useEffect(() => {
      if (vars) {
        setVariables((prev: any) => ({ ...prev, ...vars }))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vars])

    const [{ fetching, error: _error, data }, refetchQuery] = useQuery({
      query,
      variables,
      pause,
    })

    useEffect(() => {
      setLoading(fetching)
      if (fetching) {
        setHasFetched(0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetching])

    useEffect(() => {
      setError(_error as any)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_error])

    useEffect(() => {
      if (!fetching && hasData(data)) {
        if (paginated) {
          const { items, pagination } = fromData(data) as PaginatedValue<Value>
          setEntities(
            uniqBy([...(entitiesRef.current || ([] as any)), ...(items || [])], 'id') as any,
          )
          setPagination({ hasMore: !!pagination?.hasMore })
        } else {
          setEntities(
            uniqBy(
              [...(entitiesRef.current || ([] as any)), ...((fromData(data) as Value[]) || [])],
              'id',
            ) as any,
          )
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetching, data])

    const manualFetch = useCallback(() => {
      refetchQuery()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const refetch = useCallback((newValue?: Partial<Value> & Pick<Value, 'id'>) => {
      // If wanting to just refetch the current, just delegate to manualFetch (urql refetch)
      if (!newValue) {
        manualFetch()
        return
      }
      setVariables(newValue)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const reset = useCallback(() => {
      resetVariables()
      resetEntities()
      resetError()
      resetLoading()
      resetHasFetched()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadNext = useCallback(() => {
      setPagination({
        offset: pagination.offset + pagination.limit,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination])

    const loadPrevious = useCallback(() => {
      setPagination({
        offset: Math.max(pagination.offset - pagination.limit, 0),
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination])

    return [
      {
        entities,
        loading,
        loaded: (hasFetched as number) > -1 && !loading,
        pagination,
        error,
      },
      {
        refetch,
        fetch: manualFetch,
        reset,
        loadPrevious,
        loadNext,
        setPagination,
      },
    ]
  }

  // Keep a reference on the function itself to the entitiesAtom for Create/Delete purposes
  findManyHook.entitiesAtom = entitiesAtom as any

  return findManyHook as any
}
