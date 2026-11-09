import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel">
      <p className="eyebrow">NOT ON THE PATH</p>
      <h1>Lesson not available</h1>
      <p>This lesson is not part of the three open V1 lessons.</p>
      <Link className="button primary" href="/courses">
        Back to course library
      </Link>
    </section>
  );
}
