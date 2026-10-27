import { randomInt } from "node:crypto";

/** 혼동 문자(0/O/1/I) 제외 8자 초대코드. 마이비 invitationCode(ME953234KO) 처럼 사람이 읽어 입력하는 용도 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newInviteCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[randomInt(0, ALPHABET.length)];
  return out;
}

export function normalizeInviteCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}
