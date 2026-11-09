import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel">
      <p className="eyebrow">尚未开放</p>
      <h1>课程尚未开放</h1>
      <p>当前开放前三课，其他课程将陆续推出。</p>
      <Link prefetch={false} className="button primary" href="/courses">
        返回课程目录
      </Link>
    </section>
  );
}
