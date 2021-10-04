/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentNode } from "graphql";
import { atom, useAtom } from "jotai";
import { useQuery } from "urql";
import { useCallback, useEffect } from "react";
import { AtomEntity, PauseAtomEntity } from "@/lib/entity/atom";
import { useResetAtom } from "jotai/utils";

// eslint-disable-next-line
// @ts-ignore
const defaultPauseWhen: PauseAtomEntity = (atoms) => (get) =>
  !get(atoms.variablesAtom)?.id;

export type FindOneEntityReturn<
  Value extends { [k: string]: string | number }
> = (value: Partial<Value>) => [
  { entity: Value; loaded: boolean; loading: boolean; error?: Error | string },
  {
    reset: () => void;
    refetch: (newValue: Partial<Value>) => void;
    fetch: () => void;
  }
];

export const findOneEntity = <Value extends { [k: string]: any }>(
  atomEntityInstance: AtomEntity<Value>,
  query: string | DocumentNode,
  hasData: (data: any) => Value = (data) => data,
  fromData: (data: any) => Value = hasData,
  pauseWhen: PauseAtomEntity | boolean = defaultPauseWhen,
  initialVariables: any = {}
): FindOneEntityReturn<Value> => {
  const hasFetchedAtom = atom(false);
  const errorAtom = atom<Error | string | null>(null);
  const loadingAtom = atom(false);
  const variablesAtom = atom(initialVariables);
  const pauseAtom = atom<boolean>(
    typeof pauseWhen === "boolean" || !pauseWhen
      ? pauseWhen
      : (pauseWhen({ hasFetchedAtom, loadingAtom, variablesAtom }) as any)
  );

  return (value: Partial<Value>) => {
    const [hasFetched, setHasFetched] = useAtom(hasFetchedAtom);
    const resetHasFetched = useResetAtom(hasFetchedAtom as any);
    const [loading, setLoading] = useAtom(loadingAtom);
    const resetLoading = useResetAtom(loadingAtom as any);
    const [error, setError] = useAtom(errorAtom as any);
    const resetError = useResetAtom(errorAtom as any);
    const [variables, setVariables] = useAtom(variablesAtom);
    const resetVariables = useResetAtom(variablesAtom as any);
    const [pause] = useAtom(pauseAtom);
    const [entity, setEntity] = useAtom<Value, Value>(atomEntityInstance(value as any));

    useEffect(() => {
      setVariables((prev: any) => ({ ...prev, ...value }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const [{ fetching, error: _error, data }, refetchQuery] = useQuery({
      query,
      variables,
      pause,
    });

    useEffect(() => {
      setLoading(fetching);
      if (fetching) {
        setHasFetched(fetching);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetching]);

    useEffect(() => {
      if (!fetching && hasData(data)) {
        setEntity(fromData(data));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetching, data]);

    useEffect(() => {
      setError(_error as any);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_error]);

    const refetch = useCallback((newValue: Partial<Value>) => {
      setVariables(newValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const manualFetch = useCallback(() => {
      refetchQuery();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reset = useCallback(() => {
      resetVariables();
      resetError();
      resetLoading();
      resetHasFetched();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [
      { entity, loading, loaded: hasFetched && !loading, error: error as any },
      { reset, refetch, fetch: manualFetch },
    ];
  };
};
