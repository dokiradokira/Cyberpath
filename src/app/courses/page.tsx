import { CourseCards } from "../../components/overview";
export const metadata = { title: "课程目录" };
export default function Page() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">从零开始，路线清晰</p>
        <h1>打好网络安全基础。</h1>
        <p>
          规划 8
          节课程，前三节完整开放。英文教材配中文词汇注释，按自己的节奏学习。
        </p>
      </header>
      <div className="library-banner">
        <span className="live-dot" /> 基础学习路线{" "}
        <span>英文教材 · 中文词汇辅助 · 按自己的节奏学习</span>
      </div>
      <CourseCards />
    </>
  );
}
