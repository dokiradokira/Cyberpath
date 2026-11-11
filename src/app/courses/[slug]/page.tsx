import { notFound } from "next/navigation";
import { availableLessons } from "../../../content/lessons";
import { LessonView } from "../../../components/lessons/lesson-view";
export function generateStaticParams() {
  return availableLessons.map((l) => ({ slug: l.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title:
      availableLessons.find((l) => l.id === slug)?.title ?? "课程 unavailable",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = availableLessons.find((l) => l.id === slug);
  if (!lesson) notFound();
  return <LessonView key={lesson.id} lesson={lesson} />;
}
