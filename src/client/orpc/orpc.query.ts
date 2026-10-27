import { nanoquery, type NanoqueryArgs } from "@nanostores/query";
import { createORPCErrorFromJson, isORPCErrorJson, toORPCError } from "@orpc/client";
import { createContext, useContext } from "solid-js";

type QueryCache = NonNullable<NanoqueryArgs["cache"]>;
type QuerySnapshot = [string, string][];

export function createQueries() {
  const cache: QueryCache = new Map();
  const [createFetcherStore, createMutatorStore] = nanoquery({
    cache,
    dedupeTime: 60_000,
    cacheLifetime: 300_000,
    onErrorRetry: null,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    cache,
    createFetcherStore,
    createMutatorStore,
    dehydrate(): QuerySnapshot {
      return [...cache].map(([key, value]) => [
        key,
        JSON.stringify({
          ...value,
          error: value.error === undefined ? undefined : toORPCError(value.error).toJSON(),
        }),
      ]);
    },
    hydrate(snapshot: QuerySnapshot) {
      for (const [key, serialized] of snapshot) {
        const value: NonNullable<ReturnType<QueryCache["get"]>> = JSON.parse(serialized);

        if (isORPCErrorJson(value.error)) value.error = createORPCErrorFromJson(value.error);
        cache.set(key, value);
      }
    },
  };
}

export type Queries = ReturnType<typeof createQueries>;
export const QueryContext = createContext<Queries>();

export function useQueries() {
  const queries = useContext(QueryContext);

  if (!queries) throw new Error("QueryContext.Provider is required");

  return queries;
}
