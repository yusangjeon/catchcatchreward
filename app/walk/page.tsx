import { redirect } from "next/navigation";

/** 만보기는 웹에서 걸음 수 연동이 없어 미니게임으로 보낸다 */
export default function WalkPage() {
  redirect("/games");
}
