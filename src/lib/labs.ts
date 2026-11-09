export const labInfo = {
  tcp: { title: "TCP Three-Way Handshake", tag: "01 / TRANSPORT" },
  dns: { title: "DNS Resolution Explorer", tag: "02 / NAME RESOLUTION" },
  subnet: { title: "IPv4 Subnet Calculator", tag: "03 / ADDRESSING" },
  nat: { title: "NAT/PAT Simulator", tag: "04 / TRANSLATION" },
};
export type LabId = keyof typeof labInfo;
