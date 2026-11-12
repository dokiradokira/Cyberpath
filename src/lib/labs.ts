export const labInfo = {
  tcp: { title: "TCP 三次握手", tag: "01 / 传输层" },
  dns: { title: "DNS 解析探索", tag: "02 / 域名解析" },
  subnet: { title: "IPv4 子网计算器", tag: "03 / 地址规划" },
  nat: { title: "NAT/PAT 模拟器", tag: "04 / 地址转换" },
  cpu: { title: "CPU 指令执行模拟", tag: "05 / 处理器" },
  os: { title: "进程调度模拟器", tag: "06 / 操作系统" },
  terminal: { title: "安全 Linux 终端", tag: "07 / 命令行" },
};
export type LabId = keyof typeof labInfo;
// Keep existing LabId values and their original simulators stable.
export const dnsCacheInfo = {
  id: "dns-cache",
  title: "DNS 缓存与诊断",
  goal: "预测缓存答案，计算 TTL，并区分地址变更与 NXDOMAIN 负缓存",
  introduction:
    "改变权威记录与模拟时间，观察答案来源，用证据解释结果。与第二课共享同一实验，无真实网络请求。",
};
