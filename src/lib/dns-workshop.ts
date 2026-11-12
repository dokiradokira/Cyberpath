export type DnsState = {
  now: number;
  authority: string | null;
  cache: { answer: string | null; expires: number } | null;
  answer: string | null | undefined;
  source: "authority" | "cache" | null;
  queries: number;
};
export const initialDns = (): DnsState => ({
  now: 0,
  authority: "192.0.2.10",
  cache: null,
  answer: undefined,
  source: null,
  queries: 0,
});
export function queryDns(s: DnsState): DnsState {
  if (s.cache && s.now < s.cache.expires)
    return {
      ...s,
      answer: s.cache.answer,
      source: "cache",
      queries: s.queries + 1,
    };
  return {
    ...s,
    answer: s.authority,
    source: "authority",
    cache: {
      answer: s.authority,
      expires: s.now + (s.authority === null ? 30 : 60),
    },
    queries: s.queries + 1,
  };
}
export const advanceDns = (s: DnsState, seconds: number): DnsState => ({
  ...s,
  now: s.now + Math.max(0, seconds),
});
export const changeDns = (s: DnsState, authority: string | null): DnsState => ({
  ...s,
  authority,
});
