import { CourseCards } from "../../components/overview";
export const metadata = { title: "Course library" };
export default function Page() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">A CLEAR PATH FROM ZERO</p>
        <h1>Build your foundations.</h1>
        <p>
          Eight chapters on the roadmap. Three complete lessons ready to
          explore.
        </p>
      </header>
      <div className="library-banner">
        <span className="live-dot" /> FOUNDATION TRACK{" "}
        <span>English lessons · 中文词汇辅助 · Learn at your own pace</span>
      </div>
      <CourseCards />
    </>
  );
}
