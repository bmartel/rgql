/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentNode } from "graphql";
import { useAtom } from "jotai";
import { useMutation } from "urql";
import { useCallback } from "react";
import { AtomEntity } from "@/lib/entity/atom";

export type UpdateEntityReturn<Value extends { id: string }> = (
  id: string
) => [
  { entity?: Partial<Value>; loading: boolean; error?: Error | string },
  (value: Partial<Value>) => Promise<void>
];

export const updateEntity = <Value extends { id: string }>(
  atomEntityInstance: AtomEntity<Value>,
  mutation: string | DocumentNode,
  fromData: (data: any) => Partial<Value> = (data) => data
): UpdateEntityReturn<Value> => {
  return (id: string) => {
    const [entity, updateEntityInstance] = useAtom<Value, Value>(
      atomEntityInstance({ id } as any)
    );
    const [{ fetching, error, data }, performUpdate] = useMutation(mutation);

    const optimisticUpdate = useCallback(
      async (value: Partial<Value>) => {
        try {
          // Update optimistically
          updateEntityInstance({ ...value, id } as any);

          await performUpdate({ ...value, id } as any);
        } catch (_err) {
          // restore if failed
          updateEntityInstance({ ...entity, id });
        }

      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id, entity]
    );

    return [
      {
        entity: !fetching ? fromData(data) : undefined,
        loading: fetching,
        error,
      },
      optimisticUpdate,
    ];
  };
};
