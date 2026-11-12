import { expect, it } from "vitest";
import { cachePhase, dnsTrace } from "../src/lib/dns-motion";
import {
  initialDns,
  queryDns,
  changeDns,
  advanceDns,
} from "../src/lib/dns-workshop";

it("replays referrals through the resolver and never visits upstream on a cache hit", () => {
  const hit = dnsTrace("cache"),
    miss = dnsTrace("authority");
  expect(hit).toEqual([
    [52, 105],
    [173, 105],
    [52, 105],
  ]);
  expect(miss).toEqual([
    [52, 105],
    [173, 105],
    [300, 35],
    [173, 105],
    [300, 105],
    [173, 105],
    [300, 175],
    [173, 105],
    [52, 105],
  ]);
});
it("presents empty, positive, negative and expired caches without modifying the model", () => {
  const empty = initialDns();
  expect(cachePhase(empty)).toBe("empty");
  const positive = queryDns(empty);
  expect(cachePhase(positive)).toBe("positive");
  expect(cachePhase(advanceDns(positive, 60))).toBe("expired");
  const negative = queryDns(changeDns(empty, null));
  expect(cachePhase(negative)).toBe("negative");
  expect(cachePhase(advanceDns(negative, 30))).toBe("expired");
  expect(empty.cache).toBeNull();
});
