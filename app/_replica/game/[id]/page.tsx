import { GameDetailView } from "./GameDetailView";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GameDetailView id={id} />;
}
