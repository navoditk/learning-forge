import { useCallback, useRef, useState } from 'react';
import type { z } from 'zod';

type Loaded<T> = { program: string; status: 'loading' | 'ready' | 'error'; data?: T };

export type ProgramResource<T> = {
  /** Data validated for the active program only; never another program's. */
  data: T | undefined;
  /** 'loading' until a response for the active program has arrived. */
  status: 'loading' | 'ready' | 'error';
  load: (program: string) => void;
};

/**
 * Loads a read-only, program-scoped GET resource. Responses are validated
 * against `schema` and discarded unless they belong to the newest request, so
 * a slow reply for a previously selected program or an older request can never
 * render. A failure is an explicit error (data already shown for the same
 * program is kept and marked stale by `status`), never an empty success.
 */
export function useProgramResource<T>(
  path: string,
  activeProgram: string,
  schema: z.ZodType<T>,
): ProgramResource<T> {
  const [state, setState] = useState<Loaded<T>>();
  const sequence = useRef(0);

  const load = useCallback(
    (program: string) => {
      const request = ++sequence.current;
      setState((current) =>
        current?.program === program
          ? { ...current, status: 'loading' }
          : { program, status: 'loading' },
      );
      fetch(`${path}?program=${encodeURIComponent(program)}`)
        .then(async (result) => {
          if (!result.ok) throw new Error('request failed');
          return schema.parse(await result.json());
        })
        .then((data) => {
          if (sequence.current === request) setState({ program, status: 'ready', data });
        })
        .catch(() => {
          if (sequence.current !== request) return;
          setState((current) =>
            current?.program === program
              ? { ...current, status: 'error' }
              : { program, status: 'error' },
          );
        });
    },
    [path, schema],
  );

  const matches = state?.program === activeProgram;
  return {
    data: matches ? state.data : undefined,
    status: matches ? state.status : 'loading',
    load,
  };
}
