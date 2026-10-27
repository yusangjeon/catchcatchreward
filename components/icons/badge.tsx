/** 취향 배지 코드/태그 → 듀오톤 아이콘·톤. 데이터의 emoji 필드는 더 이상 화면에 그리지 않는다. */
import { DuoIcon, IconTile, type DuoName, type Tone } from "@/components/icons/duo";

export const BADGE_ICON: Record<string, [DuoName, Tone]> = {
  spicy_lover: ["pepper", "orange"], spicy: ["pepper", "orange"],
  cafe_lover: ["coffee", "amber"], cafe: ["coffee", "amber"],
  night_owl: ["moon", "navy"], late_night: ["moon", "navy"],
  home_body: ["home", "teal"], home: ["home", "teal"],
  smart_shopper: ["cart", "green"], value: ["cart", "green"],
  fitness: ["dumbbell", "blue"],
  traveler: ["plane", "blue"], travel: ["plane", "blue"],
  pet_lover: ["paw", "amber"], pet: ["paw", "amber"],
  beauty: ["lipstick", "pink"],
  fashionista: ["dress", "violet"], fashion: ["dress", "violet"],
  investor: ["trend", "green"], saving: ["trend", "green"],
  foodie: ["fork", "orange"], dining_out: ["fork", "orange"],
  car_owner: ["car", "navy"], car: ["car", "navy"],
  wellness: ["leaf", "green"], health: ["leaf", "green"],
  music: ["megaphone", "violet"], game: ["gamepad", "violet"], outdoor: ["pin", "teal"], tech: ["bolt", "blue"], rest: ["moon", "navy"], challenge: ["flame", "orange"],
};

export function badgeIcon(key: string): [DuoName, Tone] { return BADGE_ICON[key] ?? ["badge", "gray"]; }

export function BadgeIcon({ code, size = 18, className }: { code: string; size?: number; className?: string }) {
  const [name] = badgeIcon(code);
  return <DuoIcon name={name} size={size} className={className} />;
}

export function BadgeTile({ code, size = 44, round = true, muted = false, className }: { code: string; size?: number; round?: boolean; muted?: boolean; className?: string }) {
  const [name, tone] = badgeIcon(code);
  return <IconTile name={name} tone={muted ? "gray" : tone} size={size} round={round} className={className} />;
}
