import { describe, it, expect } from "vitest";
import { calculateSubnet as calc } from "../src/lib/subnet";
describe("IPv4 subnet arithmetic", () => {
  it("calculates a /24", () => {
    expect(calc("192.168.1.100", 24)).toMatchObject({
      network: "192.168.1.0",
      broadcast: "192.168.1.255",
      mask: "255.255.255.0",
      usable: 254,
      range: "192.168.1.1 – 192.168.1.254",
    });
  });
  it("calculates a /26", () => {
    expect(calc("192.168.1.100", 26)).toMatchObject({
      network: "192.168.1.64",
      broadcast: "192.168.1.127",
      usable: 62,
    });
  });
  it("calculates a /30", () => {
    expect(calc("10.0.0.5", 30)).toMatchObject({
      network: "10.0.0.4",
      broadcast: "10.0.0.7",
      usable: 2,
    });
  });
  it("supports /31 point-to-point and /32 host routes", () => {
    expect(calc("255.255.255.255", 31)).toMatchObject({
      network: "255.255.255.254",
      broadcast: "Not applicable",
      usable: 2,
    });
    expect(calc("255.255.255.255", 32)).toMatchObject({
      network: "255.255.255.255",
      total: 1,
      usable: 1,
    });
  });
  it("does not overflow for /0 or high-bit addresses", () => {
    expect(calc("255.255.255.255", 0)).toMatchObject({
      mask: "0.0.0.0",
      network: "0.0.0.0",
      broadcast: "255.255.255.255",
      total: 4294967296,
      usable: 4294967294,
    });
    expect(calc("200.1.1.1", 8).network).toBe("200.0.0.0");
  });
  it.each([
    "256.0.0.1",
    "1.2.3",
    "-1.2.3.4",
    "1.2.3.4.5",
    "01.2.3.4",
    "1.2.3.x",
    "",
  ])("rejects invalid IP %s", (ip) => expect(() => calc(ip, 24)).toThrow());
  it.each(["", "33", "-1", "24.5", "1e1", " 24", "024"])(
    "rejects invalid prefix %s",
    (prefix) => expect(() => calc("1.2.3.4", prefix)).toThrow(),
  );
});
