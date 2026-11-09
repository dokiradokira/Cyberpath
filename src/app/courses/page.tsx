import { CourseCards } from "../../components/overview";
export const metadata = { title: "课程目录" };
export default function Page() {
  return (
    <>
      <header className="page-heading">
        <h1>课程目录</h1>
        <p>3 节开放课程 · 5 节后续课程</p>
      </header>
      <div className="library-banner">
        <span className="live-dot" /> 基础学习路线{" "}
        <span>英文教材 · 中文词汇辅助 · 按自己的节奏学习</span>
      </div>
      <CourseCards />
    </>
  );
}
