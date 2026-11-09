import { availableLessons } from "./lessons";
import type { Vocabulary } from "../types";
export type WordEntry = Vocabulary & {
  readonly id: string;
  lessonId: string;
  example: string;
};
// Explicit examples avoid silently replacing a usage example with a definition.
const courseExamples: Record<string, string> = {
  packet: "A firewall checks a packet before allowing it into the network.",
  protocol:
    "TLS is a protocol that protects data sent between a browser and a server.",
  destination:
    "The router uses the destination IP address to choose the next hop.",
  authentication:
    "Multi-factor authentication helps protect an account when a password is stolen.",
  resolver:
    "A DNS resolver can return a cached answer without querying the authoritative server again.",
  acknowledgment:
    "A TCP acknowledgment tells the sender which byte the receiver expects next.",
  encryption: "HTTPS uses encryption to protect application data in transit.",
  reliability:
    "TCP provides reliability, but it does not encrypt the application data.",
  subnet:
    "A network administrator can place guest devices in a separate subnet.",
  gateway: "The default gateway forwards a packet toward a different network.",
  broadcast:
    "An IPv4 broadcast stays within its broadcast domain unless a special relay is used.",
  translation:
    "Address translation changes packet addresses; it does not replace a firewall policy.",
};
const extras: [number, string, string, string, string][] = [
  [
    1,
    "network",
    "网络",
    "Connected devices that exchange data.",
    "A network connects devices so they can share data.",
  ],
  [
    1,
    "router",
    "路由器",
    "A device that forwards packets between IP networks.",
    "The router forwards a packet to another network.",
  ],
  [
    1,
    "endpoint",
    "通信端点",
    "A device or application at one end of a communication.",
    "A phone can be an endpoint on a network.",
  ],
  [
    1,
    "payload",
    "有效载荷",
    "The useful data carried inside a packet.",
    "The packet carries a message in its payload.",
  ],
  [
    1,
    "confidentiality",
    "机密性",
    "Keeping information from unauthorized readers.",
    "Encryption helps protect confidentiality.",
  ],
  [
    1,
    "integrity",
    "完整性",
    "Protection against unauthorized changes.",
    "TLS helps protect the integrity of data in transit.",
  ],
  [
    1,
    "availability",
    "可用性",
    "Keeping a system accessible when needed.",
    "A network outage reduces availability.",
  ],
  [
    1,
    "authorization",
    "授权",
    "Deciding what an authenticated identity may access.",
    "Authorization limits which files a user can read.",
  ],
  [
    1,
    "port",
    "端口",
    "A transport-layer number that identifies an application endpoint.",
    "HTTPS commonly uses TCP port 443.",
  ],
  [
    2,
    "cache",
    "缓存",
    "Stored information reused to avoid repeated work.",
    "A valid cache entry can skip a DNS query.",
  ],
  [
    2,
    "authoritative",
    "权威的",
    "Responsible for the original DNS data for a zone.",
    "The authoritative server provides the DNS record.",
  ],
  [
    2,
    "retransmission",
    "重传",
    "Sending data again after loss or an acknowledgment timeout.",
    "TCP can use retransmission to recover missing bytes.",
  ],
  [
    2,
    "handshake",
    "握手",
    "An exchange used to establish communication parameters.",
    "TCP normally starts with a three-way handshake.",
  ],
  [
    2,
    "certificate",
    "证书",
    "A signed statement that binds an identity to a public key.",
    "The browser checks the server certificate.",
  ],
  [
    2,
    "datagram",
    "数据报",
    "An independent message sent by a datagram protocol.",
    "UDP sends individual datagrams.",
  ],
  [
    2,
    "congestion",
    "拥塞",
    "A condition where offered traffic exceeds network capacity.",
    "TCP uses congestion control to adapt its sending rate.",
  ],
  [
    3,
    "prefix",
    "前缀",
    "Leading address bits that identify an IP network.",
    "A /24 prefix contains 24 network bits.",
  ],
  [
    3,
    "routing",
    "路由选择",
    "Choosing a path or next hop for a packet.",
    "Routing uses the longest matching prefix.",
  ],
  [
    3,
    "mapping",
    "映射",
    "An association between original and translated endpoints.",
    "PAT stores a mapping for reply traffic.",
  ],
  [
    3,
    "firewall",
    "防火墙",
    "A system that allows or blocks traffic according to policy.",
    "A firewall enforces traffic policy; NAT translates addresses.",
  ],
  [
    3,
    "private",
    "私有的",
    "Used within a private network rather than globally routed.",
    "192.168.1.100 is a private IPv4 address.",
  ],
  [
    3,
    "reserved",
    "保留的",
    "Set aside for a defined purpose.",
    "203.0.113.0/24 is reserved for documentation.",
  ],
];
export const wordEntries: WordEntry[] = [
  ...availableLessons.flatMap((l) =>
    l.vocabulary.map((v) => ({
      ...v,
      id: v.word,
      lessonId: l.id,
      example: courseExamples[v.word],
    })),
  ),
  ...extras.map(([number, word, zh, definition, example]) => ({
    id: word,
    word,
    zh,
    definition,
    example,
    lessonId: availableLessons[number - 1].id,
  })),
];
