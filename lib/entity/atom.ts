/* eslint-disable @typescript-eslint/no-explicit-any */
import { Atom, atom, Getter, WritableAtom } from "jotai";
import { atomFamily } from "jotai/utils";

type ShouldRemove<Param> = (createdAt: number, param: Param) => boolean;
type AtomFamily<Param, AtomType> = {
  (param: Param): AtomType;
  remove(param: Param): void;
  setShouldRemove(shouldRemove: ShouldRemove<Param> | null): void;
};

export type PauseAtomEntity = (
  atoms: Record<string, Atom<any>>
) => (get: Getter) => boolean;

export type AtomEntity<Value = Record<string, any>> = AtomFamily<
  Value,
  WritableAtom<Value, Value>
> & {
  idKey: string;
  targetKey: string;
  atom: WritableAtom<Record<string, Value>, Record<string, Value>>;
};

const lookupTarget = new WeakMap<Record<string, any>, string>();

export const atomEntity = <Value extends { [k: string]: any }>(
  idKey = "id",
  targetKey = idKey,
  related?: {
    [k in keyof Omit<Value, "id">]:
      | AtomEntity<Omit<Value, "id">[k]>
      | [AtomEntity<Omit<Value, "id">[k][0]>];
  },
  hydrate: Record<string, Value> = {}
): AtomEntity<Value> => {
  const writableAtom = atom(hydrate);
  const entityDef = atomFamily<Value, Value, Value>(
    (init) => {
      // eslint-disable-next-line
      let { [idKey]: id, ...values } = init;
      id = id?.toString();
      return atom(
        (get) => {
          const lookupId = id || lookupTarget.get(init);
          const entity = (get(writableAtom) as any)[lookupId] || {
            [idKey]: lookupId,
            ...values,
          };
          if (related) {
            return Object.entries(related).reduce(
              (resolved, [key, lookup]) => ({
                ...resolved,
                [key]: Array.isArray(lookup)
                  ? entity?.[key]
                      ?.map((relatedId: string) =>
                        get(
                          (lookup[0] as any)({
                            [idKey]: relatedId?.toString(),
                          } as any)
                        )
                      )
                      .filter(Boolean)
                  : get(
                      (lookup as any)({
                        [idKey]: (entity?.[key] || id)?.toString(),
                      } as any)
                    ),
              }),
              entity
            );
          }
          return entity;
        },
        (get, set, update) => {
          if (!update) return;
          const entityId = (id || update[idKey])?.toString();
          if (!entityId) return;

          const prev = get(writableAtom) as any;
          const next = {
            ...prev,
            [update[targetKey]]: null,
            [entityId]: {
              ...(prev[entityId] || prev[update[targetKey]]),
              ...update,
            },
          } as any;
          if (targetKey !== idKey && update[targetKey]) {
            lookupTarget.set(init, entityId);
            delete next[update[targetKey]];
          }
          if (related) {
            Object.entries(related).map(([key, lookup]) => {
              if (Array.isArray(lookup)) {
                const lookupAtom = lookup[0] as any;

                next[entityId][key] = next[entityId][key]
                  ?.map((relatedEntity: any) => {
                    if (
                      typeof relatedEntity === "string" ||
                      typeof relatedEntity === "number"
                    ) {
                      return relatedEntity.toString();
                    }
                    if (relatedEntity?.[lookupAtom.idKey]) {
                      const idString =
                        relatedEntity[lookupAtom.idKey].toString();

                      let mergeOriginal = {};
                      if (
                        lookupAtom.idKey !== lookupAtom.targetKey &&
                        relatedEntity?.[lookupAtom.targetKey]
                      ) {
                        const original = get(
                          lookupAtom({
                            [lookupAtom.targetKey]:
                              relatedEntity[lookupAtom.targetKey].toString(),
                          })
                        );
                        if (typeof original === "object" && original) {
                          mergeOriginal = original;
                          set(
                            lookupAtom({
                              [lookupAtom.targetKey]:
                                relatedEntity[lookupAtom.targetKey].toString(),
                            }),
                            null
                          );
                        }
                      }
                      set(lookupAtom({ [lookupAtom.idKey]: idString }), {
                        ...mergeOriginal,
                        ...relatedEntity,
                        [lookupAtom.idKey]: idString,
                      });
                      return idString;
                    }
                  })
                  .filter(Boolean);
              } else {
                if (key in update) {
                  const lookupAtom = lookup as any;
                  const idString = (
                    next[entityId][key]?.[lookupAtom.idKey] || entityId
                  )?.toString();

                  set(lookupAtom({ [lookupAtom.idKey]: idString }), {
                    ...(update as any)[key],
                    [lookupAtom.idKey]: idString,
                  });
                  next[entityId][key] = (
                    next[entityId][key]?.[lookupAtom.idKey] || entityId
                  )?.toString();
                }
              }
            });
          }
          set(writableAtom as any, next);
        }
      );
    },
    (a, b) => a?.[idKey] === b?.[idKey]
  );

  (entityDef as any).idKey = idKey;
  (entityDef as any).atom = writableAtom;

  return entityDef as any;
};
