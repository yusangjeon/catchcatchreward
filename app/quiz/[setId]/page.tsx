import { QuizPlay } from "@/components/QuizPlay";

export default async function QuizSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  return <QuizPlay setId={setId} />;
}
