export const labInfo = {
  tcp: { title: "TCP 三次握手", tag: "01 / 传输层" },
  dns: { title: "DNS 解析探索", tag: "02 / 域名解析" },
  subnet: { title: "IPv4 子网计算器", tag: "03 / 地址规划" },
  nat: { title: "NAT/PAT 模拟器", tag: "04 / 地址转换" },
};
export type LabId = keyof typeof labInfo;
