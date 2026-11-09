"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  ChartNoAxesCombined,
  ShieldCheck,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { useLearning } from "../learning-provider";
const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/courses", label: "Course library", icon: BookOpen },
  { href: "/labs", label: "Interactive labs", icon: FlaskConical },
  { href: "/progress", label: "My progress", icon: ChartNoAxesCombined },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    { data, update, warning, ready } = useLearning();
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <ShieldCheck size={25} />
          </span>
          CyberPath<span className="version">V1</span>
        </Link>
        <p className="nav-label">YOUR LEARNING SPACE</p>
        <nav aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? path === href : path.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-mark">LEARN. EXPERIMENT. UNDERSTAND.</div>
          <p>
            Your first step into a<br />
            more secure digital world.
          </p>
          <Link href="/courses">
            Explore the path <ArrowUpRight size={16} />
          </Link>
          <div className="profile">
            <span>Y</span>
            <div>
              Your learning journey
              <small>Local workspace · no account needed</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">
            <span className="workspace-label">Workspace</span> <span>/</span>{" "}
            <strong>
              {path === "/"
                ? "Overview"
                : path.startsWith("/courses/")
                  ? "Learning room"
                  : links.find((l) => l.href === path)?.label}
            </strong>
          </span>
          <div className="tools">
            <span className="local-indicator">● Saved on this device</span>
            <button
              aria-label="Toggle English challenge mode"
              aria-pressed={data.mode === "challenge"}
              onClick={() =>
                update((p) => ({
                  ...p,
                  mode: p.mode === "learning" ? "challenge" : "learning",
                }))
              }
            >
              <Languages size={17} />
              <span>
                {data.mode === "learning"
                  ? "Learning mode"
                  : "English challenge"}
              </span>
            </button>
            <button
              aria-label="Toggle theme"
              onClick={() =>
                update((p) => ({
                  ...p,
                  theme: p.theme === "dark" ? "light" : "dark",
                }))
              }
            >
              {data.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {warning && (
            <p role="status" className="notice">
              {warning}
            </p>
          )}
          {ready ? (
            children
          ) : (
            <p className="muted" role="status">
              Opening your learning space…
            </p>
          )}
        </main>
        <footer>
          Built for curious minds.{" "}
          <span>CyberPath / Network security, one concept at a time.</span>
        </footer>
      </div>
    </div>
  );
}
