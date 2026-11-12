import type { DnsState } from "./dns-workshop";
export function cachePhase(s: DnsState) {
  if (!s.cache) return "empty";
  if (s.now >= s.cache.expires) return "expired";
  return s.cache.answer === null ? "negative" : "positive";
}
export function dnsTrace(source: "cache" | "authority"): [number, number][] {
  const client: [number, number] = [52, 105],
    resolver: [number, number] = [173, 105];
  return source === "cache"
    ? [client, resolver, client]
    : [
        client,
        resolver,
        [300, 35],
        resolver,
        [300, 105],
        resolver,
        [300, 175],
        resolver,
        client,
      ];
}
