export function calculateSubnet(ip: string, prefix: string | number) {
  if (!/^(0|[1-9]\d?)$/.test(String(prefix)) || Number(prefix) > 32)
    throw new Error("CIDR prefix must be an integer from 0 to 32.");
  const octets = ip.split(".");
  if (
    octets.length !== 4 ||
    octets.some((o) => !/^(0|[1-9]\d{0,2})$/.test(o) || Number(o) > 255)
  )
    throw new Error(
      "Enter four IPv4 octets between 0 and 255 (no leading zeros).",
    );
  const bits = Number(prefix),
    value = octets.reduce((n, o) => n * 256 + Number(o), 0);
  const total = 2 ** (32 - bits),
    network = Math.floor(value / total) * total,
    broadcast = network + total - 1;
  const format = (n: number) =>
    [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join(".");
  const usable = bits >= 31 ? total : total - 2;
  return {
    mask: format(2 ** 32 - total),
    network: format(network),
    broadcast: bits >= 31 ? "Not applicable" : format(broadcast),
    total,
    usable,
    range: `${format(network + (bits >= 31 ? 0 : 1))} – ${format(broadcast - (bits >= 31 ? 0 : 1))}`,
    binary: octets.map((o) => Number(o).toString(2).padStart(8, "0")).join("."),
    note:
      bits === 31
        ? "/31: both addresses are usable on a point-to-point link (RFC 3021)."
        : bits === 32
          ? "/32: a single-host route; no separate broadcast address."
          : "Conventional subnet: exclude network and broadcast addresses. /0 covers all IPv4 addresses; it includes reserved ranges.",
  };
}
