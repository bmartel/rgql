/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentNode } from "graphql";
import { WritableAtom, atom, useAtom } from "jotai";
import { useMutation } from "urql";
import { useCallback } from "react";
import { AtomEntity } from "@/lib/entity/atom";

export type CreateEntityReturn<Value extends { id: string }> = () => [
  { entity?: Partial<Value>; loading: boolean; error?: Error | string },
  (entity: Partial<Value>) => Promise<void>
];

export const createEntity = <Value extends { id: string }>(
  atomEntityInstance: AtomEntity<Value>,
  mutation: string | DocumentNode,
  fromData: (data: any) => Partial<Value> = (data) => data,
  createSource: boolean | WritableAtom<Value[], Value[]> = true
): CreateEntityReturn<Value> => {
  const createSourceAtom = atom(null, (get, set, entity: Partial<Value>) => {
    if (typeof createSource === "boolean" && createSource) {
      set(atomEntityInstance(entity as any), entity as any);
      return;
    }
    if (typeof createSource !== "boolean" && createSource) {
      const prev = get(
        createSource as WritableAtom<Value[], Value[]>
      ) as Value[];
      set(createSource as WritableAtom<Value[], Value[]>, [
        entity as any,
        ...prev,
      ]);
    }
  });

  return () => {
    const [, createEntityInstance] = useAtom(createSourceAtom);
    const [{ fetching, error, data }, performCreate] = useMutation(mutation);

    const create = useCallback(async (entity: Partial<Value>) => {
      try {
        const res = (await performCreate(entity as any)) as any;
        createEntityInstance(fromData(res.data as any));
      } catch (err) {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [
      {
        entity: !fetching ? fromData(data) : undefined,
        loading: fetching,
        error,
      },
      create,
    ];
  };
};
