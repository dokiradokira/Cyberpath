import { Lab } from "../../components/labs/labs";
import { labInfo, dnsCacheInfo, type LabId } from "../../lib/labs";
import { DnsCacheLab } from "../../components/lessons/dns-workshop";
import Link from "next/link";
export const metadata = { title: "互动实验" };
export default function Page() {
  return (
    <>
      <header className="page-heading">
        <h1>互动实验</h1>
        <p>在浏览器内预测、操作与观察，不发送真实网络流量</p>
      </header>
      <nav className="lab-tabs" aria-label="实验快捷导航">
        <a href={`#lab-${dnsCacheInfo.id}`}>{dnsCacheInfo.title}</a>
        {Object.entries(labInfo).map(([id, info]) => (
          <a key={id} href={`#lab-${id}`}>
            {info.title}
          </a>
        ))}
      </nav>
      <section className="panel" aria-label="DNS 缓存实验入口">
        <h2>{dnsCacheInfo.title}</h2>
        <p>{dnsCacheInfo.goal}</p>
        <p className="muted">{dnsCacheInfo.introduction}</p>
        <div className="reading-links">
          <a className="button" href={`#lab-${dnsCacheInfo.id}`}>
            开始 DNS 缓存实验
          </a>
          <Link href="/courses/dns-tcp-web#dns-evidence-report">
            阅读对应课程
          </Link>
        </div>
      </section>
      <DnsCacheLab id={`lab-${dnsCacheInfo.id}`} />
      {Object.keys(labInfo).map((id) => (
        <Lab key={id} id={id as LabId} />
      ))}
    </>
  );
}
