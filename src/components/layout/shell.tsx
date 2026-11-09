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
  LibraryBig,
} from "lucide-react";
import { useLearning } from "../learning-provider";
const links = [
  { href: "/", label: "学习首页", icon: LayoutDashboard },
  { href: "/courses", label: "课程目录", icon: BookOpen },
  { href: "/labs", label: "互动实验", icon: FlaskConical },
  { href: "/vocabulary", label: "词汇学习", icon: LibraryBig },
  { href: "/progress", label: "学习进度", icon: ChartNoAxesCombined },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    { data, update, warning, ready } = useLearning();
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
          CyberPath<span className="version">V2</span>
        </Link>
        <p className="nav-label">你的学习空间</p>
        <nav aria-label="主导航">
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
          <div className="mini-mark">学习 · 实验 · 理解</div>
          <p>
            迈出第一步，走进
            <br />
            更安全的数字世界。
          </p>
          <Link prefetch={false} href="/courses">
            探索学习路线 <ArrowUpRight size={16} />
          </Link>
          <div className="profile">
            <span>Y</span>
            <div>
              你的学习旅程
              <small>本地学习档案 · 无需账号</small>
            </div>
          </div>
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
              aria-label="切换英语挑战模式"
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
                {data.mode === "learning" ? "中文辅助模式" : "英语挑战模式"}
              </span>
            </button>
            <button
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
        <main id="main" tabIndex={-1}>
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
          为好奇心而构建。 <span>CyberPath / 一步一个概念，理解网络安全。</span>
        </footer>
      </div>
    </div>
  );
}
