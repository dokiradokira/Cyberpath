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
  "Ready to connect. No connection has been established.",
  "SYN: the client proposes its initial sequence number. 同步 — synchronize.",
  "SYN-ACK: the server acknowledges the client and proposes its own sequence number. 确认 — acknowledgment.",
  "ACK: the client acknowledges the server. The simplified connection is now established. 连接已建立.",
];
const dnsSteps = [
  "Browser / OS cache: check for a valid cached answer. 缓存",
  "Recursive resolver: find the answer on the client's behalf. 递归解析器",
  "Root DNS: refer the resolver to the .com TLD servers. 根域",
  "TLD DNS: refer the resolver to example.com's authoritative servers. 顶级域",
  "Authoritative DNS: provide the requested A record. 权威域",
  "IP address response: return and cache the answer according to TTL. 地址响应",
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
        aria-label="Previous Step"
        disabled={step === 0}
        onClick={() => setStep(step - 1)}
      >
        <ArrowLeft size={16} /> Previous Step
      </button>
      <span>
        {step + 1} / {max + 1}
      </span>
      <button
        aria-label="Next Step"
        disabled={step === max}
        onClick={() => setStep(step + 1)}
      >
        Next Step <ArrowRight size={16} />
      </button>
      <button aria-label="Reset simulation" onClick={() => setStep(0)}>
        <RotateCcw size={16} /> Reset
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
          <strong>Client</strong>
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
          <strong>Server</strong>
          <small>LISTEN → ESTABLISHED</small>
        </div>
      </div>
      <p className="step-description" aria-live="polite">
        {tcpSteps[step]}
      </p>
      <Stepper step={step} max={3} setStep={setStep} />
      <p className="caption">
        Simplified TCP connection setup. No real network packets are sent.
      </p>
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
        Valid browser / OS cache hit
      </label>
      <div className="dns-path">
        {["Cache", "Resolver", "Root", "TLD", "Authority", "Answer"].map(
          (s, i) => (
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
          ),
        )}
      </div>
      <p className="step-description" aria-live="polite">
        {cached
          ? step === 0
            ? "A valid cached record exists; no resolver or hierarchy queries are needed."
            : "The cached IP address is returned to the application. 后续查询被跳过."
          : dnsSteps[step]}
      </p>
      <Stepper step={step} max={cached ? 1 : 5} setStep={setStep} />
      <p className="caption">
        A simplified lookup for example.com. This explorer does not send DNS
        requests.
      </p>
    </div>
  );
}
export function SubnetLab() {
  const [ip, setIp] = useState("192.168.1.100"),
    [prefix, setPrefix] = useState("24"),
    [result, setResult] = useState(() => calculateSubnet("192.168.1.100", 24)),
    [error, setError] = useState("");
  function run(address = ip, bits = prefix) {
    try {
      setResult(calculateSubnet(address, bits));
      setError("");
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
          IPv4 address
          <input
            aria-label="IPv4 address"
            inputMode="decimal"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
        </label>
        <label>
          CIDR prefix
          <input
            aria-label="CIDR prefix"
            inputMode="numeric"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </label>
        <button className="primary" type="submit">
          Calculate <ArrowRight size={16} />
        </button>
      </form>
      <div className="presets">
        Try a preset:
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
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : (
        <>
          <dl className="result-grid">
            {Object.entries({
              "Subnet mask": result.mask,
              "Network address": result.network,
              "Broadcast address": result.broadcast,
              "Total addresses": result.total.toLocaleString("en-US"),
              "Conventional usable host range": result.range,
              "Usable host count": result.usable.toLocaleString("en-US"),
              "Binary address": result.binary,
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
            <Laptop size={17} /> Device {d + 1}
          </button>
        ))}
      </div>
      <div className="nat-flow">
        <div>
          <Laptop />
          <strong>192.168.1.{100 + device}</strong>
          <small>Source port 51000</small>
        </div>
        <ArrowRight />
        <div>
          <Router />
          <strong>203.0.113.10</strong>
          <small>Translated port {40001 + device}</small>
        </div>
        <ArrowRight />
        <div>
          <Server />
          <strong>198.51.100.20</strong>
          <small>Destination port 443 / TCP</small>
        </div>
      </div>
      <h4>NAT mapping table</h4>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Private source</th>
              <th>Router external source</th>
              <th>Destination</th>
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
        Simulate return traffic <ArrowLeft size={16} />
      </button>
      {returned !== null && (
        <p role="status" className="notice">
          Reply to 203.0.113.10:{40001 + returned} → 192.168.1.{100 + returned}
          :51000. The mapping identifies Device {returned + 1}.
        </p>
      )}
      <p className="caption">
        Simplified IPv4 PAT; actual port allocation and filtering vary. External
        addresses are documentation-only reserved ranges. NAT translates
        addresses; a firewall enforces traffic policy.
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
        <span className="badge">Interactive</span>
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
