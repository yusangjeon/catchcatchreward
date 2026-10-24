import { QuizFlow } from "@/components/QuizFlow";

export default function QuizPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">취향 퀴즈</h1>
      <QuizFlow />
    </div>
  );
}
