import { Lab } from "../../components/labs/labs";
import { labInfo, type LabId } from "../../lib/labs";
export const metadata = { title: "Interactive labs" };
export default function Page() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">LEARN BY DOING</p>
        <h1>Your network sandbox.</h1>
        <p>
          Make the invisible visible. Four safe simulations, zero real network
          traffic.
        </p>
      </header>
      <nav className="lab-tabs" aria-label="Lab shortcuts">
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
