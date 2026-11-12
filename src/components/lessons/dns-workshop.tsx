"use client";
import { useState } from "react";
import {
  initialDns,
  queryDns,
  advanceDns,
  changeDns,
} from "../../lib/dns-workshop";
import { dnsWorkshop } from "../../content/lessons/dns-workshop";
import { AnnotatedText } from "./annotated-text";
import { Vocabulary } from "./vocabulary";
import { wordEntries } from "../../content/vocabulary";
export function DnsGoals() {
  return (
    <div className="learning-brief">
      {[
        {
          id: "prerequisites",
          title: "Before you start",
          items: dnsWorkshop.prerequisites,
        },
        {
          id: "technical-goals",
          title: "Technical Goals",
          items: dnsWorkshop.technicalGoals,
        },
        {
          id: "english-goals",
          title: "English Goals",
          items: dnsWorkshop.englishGoals,
        },
      ].map((group) => (
        <section
          className="learning-block"
          key={group.id}
          aria-labelledby={group.id}
        >
          <h2 id={group.id} lang="en">
            {group.title}
          </h2>
          <ul>
            {group.items.map((t) => (
              <li key={t} lang="en">
                <AnnotatedText text={t} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p>
        完成标准：用时间和 TTL 解释两次地址不一致，再用英文写出一个不能从 DNS
        推断的结论。无需真实网络访问。
      </p>
      <div className="vocabulary-grid">
        {wordEntries
          .filter((w) => ["ttl", "nxdomain"].includes(w.id))
          .map((w) => (
            <Vocabulary key={w.id} item={w} />
          ))}
      </div>
    </div>
  );
}
function Exercise({ index }: { index: number }) {
  const q = dnsWorkshop.exercises[index];
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <section className="panel" aria-label={`${q.level} exercise`}>
      <h3>{q.level}</h3>
      <p lang="en">
        <AnnotatedText text={q.prompt} />
      </p>
      <div className="meaning-options">
        {q.options.map((o, i) => (
          <button
            key={o}
            aria-pressed={choice === i}
            onClick={() => setChoice(i)}
            lang="en"
          >
            {o}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p role="status" lang="en">
          {choice === q.answer ? "Correct" : "Try again"} ·{" "}
          <AnnotatedText text={q.feedback[choice]} />
        </p>
      )}
    </section>
  );
}
export function DnsCacheLab({ id = "lab-dns" }: { id?: string }) {
  const [s, setState] = useState(initialDns),
    [prediction, setPrediction] = useState(""),
    [feedback, setFeedback] = useState("");
  const alter = (
    fn:
      | typeof initialDns
      | ((v: ReturnType<typeof initialDns>) => ReturnType<typeof initialDns>),
  ) => {
    setState(fn);
    setPrediction("");
    setFeedback("");
  };
  const remaining = s.cache ? Math.max(0, s.cache.expires - s.now) : 0;
  const nodes = ["Client", "Resolver", "Root", "TLD", "Authority"];
  const positions = [
    [52, 105],
    [173, 105],
    [300, 35],
    [300, 105],
    [300, 175],
  ];
  return (
    <>
      <section
        className="panel learning-block dns-cache-lab"
        id={id}
        aria-label="DNS cache investigation"
      >
        <h2>DNS cache investigation</h2>
        <p lang="en">
          <AnnotatedText text="Predict the answer before each query. Change one variable, observe the source, then explain why the answer changed or stayed the same." />
        </p>
        <svg
          viewBox="0 0 360 210"
          style={{ width: "100%", height: "auto" }}
          role="img"
          aria-label={
            s.source === "cache"
              ? "Client to resolver cache; authority not queried"
              : "Cold lookup path: client, resolver, root referral, TLD referral, authority, answer returned"
          }
        >
          <path d="M99 105 H126" stroke="var(--primary)" fill="none" />
          <path
            d="M220 105 L253 35 M220 105 H253 M220 105 L253 175"
            stroke="var(--primary)"
            fill="none"
            opacity={s.source === "cache" ? 0.2 : 1}
          />
          {nodes.map((n, i) => (
            <g key={n} opacity={s.source === "cache" && i > 1 ? 0.3 : 1}>
              <rect
                x={positions[i][0] - 47}
                y={positions[i][1] - 22}
                width="94"
                height="45"
                rx="6"
                fill="var(--raised)"
                stroke="var(--primary)"
              />
              <text
                x={positions[i][0]}
                y={positions[i][1] + 5}
                textAnchor="middle"
                fill="var(--text)"
                fontSize="15"
              >
                {n}
              </text>
            </g>
          ))}
        </svg>
        <p lang="en">
          <AnnotatedText
            text={
              s.source === "cache"
                ? "Cache hit: the resolver answers without contacting upstream servers."
                : "Cache miss: the resolver asks Root, then TLD, then Authority. Each server replies to the resolver; Root and TLD return referrals, not the final A record."
            }
          />
        </p>
        <p className="lab-observation" aria-live="polite" aria-atomic="true">
          状态：t={s.now}s · 权威名称 {s.authority ?? "不存在"} · 递归缓存{" "}
          {s.cache ? (s.cache.answer ?? "NXDOMAIN") : "空"} · 剩余 TTL{" "}
          {remaining}s · 已查询 {s.queries} 次
        </p>
        <div className="device-buttons">
          <button onClick={() => alter((v) => changeDns(v, "192.0.2.20"))}>
            权威地址改为 .20
          </button>
          <button onClick={() => alter((v) => changeDns(v, null))}>
            删除此名称
          </button>
          <button onClick={() => alter((v) => advanceDns(v, 30))}>
            时间前进 30 秒
          </button>
          <button onClick={() => alter(initialDns)}>重置实验</button>
        </div>
        <label>
          预测下一次答案
          <select
            aria-label="预测下一次答案"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
          >
            <option value="">先作预测</option>
            <option value="192.0.2.10">192.0.2.10</option>
            <option value="192.0.2.20">192.0.2.20</option>
            <option value="NXDOMAIN">NXDOMAIN</option>
          </select>
        </label>
        <button
          className="primary"
          disabled={!prediction}
          onClick={() => {
            const next = queryDns(s);
            setState(next);
            const result = next.answer ?? "NXDOMAIN";
            setFeedback(
              `${prediction === result ? "预测正确" : "预测不符"}：${result} · ${next.source === "cache" ? "cache：未过期缓存仍有效，命中不会延长到期时间" : "authority：缓存为空或已过期，读取权威数据"} · 本次缓存到 t=${next.cache!.expires}s`,
            );
            setPrediction("");
          }}
        >
          执行 DNS 查询
        </button>
        <div className="lab-feedback" aria-live="polite">
          {feedback && <p role="status">{feedback}</p>}
        </div>
        <p className="muted" lang="en">
          <AnnotatedText text="Model limits: one recursive cache, one name and only A queries. Positive TTL is 60s; SOA-derived negative TTL is fixed at 30s. Every cache miss depicts a cold delegation path; real cached referrals may shorten it. Browser/OS caches, CNAME, DNSSEC, outages and serve-stale are not simulated. No packets leave your browser." />
        </p>
        <details>
          <summary>实验任务与证据检查</summary>
          <ol>
            <li>
              重置 → 预测 .10 并查询 → 修改权威为 .20 → 前进 30 秒 → 预测 .10
              并查询 → 再前进 30 秒 → 预测 .20 并查询。
            </li>
            <li>
              重置 → 删除名称 → 预测 NXDOMAIN 并查询 → 创建 .20 → 立即查询仍为
              NXDOMAIN → 前进 30 秒后查询为 .20。
            </li>
            <li>
              在本课笔记写 prediction / observation / TTL calculation /
              limitation。练习状态只在本页面保留；笔记和原五题测验继续按现有机制保存，不自动标记课程完成。
            </li>
          </ol>
        </details>
      </section>
    </>
  );
}

export function DnsWorkshop() {
  return (
    <>
      <p className="reading-links">
        <a href="/labs#lab-dns-cache">在互动实验中心打开此实验</a>
      </p>
      <DnsCacheLab />
      {dnsWorkshop.exercises.map((q, i) => (
        <Exercise key={q.level} index={i} />
      ))}
    </>
  );
}
