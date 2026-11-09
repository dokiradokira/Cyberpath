"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Laptop,
  Server,
  Router,
  Globe,
  Check,
} from "lucide-react";
import { calculateSubnet } from "../../lib/subnet";
import { labInfo, type LabId } from "../../lib/labs";
export type { LabId } from "../../lib/labs";
const tcpSteps = [
  "准备连接，尚未建立连接。",
  "SYN：客户端发送初始序列号，请求同步（synchronize）。",
  "SYN-ACK：服务端确认客户端序列号，并发送自己的初始序列号。ACK 表示确认（acknowledgment）。",
  "ACK：客户端确认服务端序列号，简化模型中的 TCP 连接已建立。",
];
const dnsSteps = [
  "浏览器 / 操作系统缓存：先检查是否有未过期的记录。cache 表示缓存。",
  "递归解析器（recursive resolver）：代客户端查找答案。",
  "根域服务器（root）：返回 .com 顶级域服务器的指引。",
  "顶级域服务器（TLD）：返回 example.com 权威服务器的指引。",
  "权威服务器（authoritative）：提供请求的 A 记录。",
  "地址响应：将 IP 返回给客户端，并按 TTL（生存时间）缓存。",
];
function Stepper({
  step,
  max,
  setStep,
}: {
  step: number;
  max: number;
  setStep: (n: number) => void;
}) {
  return (
    <div className="step-controls">
      <button
        aria-label="上一步"
        disabled={step === 0}
        onClick={() => setStep(step - 1)}
      >
        <ArrowLeft size={16} /> 上一步
      </button>
      <span>
        {step + 1} / {max + 1}
      </span>
      <button
        aria-label="下一步"
        disabled={step === max}
        onClick={() => setStep(step + 1)}
      >
        下一步 <ArrowRight size={16} />
      </button>
      <button
        aria-label="重置模拟"
        disabled={step === 0}
        onClick={() => setStep(0)}
      >
        <RotateCcw size={16} /> 重置
      </button>
    </div>
  );
}
export function TcpLab() {
  const [step, setStep] = useState(0);
  return (
    <div>
      <div className="network-diagram">
        <div className="endpoint">
          <Laptop />
          <strong>客户端 Client</strong>
          <small>CLOSED → ESTABLISHED</small>
        </div>
        <div className="packet-lanes">
          {["SYN →", "← SYN-ACK", "ACK →"].map((s, i) => (
            <div key={s} className={step > i ? "packet active" : "packet"}>
              {s}
              <span>{step > i ? <Check size={14} /> : "···"}</span>
            </div>
          ))}
        </div>
        <div className="endpoint">
          <Server />
          <strong>服务端 Server</strong>
          <small>LISTEN → ESTABLISHED</small>
        </div>
      </div>
      <p className="step-description" aria-live="polite">
        {tcpSteps[step]}
      </p>
      <Stepper step={step} max={3} setStep={setStep} />
      <p className="caption">这是简化的 TCP 建连演示，不发送真实数据包。</p>
    </div>
  );
}
export function DnsLab() {
  const [step, setStep] = useState(0),
    [cached, setCached] = useState(false);
  return (
    <div>
      <label className="check-label">
        <input
          type="checkbox"
          checked={cached}
          onChange={(e) => {
            setCached(e.target.checked);
            setStep(0);
          }}
        />{" "}
        浏览器 / 操作系统缓存命中
      </label>
      <div className="dns-path">
        {["缓存", "解析器", "根域", "顶级域", "权威", "响应"].map((s, i) => (
          <div
            key={s}
            className={
              (cached ? (step === 1 ? i === 5 : i === 0) : step === i)
                ? "dns-node active"
                : "dns-node"
            }
          >
            <Globe size={17} />
            <span>{s}</span>
          </div>
        ))}
      </div>
      <p className="step-description" aria-live="polite">
        {cached
          ? step === 0
            ? "缓存中已有有效记录，无需再向解析器或 DNS 层级发起查询。"
            : "缓存的 IP 地址返回给应用，后续查询被跳过。"
          : dnsSteps[step]}
      </p>
      <Stepper step={step} max={cached ? 1 : 5} setStep={setStep} />
      <p className="caption">
        这是 example.com 的简化解析过程，不发送真实 DNS 请求。
      </p>
    </div>
  );
}
export function SubnetLab() {
  const [feedback, setFeedback] = useState("");
  const [ip, setIp] = useState("192.168.1.100"),
    [prefix, setPrefix] = useState("24"),
    [result, setResult] = useState(() => calculateSubnet("192.168.1.100", 24)),
    [error, setError] = useState("");
  function run(address = ip, bits = prefix) {
    try {
      setResult(calculateSubnet(address, bits));
      setError("");
      setFeedback(`已计算 ${address}/${bits}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div>
      <form
        className="calculator-form"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label>
          IPv4 地址
          <input
            aria-label="IPv4 地址"
            inputMode="decimal"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
        </label>
        <label>
          CIDR 前缀
          <input
            aria-label="CIDR 前缀"
            inputMode="numeric"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </label>
        <button className="primary" type="submit">
          计算 <ArrowRight size={16} />
        </button>
      </form>
      <div className="presets">
        试试预设：
        {["192.168.1.100/24", "192.168.1.100/26", "10.0.0.5/30"].map((p) => (
          <button
            key={p}
            onClick={() => {
              const [a, b] = p.split("/");
              setIp(a);
              setPrefix(b);
              run(a, b);
            }}
          >
            {p}
          </button>
        ))}
      </div>
      {feedback && !error && (
        <div role="log" className="action-feedback" aria-live="polite">
          {feedback}
        </div>
      )}
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : (
        <>
          <dl className="result-grid">
            {Object.entries({
              子网掩码: result.mask,
              网络地址: result.network,
              广播地址: result.broadcast,
              地址总数: result.total.toLocaleString("en-US"),
              常规可用主机范围: result.range,
              可用主机数: result.usable.toLocaleString("en-US"),
              二进制地址: result.binary,
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="caption">{result.note}</p>
        </>
      )}
    </div>
  );
}
export function NatLab() {
  const [device, setDevice] = useState(0),
    [returned, setReturned] = useState<number | null>(null);
  return (
    <div>
      <div className="device-buttons">
        {[0, 1].map((d) => (
          <button
            key={d}
            aria-pressed={device === d}
            className={device === d ? "selected" : ""}
            onClick={() => {
              setDevice(d);
              setReturned(null);
            }}
          >
            <Laptop size={17} /> 设备 {d + 1}
          </button>
        ))}
      </div>
      <div className="nat-flow">
        <div>
          <Laptop />
          <strong>192.168.1.{100 + device}</strong>
          <small>源端口 51000</small>
        </div>
        <ArrowRight />
        <div>
          <Router />
          <strong>203.0.113.10</strong>
          <small>转换后端口 {40001 + device}</small>
        </div>
        <ArrowRight />
        <div>
          <Server />
          <strong>198.51.100.20</strong>
          <small>目的地址 port 443 / TCP</small>
        </div>
      </div>
      <h4>NAT 映射表</h4>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>内网源地址</th>
              <th>路由器外部源地址</th>
              <th>目的地址</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1].map((d) => (
              <tr key={d} className={device === d ? "highlight" : ""}>
                <td>192.168.1.{100 + d}:51000</td>
                <td>203.0.113.10:{40001 + d}</td>
                <td>198.51.100.20:443 / TCP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setReturned(device)}>
        模拟返回流量 <ArrowLeft size={16} />
      </button>
      {returned !== null && (
        <p role="status" className="notice">
          响应到达 203.0.113.10:{40001 + returned} → 192.168.1.{100 + returned}
          :51000. 映射找到 设备 {returned + 1}.
        </p>
      )}
      <p className="caption">
        这是简化的 IPv4 PAT
        模拟，真实端口分配和过滤策略可能不同。外部示例地址是文档保留地址。NAT
        转换地址，防火墙执行流量策略。
      </p>
    </div>
  );
}
export function Lab({ id }: { id: LabId }) {
  return (
    <section className="panel lab-panel" id={`lab-${id}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{labInfo[id].tag}</p>
          <h3>{labInfo[id].title}</h3>
        </div>
        <span className="badge">可交互</span>
      </div>
      {id === "tcp" ? (
        <TcpLab />
      ) : id === "dns" ? (
        <DnsLab />
      ) : id === "subnet" ? (
        <SubnetLab />
      ) : (
        <NatLab />
      )}
    </section>
  );
}
