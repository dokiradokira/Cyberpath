import { Lab } from "../../components/labs/labs";
import { labInfo, type LabId } from "../../lib/labs";
export const metadata = { title: "互动实验" };
export default function Page() {
  return (
    <>
      <header className="page-heading">
        <h1>互动实验</h1>
        <p>四个本地模拟，不发送真实网络流量</p>
      </header>
      <nav className="lab-tabs" aria-label="实验快捷导航">
        {Object.entries(labInfo).map(([id, info]) => (
          <a key={id} href={`#lab-${id}`}>
            {info.title}
          </a>
        ))}
      </nav>
      {Object.keys(labInfo).map((id) => (
        <Lab key={id} id={id as LabId} />
      ))}
    </>
  );
}
