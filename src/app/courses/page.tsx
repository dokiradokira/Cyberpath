import { CourseCards } from "../../components/overview";
import { lessons } from "../../content/lessons";
export const metadata = { title: "课程目录" };
export default function Page() {
  const open = lessons.filter((l) => l.available).length;
  return (
    <>
      <header className="page-heading">
        <h1>课程目录</h1>
        <p>
          {open} 节开放课程 · {lessons.length - open} 节后续课程
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
