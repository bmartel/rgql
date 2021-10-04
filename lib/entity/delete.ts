/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentNode } from "graphql";
import { WritableAtom, atom, useAtom } from "jotai";
import { useMutation } from "urql";
import { useCallback } from "react";
import { AtomEntity } from "@/lib/entity/atom";

export type DeleteEntityReturn<Value extends { id: string }> = (
  id: string
) => [
  { entity?: Partial<Value>; loading: boolean; error?: Error | string },
  () => void
];

export const deleteEntity = <Value extends { id: string }>(
  atomEntityInstance: AtomEntity<Value>,
  mutation: string | DocumentNode,
  fromData: (data: any) => Partial<Value> = (data) => data,
  deleteSource: boolean | WritableAtom<Value[], Value[]> = true
): DeleteEntityReturn<Value> => {
  const deleteSourceAtom = atom(null, (get, set, id: string) => {
    if (typeof deleteSource === "boolean" && deleteSource) {
      set(atomEntityInstance({ id } as any), null as any);
      return;
    }
    if (typeof deleteSource !== "boolean" && deleteSource) {
      const prev = get(
        deleteSource as WritableAtom<Value[], Value[]>
      ) as Value[];
      set(
        deleteSource as WritableAtom<Value[], Value[]>,
        prev.filter(({ id }) => id !== id)
      );
    }
  });

  const optimisticUndoAtom = atom(
    (get) => {
      if (typeof deleteSource !== "boolean" && deleteSource) {
        return get(deleteSource);
      }
    },
    (get, set, value: { index?: number; entity: Value }) => {
      const { index, entity } = value;
      if (index === undefined || index === null) {
        set(atomEntityInstance({ id: entity.id } as any), entity);
        return;
      }
      const prev = get(
        deleteSource as WritableAtom<Value[], Value[]>
      ) as Value[];
      set(
        deleteSource as WritableAtom<Value[], Value[]>,

        [...prev.slice(0, index), entity, ...prev.slice(index)]
      );
    }
  );

  return (id: string) => {
    const [entity] = useAtom(atomEntityInstance({ id } as any));
    const [, deleteEntityInstance] = useAtom(deleteSourceAtom);
    const [sourceList, optimisticUndo] = useAtom(optimisticUndoAtom);

    const [{ fetching, error, data }, performDelete] = useMutation(mutation);

    const optimisticDelete = useCallback(async () => {
      const entityInstance = entity;
      const index = sourceList?.findIndex((val: Value) => id === val.id);

      try {
        // Delete optimistically
        deleteEntityInstance(id);

        await performDelete({ id } as any);
      } catch (_err) {
        // restore if failed
        optimisticUndo({ index, entity: entityInstance as Value });
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, entity, sourceList]);

    return [
      {
        entity: !fetching ? fromData(data) : undefined,
        loading: fetching,
        error,
      },
      optimisticDelete,
    ];
  };
};
