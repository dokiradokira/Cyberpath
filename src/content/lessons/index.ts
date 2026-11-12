import type { Lesson } from "../../types";
import { dnsWorkshop } from "./dns-workshop";
import { foundationsLessons } from "./foundations";
export const lessons: Lesson[] = [
  {
    id: "network-foundations",
    number: 1,
    title: "Introduction to Computer Networks",
    zh: "计算机网络入门",
    description:
      "Follow a packet. Meet the devices, addresses, and rules that connect us.",
    minutes: 30,
    available: true,
    objectives: [
      "Explain what a network connects and why protocols matter.",
      "Distinguish LANs, WANs, IP addresses, and ports.",
      "Read basic Windows network diagnostics safely.",
    ],
    sections: [
      {
        id: "what-is-a-network",
        title: "What is a computer network?",
        text: "A computer network connects devices so they can exchange data and share services. Your laptop, phone, printer, and a web server are all possible endpoints. A protocol is an agreed set of rules for communication. Data is split into smaller units called packets, which carry addressing information as well as a payload. A packet is like an envelope: the address helps deliver it, while the payload contains the message. Different layers use different units; Ethernet uses frames and TCP carries segments.",
      },
      {
        id: "devices-and-communication",
        title: "Devices and communication",
        text: "A network interface connects a device to a network, through Wi-Fi or a cable. A switch forwards Ethernet frames within a local network using MAC addresses. A wireless access point connects wireless devices to that network. A router forwards IP packets between networks. A home router often combines routing, switching, Wi-Fi, DHCP, and a firewall in one box. These are separate functions even when one device performs them all.",
      },
      {
        id: "lan-and-wan",
        title: "LAN and WAN",
        text: "A local area network (LAN) covers a limited area, such as a home, classroom, or office. A wide area network (WAN) connects networks over larger distances, often through a service provider. The Internet is a network of interconnected networks. Wi-Fi describes a wireless connection technology; it is not another name for the Internet. You can be connected to Wi-Fi and still have no Internet access.",
      },
      {
        id: "ip-addresses-and-routers",
        title: "IP addresses and routers",
        text: "An IP address identifies a network interface for IP communication. IPv4 addresses use four decimal numbers from 0 to 255, such as 192.168.1.100. The subnet prefix tells the device which destinations are on its local network. For another network, it usually sends the packet to its default gateway, a router on the local link. Routers examine the destination IP and choose a next hop using a routing table. Addresses may change; an IP address is not a permanent personal identity.",
      },
      {
        id: "ports-identify-services",
        title: "Ports identify services",
        text: "An IP address helps reach a host; a transport port helps identify an application endpoint on that host. TCP and UDP ports are separate 16-bit namespaces, ranging from 0 to 65535. For example, HTTPS commonly uses TCP port 443, while DNS commonly uses UDP port 53 and also supports TCP. A browser normally uses a temporary source port to contact a server's service port. A port number alone does not prove which application is running or whether it is safe.",
      },
      {
        id: "network-security",
        title: "A first look at network security",
        text: "Network security protects confidentiality (keeping data private), integrity (preventing unauthorized changes), and availability (keeping services usable). Encryption protects data in transit; authentication checks identity; authorization controls what that identity can do. Keep software updated, use strong unique passwords, and only practice on systems you own or have permission to use. A connected device is not automatically trustworthy.",
      },
    ],
    vocabulary: [
      {
        word: "packet",
        zh: "数据包",
        definition: "A small unit of data carried across a network.",
      },
      {
        word: "protocol",
        zh: "协议",
        definition: "Rules that devices follow to communicate.",
      },
      {
        word: "destination",
        zh: "目的地",
        definition: "The place a message is sent to.",
      },
      {
        word: "authentication",
        zh: "身份认证",
        definition: "Checking that an identity is genuine.",
      },
    ],
    labs: ["tcp"],
    commands: [
      {
        command: "ipconfig",
        explanation:
          "Run in Windows Terminal or Command Prompt. Find IPv4 Address, Subnet Mask, and Default Gateway under your active adapter. Disconnected adapters may have no address.",
      },
      {
        command: "ping 127.0.0.1",
        explanation:
          "Tests the local IP stack with ICMP echo. Replies show local connectivity, not Internet connectivity. A timeout elsewhere may mean filtering, not necessarily a failed host.",
      },
      {
        command: "nslookup example.com",
        explanation:
          "Asks your configured DNS resolver for records. Read the resolver and returned addresses separately. Answers can vary by location and time.",
      },
    ],
    quiz: [
      {
        id: "n1",
        prompt: "What is the main purpose of a computer network?",
        options: [
          "Exchange data between devices",
          "Increase a screen's brightness",
          "Replace all local storage",
          "Guarantee every device is safe",
        ],
        answer: 0,
        explanation:
          "A network enables devices to communicate and share resources. 通信 means communication.",
      },
      {
        id: "n2",
        prompt: "Which device forwards IP packets between networks?",
        options: ["A monitor", "A router", "A keyboard", "A passive cable"],
        answer: 1,
        explanation:
          "A router (路由器) chooses a next hop using a routing table.",
      },
      {
        id: "n3",
        prompt: "What does a transport port help identify?",
        options: [
          "A physical street",
          "A permanent person",
          "An application endpoint on a host",
          "A Wi-Fi password",
        ],
        answer: 2,
        explanation:
          "A port (端口), together with a transport protocol and IP address, identifies an endpoint.",
      },
      {
        id: "n4",
        prompt: "Which statement about Wi-Fi is correct?",
        options: [
          "It always guarantees Internet access",
          "It is a DNS record",
          "It replaces IP addresses",
          "It can connect devices locally without Internet access",
        ],
        answer: 3,
        explanation:
          "Wi-Fi connects a device to a local wireless network. Internet access also needs an upstream path.",
      },
      {
        id: "n5",
        prompt: "Which Windows command shows local IP configuration?",
        options: ["ipconfig", "nslookup example.com", "route delete", "format"],
        answer: 0,
        explanation:
          "ipconfig displays adapter addresses, masks, and gateways (默认网关).",
      },
    ],
  },
  {
    id: "dns-tcp-web",
    number: 2,
    title: "DNS, TCP, UDP and Web Communication",
    zh: "从域名到网页的旅程",
    description:
      "Trace a website request through DNS, transport protocols, and encryption.",
    minutes: 40,
    available: true,
    objectives: [
      "Trace DNS resolution and understand caching.",
      "Explain the TCP handshake and compare TCP with UDP.",
      "Describe HTTPS, TLS, and the browser request lifecycle.",
    ],
    sections: [
      {
        id: "dns-records",
        title: "DNS: names to addresses",
        text: "The Domain Name System (DNS) lets applications look up records for names such as example.com. A records contain IPv4 addresses and AAAA records contain IPv6 addresses. DNS also supports other records, including mail routing information.\n\nA domain name and a complete URL are different: a URL also includes a scheme and may include a port, path, and query. DNS does not download the web page.",
      },
      {
        id: "dns-lookup",
        title: "Follow a DNS lookup",
        text: "The browser and operating system may already have a cached answer. Otherwise, a recursive resolver checks its cache and, if needed, asks the DNS hierarchy.\n\nA root server refers it to a top-level domain (TLD) server; the TLD server refers it to an authoritative server. The authoritative server provides the relevant record, or a negative answer if it does not exist.\n\nThe resolver returns the result and caches it according to its time to live (TTL). Cached answers can skip several of these steps. This is a simplified model; aliases and delegated zones can require extra queries.",
      },
      {
        id: "tcp-reliability",
        title: "TCP: an ordered byte stream",
        text: "Transmission Control Protocol (TCP) provides a reliable, ordered byte stream between endpoints. Sequence numbers track bytes, acknowledgments indicate receipt, and lost data can be retransmitted.\n\nTCP also manages flow control and congestion. It cannot guarantee that a disconnected peer will return, and applications still need to handle errors. TCP is a transport mechanism, not encryption.",
      },
      {
        id: "tcp-handshake",
        title: "The three-way handshake",
        text: "A client starts with SYN and an initial sequence number. The server responds with SYN-ACK, acknowledging the client's sequence number and proposing its own. The client replies with ACK. In the ordinary successful case, both sides can now exchange application data.\n\nSYN means synchronize; ACK means acknowledgment. The diagram here models connection setup only, not actual packets, retransmission timers, or all TCP states.",
      },
      {
        id: "udp-transport",
        title: "UDP and transport choices",
        text: "User Datagram Protocol (UDP) sends individual datagrams without TCP's connection setup or built-in ordered retransmission. This can suit real-time media and protocols that implement their own control.\n\nUDP does not mean an application must be unreliable: QUIC implements reliability and congestion control over UDP. HTTP/1.1 and HTTP/2 generally use TCP; HTTP/3 uses QUIC over UDP. Protocol overhead alone does not determine real-world speed.",
      },
      {
        id: "https-tls",
        title: "HTTP, HTTPS, and TLS",
        text: "HTTP is an application protocol for exchanging requests and responses. HTTPS protects HTTP communication with TLS. TLS encrypts traffic, detects tampering, and normally authenticates a server using certificates and a trusted name check.\n\nIt does not guarantee that the website is honest, free of malware, or safe to give personal information to. HTTP/3 integrates TLS 1.3 with QUIC, so its setup differs from a separate TCP handshake followed by TLS.",
      },
      {
        id: "browser-request",
        title: "How a browser loads a website",
        text: "For a fresh HTTPS request over HTTP/2, the browser resolves the name, establishes TCP, negotiates TLS, sends an HTTP request, and receives a response. It parses HTML and requests resources such as CSS, JavaScript, and images, then lays out and paints the page.\n\nCaches and reused connections can skip work; HTTP/3 uses QUIC instead of TCP. A page often requires many requests to multiple origins. Developer Tools can help you observe those requests.",
      },
    ],
    vocabulary: [
      {
        word: "resolver",
        zh: "递归解析器",
        definition: "A DNS service that finds an answer on your behalf.",
      },
      {
        word: "acknowledgment",
        zh: "确认",
        definition: "A signal that information has been received.",
      },
      {
        word: "encryption",
        zh: "加密",
        definition:
          "Encoding information so only authorized parties can read it.",
      },
      {
        word: "reliability",
        zh: "可靠性",
        definition:
          "Mechanisms for detecting loss and delivering data correctly.",
      },
    ],
    labs: ["dns", "tcp"],
    commands: [
      {
        command: "nslookup example.com",
        explanation:
          "Compare the DNS server shown at the top with the A or AAAA answers. A non-authoritative answer normally comes from a recursive resolver rather than the domain's authoritative server.",
      },
      {
        command: "Test-NetConnection example.com -Port 443",
        explanation:
          "Run in PowerShell. TcpTestSucceeded reports whether a TCP connection could be established to port 443. It does not validate the site's TLS certificate or content, and it does not test QUIC.",
      },
    ],
    quiz: [
      {
        id: "w1",
        prompt: "What does a DNS A record contain?",
        options: [
          "HTML",
          "A TCP sequence number",
          "An IPv4 address",
          "A user's password",
        ],
        answer: 2,
        explanation:
          "An A record maps a name to an IPv4 address; AAAA records hold IPv6 addresses.",
      },
      {
        id: "w2",
        prompt: "What is the ordinary TCP connection setup order?",
        options: [
          "ACK, SYN, FIN",
          "SYN, SYN-ACK, ACK",
          "DNS, HTTP, TLS",
          "SYN-ACK, FIN, ACK",
        ],
        answer: 1,
        explanation:
          "The three-way handshake (三次握手) synchronizes sequence numbers in both directions.",
      },
      {
        id: "w3",
        prompt: "Which transport does HTTP/3 use?",
        options: [
          "Only plain TCP",
          "ICMP",
          "Ethernet without IP",
          "QUIC over UDP",
        ],
        answer: 3,
        explanation:
          "HTTP/3 uses QUIC over UDP. QUIC adds reliability and uses TLS 1.3.",
      },
      {
        id: "w4",
        prompt: "What does HTTPS provide?",
        options: [
          "Protection of communication in transit",
          "Proof a seller is honest",
          "A guarantee of no malware",
          "A guarantee of no tracking",
        ],
        answer: 0,
        explanation:
          "TLS protects confidentiality and integrity in transit (传输中), not the trustworthiness of the site's business.",
      },
      {
        id: "w5",
        prompt: "When can DNS hierarchy queries be skipped?",
        options: [
          "Only when using TCP",
          "Whenever a page has images",
          "When a valid cached answer is available",
          "Never",
        ],
        answer: 2,
        explanation:
          "A cache (缓存) can return a valid answer without querying root, TLD, and authoritative servers again.",
      },
    ],
  },
  {
    id: "ip-subnets-nat",
    number: 3,
    title: "IP Addresses, Subnets, Gateways and NAT",
    zh: "理解地址、子网与网络边界",
    description:
      "Calculate network boundaries and watch two devices share an IPv4 address.",
    minutes: 45,
    available: true,
    objectives: [
      "Recognize IPv4, IPv6, and RFC 1918 private ranges.",
      "Calculate subnet boundaries, including /31 and /32 exceptions.",
      "Trace routing, NAT/PAT mappings, and return traffic.",
    ],
    sections: [
      {
        id: "ipv4-ipv6",
        title: "IPv4 and IPv6",
        text: "IPv4 addresses contain 32 bits, commonly written as four decimal octets. IPv6 addresses contain 128 bits, written in hexadecimal groups separated by colons. IPv6 can compress consecutive zero groups once with ::. Both protocols route packets, but their addressing and neighbor discovery differ. IPv6 does not require IPv4 NAT. IPv6 networks still need appropriate firewall policies and secure device configuration.",
      },
      {
        id: "private-addresses",
        title: "Public and private addresses",
        text: "RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 through 172.31.255.255), and 192.168.0.0/16 for private IPv4 networks. They are not globally routed on the public Internet. Public addresses must be appropriately allocated; not every non-private address is public or globally reachable. Loopback, link-local, multicast, and other special ranges also exist. Our simulated external addresses 192.0.2.0/24, 198.51.100.0/24, and 203.0.113.0/24 are documentation-only reserved ranges, not real public destinations.",
      },
      {
        id: "subnet-cidr",
        title: "Subnet masks and CIDR",
        text: "A prefix length says how many leading address bits identify a network. /24 means 24 network bits and 8 remaining bits; its subnet mask is 255.255.255.0. A /26 mask is 255.255.255.192 and each block contains 64 addresses. To find the network, keep the prefix bits and set the remaining bits to zero. The last address sets the remaining bits to one. CIDR supports prefixes from /0 to /32 for IPv4; smaller prefix numbers describe larger blocks.",
      },
      {
        id: "host-addresses",
        title: "Network, broadcast, and usable hosts",
        text: "For 192.168.1.100/26, the block runs from 192.168.1.64 to 192.168.1.127. In a conventional subnet, .64 is the network address, .127 is the directed broadcast address, and .65 through .126 are 62 usable host addresses. Total addresses equal 2 to the power of (32 minus prefix). The usual minus-two rule has exceptions: /31 point-to-point links can use both addresses under RFC 3021; /32 describes one host route. /0 spans all IPv4 addresses, including special-use ranges, and is commonly used for a default route rather than a practical LAN.",
      },
      {
        id: "gateways-routing",
        title: "Default gateway and routing",
        text: "A device uses its routing table to choose an outgoing interface and next hop. The longest matching prefix wins. A directly connected destination can be reached locally; a remote destination may use a gateway. The default route, 0.0.0.0/0, matches when no more specific route applies. ARP finds the next-hop MAC address on an IPv4 Ethernet link. The gateway must be reachable on the local link, but it is not the final destination of the IP packet.",
      },
      {
        id: "nat-pat",
        title: "NAT, PAT, and port mapping",
        text: "Network Address Translation (NAT) rewrites IP addressing information. Port Address Translation (PAT), also called NAPT, additionally translates transport ports so multiple private clients can share one external IPv4 address. For example, 192.168.1.100:51000 and 192.168.1.101:51000 can become 203.0.113.10:40001 and :40002. A mapping table lets reply traffic be translated back to the correct client. Real allocation and filtering policies vary. Static port forwarding can map an inbound external port to an internal service; it requires deliberate configuration and security review.",
      },
      {
        id: "nat-firewall",
        title: "NAT is not a firewall",
        text: "NAT translates addressing; a firewall applies a traffic policy. A common home gateway performs both, which can make them seem identical. Missing mappings may prevent unsolicited inbound traffic in many PAT configurations, but this is not a substitute for explicit firewall rules. IPv6 can provide global addresses without IPv4 NAT while a stateful firewall still controls inbound traffic. Security depends on policy and implementation, not on address translation alone.",
      },
    ],
    vocabulary: [
      {
        word: "subnet",
        zh: "子网",
        definition: "An address block identified by a network prefix.",
      },
      {
        word: "gateway",
        zh: "网关",
        definition: "A next-hop router used to reach another network.",
      },
      {
        word: "broadcast",
        zh: "广播",
        definition: "Delivery to all hosts on a broadcast domain.",
      },
      {
        word: "translation",
        zh: "转换",
        definition: "Changing one representation into another.",
      },
    ],
    labs: ["subnet", "nat"],
    commands: [
      {
        command: "ipconfig",
        explanation:
          "Identify the active adapter's address, mask, and default gateway. Compare them with the subnet calculator; do not copy another machine's configuration.",
      },
      {
        command: "route print",
        explanation:
          "Displays Windows routing tables for IPv4 and IPv6. In IPv4, 0.0.0.0 with mask 0.0.0.0 is a default route. This command only reads routes.",
      },
      {
        command: "tracert example.com",
        explanation:
          "Shows responding hops using probes with increasing TTL. Asterisks may mean filtering or rate limiting; they do not by themselves prove an outage. Only run diagnostics on permitted destinations.",
      },
    ],
    quiz: [
      {
        id: "i1",
        prompt: "Which address belongs to an RFC 1918 private range?",
        options: ["172.32.1.1", "192.0.2.1", "172.20.1.1", "8.8.8.8"],
        answer: 2,
        explanation:
          "172.16.0.0/12 includes 172.16 through 172.31. 192.0.2.0/24 is reserved for documentation.",
      },
      {
        id: "i2",
        prompt: "What is the network address of 192.168.1.100/26?",
        options: [
          "192.168.1.0",
          "192.168.1.64",
          "192.168.1.100",
          "192.168.1.128",
        ],
        answer: 1,
        explanation:
          "/26 creates blocks of 64. Address 100 falls in the block 64–127.",
      },
      {
        id: "i3",
        prompt: "How many addresses can a /31 point-to-point link use?",
        options: ["Zero", "One", "254", "Two"],
        answer: 3,
        explanation:
          "RFC 3021 permits both addresses on a /31 point-to-point link (点对点链路).",
      },
      {
        id: "i4",
        prompt: "What allows PAT replies to reach the correct private client?",
        options: [
          "The translation mapping table",
          "The screen resolution",
          "A DNS cache alone",
          "Changing every packet to broadcast",
        ],
        answer: 0,
        explanation:
          "A mapping (映射) associates the translated port and flow with the original private endpoint.",
      },
      {
        id: "i5",
        prompt: "Which statement is correct?",
        options: [
          "NAT and a firewall are identical",
          "IPv6 must use IPv4 NAT",
          "NAT translates addresses; a firewall enforces policy",
          "Every non-private IP is globally reachable",
        ],
        answer: 2,
        explanation:
          "Address translation and traffic filtering are separate functions. IPv6 does not require IPv4 NAT.",
      },
    ],
  },
];
const previews = [
  [
    "security-fundamentals",
    "Security Fundamentals",
    "安全基础",
    "Build a foundation in threats, trust, and defense.",
  ],
  [
    "web-security",
    "Web Security Essentials",
    "Web 安全入门",
    "Understand browsers, sessions, and common web risks.",
  ],
  [
    "identity-access",
    "Identity and Access",
    "身份与访问控制",
    "Explore authentication, authorization, and least privilege.",
  ],
  [
    "defensive-tools",
    "Defensive Tools and Monitoring",
    "防御工具与监控",
    "Learn how defenders observe and investigate networks.",
  ],
  [
    "security-practice",
    "Putting It All Together",
    "综合安全实践",
    "Connect your knowledge in a guided defensive scenario.",
  ],
];
// Content revision 2 adds computing foundations after the published network
// introduction. Existing IDs, numbers and questions are untouched; previews
// keep their metadata and move behind the new available lessons.
lessons.push(...foundationsLessons);
previews.forEach(([id, title, zh, description], i) =>
  lessons.push({
    id,
    number: i + 7,
    title,
    zh,
    description,
    minutes: 35,
    available: false,
    objectives: [],
    sections: [],
    vocabulary: [],
    labs: [],
    commands: [],
    quiz: [],
  }),
);
// Upgrade the existing course; never rename its published IDs or re-use questions.
const dnsSample = lessons.find((l) => l.id === "dns-tcp-web")!;
dnsSample.sections.push(...dnsWorkshop.sections);
dnsSample.minutes = 70;
export const availableLessons = lessons.filter((l) => l.available);
export const vocabulary = availableLessons.flatMap((l) => l.vocabulary);
