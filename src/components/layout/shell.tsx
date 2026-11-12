"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  ChartNoAxesCombined,
  ShieldCheck,
  Sun,
  Moon,
  Languages,
  LibraryBig,
} from "lucide-react";
import { useLearning } from "../learning-provider";
import { reveal, cancelMotion } from "../../lib/motion";
import { APP_VERSION } from "../../lib/version";
const links = [
  { href: "/", label: "学习首页", icon: LayoutDashboard },
  { href: "/courses", label: "课程目录", icon: BookOpen },
  { href: "/labs", label: "互动实验", icon: FlaskConical },
  { href: "/vocabulary", label: "词汇学习", icon: LibraryBig },
  { href: "/progress", label: "学习进度", icon: ChartNoAxesCombined },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState("");
  const path = usePathname(),
    { data, update, warning, ready } = useLearning();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(path);
  const activeNav = links.findIndex((l) =>
    l.href === "/" ? path === "/" : path.startsWith(l.href),
  );
  useLayoutEffect(() => {
    // SSR content is already visible: animate client route changes, never fade it out on hydration.
    if (previousPath.current === path) return;
    previousPath.current = path;
    const heading = main.current?.querySelector(".page-heading") ?? null;
    reveal(heading);
    return () => cancelMotion(heading);
  }, [path]);
  return (
    <div className="app-shell" data-theme={data.theme}>
      <a className="skip" href="#main">
        跳到正文
      </a>
      <aside className="sidebar">
        <Link prefetch={false} className="brand" href="/">
          <span className="brand-icon">
            <ShieldCheck size={25} />
          </span>
          CyberPath<span className="version">V{APP_VERSION}</span>
        </Link>
        <p className="nav-label">你的学习空间</p>
        <nav
          className="primary-nav"
          aria-label="主导航"
          style={
            {
              "--nav-index": Math.max(0, activeNav),
              "--nav-visible": activeNav >= 0 ? 1 : 0,
            } as CSSProperties
          }
        >
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              prefetch={false}
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
          <p>Local workspace</p>
          <small>学习记录保存在当前浏览器</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">
            <span className="workspace-label">学习空间</span> <span>/</span>{" "}
            <strong>
              {path === "/"
                ? "学习首页"
                : path.startsWith("/courses/")
                  ? "课程学习"
                  : links.find((l) => l.href === path)?.label}
            </strong>
          </span>
          <div className="tools">
            <span className="local-indicator">● 保存在当前设备</span>
            <button
              title="切换中文辅助 / 英语挑战模式"
              aria-label="切换英语挑战模式"
              disabled={!ready}
              aria-pressed={data.mode === "challenge"}
              onClick={() => {
                setFeedback(
                  data.mode === "learning"
                    ? "英语挑战模式：课程中文注释默认隐藏，点击术语可查看"
                    : "中文辅助模式：课程默认显示中文词汇注释",
                );
                update((p) => ({
                  ...p,
                  mode: p.mode === "learning" ? "challenge" : "learning",
                }));
              }}
            >
              <Languages size={17} />
              <span>
                {data.mode === "learning" ? "中文辅助模式" : "英语挑战模式"}
              </span>
            </button>
            <button
              title="切换深浅主题"
              aria-label="切换深浅主题"
              aria-pressed={data.theme === "light"}
              disabled={!ready}
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
        <main ref={main} id="main" tabIndex={-1}>
          {feedback && (
            <div className="action-feedback" role="log" aria-live="polite">
              {feedback}
            </div>
          )}
          {warning && (
            <p role="status" className="notice">
              {warning}
            </p>
          )}
          {!ready && (
            <p className="storage-status" role="status">
              正在恢复本机记录，课程内容可直接阅读。
            </p>
          )}
          {children}
          <noscript>
            <p className="notice">
              JavaScript
              未启用，当前仅支持阅读。请启用后刷新以使用实验、测验和进度保存。
            </p>
          </noscript>
        </main>
        <footer>
          CyberPath <span>Network security · English learning</span>
        </footer>
      </div>
    </div>
  );
}
