import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { LearningProvider } from "../components/learning-provider";
import { Shell } from "../components/layout/shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "CyberPath — Network Security Learning",
    template: "%s | CyberPath",
  },
  description:
    "中文界面、英文教材、中文词汇注释与互动实验，边学网络安全边积累英语。",
  appleWebApp: { capable: true, title: "CyberPath", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="dark">
      <body>
        <script src="/startup.js" async />
        <div id="startup-recovery" className="notice" hidden role="alert">
          交互脚本未能启动。请刷新页面；电脑端请停止旧服务后运行 npm run
          serve，再从手机打开电脑 IP:3000。
          <Link prefetch={false} href="/">
            重新打开首页
          </Link>
        </div>
        <LearningProvider>
          <Shell>{children}</Shell>
        </LearningProvider>
      </body>
    </html>
  );
}
