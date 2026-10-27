/**
 * 틀린그림 찾기 장면(벡터). 서버(퍼즐 생성·채점)와 클라이언트(렌더) 공용 — server-only 금지.
 * 장면 = 객체 목록(SVG 프리미티브) + 후보 차이(객체 속성 덮어쓰기). 날짜 시드로 장면 1개 + 차이 5개를 뽑는다.
 * viewBox 360×240. 탭 판정은 차이의 center 로부터 반경 HIT_R.
 */
export const VIEW_W = 360;
export const VIEW_H = 240;
export const HIT_R = 30;

export type Shape =
  | { id: string; t: "rect"; x: number; y: number; w: number; h: number; fill: string; rx?: number; stroke?: string; sw?: number; op?: number }
  | { id: string; t: "circle"; cx: number; cy: number; r: number; fill: string; stroke?: string; sw?: number; op?: number }
  | { id: string; t: "ellipse"; cx: number; cy: number; rx: number; ry: number; fill: string; stroke?: string; sw?: number; op?: number }
  | { id: string; t: "poly"; pts: string; fill: string; stroke?: string; sw?: number; op?: number }
  | { id: string; t: "path"; d: string; fill: string; stroke?: string; sw?: number; op?: number }
  | { id: string; t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; sw: number; op?: number };

export interface Diff {
  id: string;
  target: string; // 객체 id
  patch: Partial<Record<string, string | number | boolean>> & { hidden?: boolean };
  cx: number;
  cy: number;
  label: string;
}

export interface Scene {
  id: string;
  name: string;
  bg: [string, string]; // 하늘 그라디언트
  objects: Shape[];
  diffs: Diff[];
}

const park: Scene = {
  id: "park",
  name: "공원의 오후",
  bg: ["#bfe3ff", "#eaf6ff"],
  objects: [
    { id: "sun", t: "circle", cx: 310, cy: 44, r: 20, fill: "#ffd54a" },
    { id: "cloud1", t: "ellipse", cx: 70, cy: 46, rx: 34, ry: 14, fill: "#ffffff" },
    { id: "cloud1b", t: "ellipse", cx: 90, cy: 38, rx: 20, ry: 13, fill: "#ffffff" },
    { id: "cloud2", t: "ellipse", cx: 210, cy: 36, rx: 28, ry: 11, fill: "#ffffff" },
    { id: "bird1", t: "path", d: "M150 60 q6 -6 12 0 q6 -6 12 0", fill: "none", stroke: "#4a5568", sw: 2 },
    { id: "bird2", t: "path", d: "M175 48 q5 -5 10 0 q5 -5 10 0", fill: "none", stroke: "#4a5568", sw: 2 },
    { id: "hill1", t: "ellipse", cx: 80, cy: 190, rx: 160, ry: 60, fill: "#8fd37a" },
    { id: "hill2", t: "ellipse", cx: 300, cy: 200, rx: 150, ry: 55, fill: "#7cc96a" },
    { id: "ground", t: "rect", x: 0, y: 196, w: 360, h: 44, fill: "#6fbf5b" },
    { id: "path", t: "path", d: "M0 225 q120 -30 360 0 L360 240 L0 240Z", fill: "#e9d8a6" },
    { id: "house", t: "rect", x: 40, y: 120, w: 70, h: 56, fill: "#ffb86b", stroke: "#d98c3a", sw: 2 },
    { id: "roof", t: "poly", pts: "32,122 75,88 118,122", fill: "#e05a47" },
    { id: "door", t: "rect", x: 66, y: 146, w: 18, h: 30, fill: "#8b5a2b", rx: 3 },
    { id: "win1", t: "rect", x: 46, y: 130, w: 14, h: 12, fill: "#9fd8ff", stroke: "#fff", sw: 2 },
    { id: "win2", t: "rect", x: 90, y: 130, w: 14, h: 12, fill: "#9fd8ff", stroke: "#fff", sw: 2 },
    { id: "chimney", t: "rect", x: 96, y: 96, w: 10, h: 18, fill: "#9c6b4a" },
    { id: "smoke", t: "circle", cx: 103, cy: 86, r: 6, fill: "#e5e7eb", op: 0.9 },
    { id: "trunk1", t: "rect", x: 150, y: 150, w: 10, h: 40, fill: "#8b5a2b" },
    { id: "tree1", t: "circle", cx: 155, cy: 138, r: 26, fill: "#3fa34d" },
    { id: "apple", t: "circle", cx: 165, cy: 128, r: 4, fill: "#e53e3e" },
    { id: "trunk2", t: "rect", x: 300, y: 140, w: 12, h: 52, fill: "#8b5a2b" },
    { id: "tree2", t: "circle", cx: 306, cy: 126, r: 32, fill: "#2f9e44" },
    { id: "bench", t: "rect", x: 200, y: 172, w: 56, h: 8, fill: "#a0522d", rx: 2 },
    { id: "benchleg1", t: "rect", x: 206, y: 180, w: 5, h: 12, fill: "#7a3f1d" },
    { id: "benchleg2", t: "rect", x: 245, y: 180, w: 5, h: 12, fill: "#7a3f1d" },
    { id: "dogbody", t: "ellipse", cx: 130, cy: 206, rx: 16, ry: 9, fill: "#c98a4b" },
    { id: "doghead", t: "circle", cx: 148, cy: 200, r: 8, fill: "#c98a4b" },
    { id: "dogtail", t: "line", x1: 114, y1: 204, x2: 104, y2: 194, stroke: "#c98a4b", sw: 4 },
    { id: "kite", t: "poly", pts: "250,80 266,100 250,120 234,100", fill: "#ff6b9d" },
    { id: "kitestr", t: "line", x1: 250, y1: 120, x2: 230, y2: 170, stroke: "#6b7280", sw: 1.5 },
    { id: "fl1", t: "circle", cx: 30, cy: 205, r: 5, fill: "#ff5c8a" },
    { id: "fl2", t: "circle", cx: 44, cy: 212, r: 5, fill: "#ffd93d" },
    { id: "fl3", t: "circle", cx: 58, cy: 206, r: 5, fill: "#ff5c8a" },
    { id: "balloon", t: "circle", cx: 330, cy: 100, r: 12, fill: "#5b8def" },
    { id: "balloonstr", t: "line", x1: 330, y1: 112, x2: 326, y2: 150, stroke: "#6b7280", sw: 1.5 },
    { id: "sign", t: "rect", x: 180, y: 140, w: 30, h: 16, fill: "#fff", stroke: "#8b5a2b", sw: 2, rx: 2 },
    { id: "signpost", t: "rect", x: 193, y: 156, w: 4, h: 20, fill: "#8b5a2b" },
  ],
  diffs: [
    { id: "d1", target: "sun", patch: { fill: "#ff8a3d" }, cx: 310, cy: 44, label: "해 색" },
    { id: "d2", target: "cloud2", patch: { hidden: true }, cx: 210, cy: 36, label: "구름" },
    { id: "d3", target: "bird2", patch: { hidden: true }, cx: 185, cy: 48, label: "새" },
    { id: "d4", target: "win2", patch: { hidden: true }, cx: 97, cy: 136, label: "창문" },
    { id: "d5", target: "roof", patch: { fill: "#3b82f6" }, cx: 75, cy: 105, label: "지붕 색" },
    { id: "d6", target: "apple", patch: { hidden: true }, cx: 165, cy: 128, label: "사과" },
    { id: "d7", target: "tree1", patch: { fill: "#e0a63a" }, cx: 155, cy: 138, label: "나무 색" },
    { id: "d8", target: "kite", patch: { fill: "#34d399" }, cx: 250, cy: 100, label: "연 색" },
    { id: "d9", target: "dogtail", patch: { x2: 104, y2: 214 }, cx: 108, cy: 204, label: "강아지 꼬리" },
    { id: "d10", target: "fl2", patch: { hidden: true }, cx: 44, cy: 212, label: "꽃" },
    { id: "d11", target: "balloon", patch: { fill: "#ef4444" }, cx: 330, cy: 100, label: "풍선 색" },
    { id: "d12", target: "smoke", patch: { hidden: true }, cx: 103, cy: 86, label: "연기" },
    { id: "d13", target: "benchleg2", patch: { hidden: true }, cx: 247, cy: 186, label: "벤치 다리" },
  ],
};

const beach: Scene = {
  id: "beach",
  name: "여름 바닷가",
  bg: ["#9ad8ff", "#e3f4ff"],
  objects: [
    { id: "sun", t: "circle", cx: 60, cy: 42, r: 22, fill: "#ffd54a" },
    { id: "cloud", t: "ellipse", cx: 250, cy: 40, rx: 30, ry: 12, fill: "#fff" },
    { id: "gull1", t: "path", d: "M180 50 q6 -6 12 0 q6 -6 12 0", fill: "none", stroke: "#4a5568", sw: 2 },
    { id: "gull2", t: "path", d: "M300 62 q6 -6 12 0 q6 -6 12 0", fill: "none", stroke: "#4a5568", sw: 2 },
    { id: "sea", t: "rect", x: 0, y: 110, w: 360, h: 70, fill: "#3aa0e8" },
    { id: "wave1", t: "path", d: "M0 130 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0", fill: "none", stroke: "#8fd0ff", sw: 3 },
    { id: "wave2", t: "path", d: "M0 160 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0", fill: "none", stroke: "#8fd0ff", sw: 3 },
    { id: "sand", t: "path", d: "M0 176 q180 -14 360 0 L360 240 L0 240Z", fill: "#f6e3a8" },
    { id: "boat", t: "poly", pts: "250,118 300,118 290,130 260,130", fill: "#8b5a2b" },
    { id: "mast", t: "rect", x: 273, y: 84, w: 3, h: 34, fill: "#4b5563" },
    { id: "sail", t: "poly", pts: "276,86 276,116 300,116", fill: "#ff6b6b" },
    { id: "pole", t: "rect", x: 98, y: 150, w: 4, h: 60, fill: "#4b5563" },
    { id: "umb", t: "path", d: "M60 156 A40 40 0 0 1 140 156 Z", fill: "#ff6b9d" },
    { id: "umbstripe", t: "path", d: "M90 156 A40 40 0 0 1 110 156 Z", fill: "#fff" },
    { id: "towel", t: "rect", x: 150, y: 196, w: 60, h: 22, fill: "#5b8def", rx: 3 },
    { id: "towelstripe", t: "rect", x: 150, y: 204, w: 60, h: 6, fill: "#fff" },
    { id: "ball", t: "circle", cx: 236, cy: 206, r: 12, fill: "#ff5c5c" },
    { id: "ballstripe", t: "path", d: "M224 206 A12 12 0 0 0 248 206 Z", fill: "#ffd93d" },
    { id: "crab", t: "ellipse", cx: 300, cy: 214, rx: 11, ry: 7, fill: "#ef4444" },
    { id: "crabeye", t: "circle", cx: 296, cy: 208, r: 2, fill: "#111" },
    { id: "star", t: "poly", pts: "40,216 44,206 48,216 58,217 50,223 53,233 44,227 35,233 38,223 30,217", fill: "#ffb347" },
    { id: "palmtrunk", t: "path", d: "M330 200 q-4 -40 10 -70", fill: "none", stroke: "#8b5a2b", sw: 6 },
    { id: "palm1", t: "ellipse", cx: 325, cy: 128, rx: 22, ry: 8, fill: "#2f9e44" },
    { id: "palm2", t: "ellipse", cx: 352, cy: 134, rx: 20, ry: 8, fill: "#3fa34d" },
    { id: "coco1", t: "circle", cx: 338, cy: 136, r: 4, fill: "#6b4423" },
    { id: "coco2", t: "circle", cx: 346, cy: 140, r: 4, fill: "#6b4423" },
    { id: "bucket", t: "rect", x: 118, y: 200, w: 18, h: 18, fill: "#34d399", rx: 2 },
    { id: "shell", t: "ellipse", cx: 190, cy: 230, rx: 7, ry: 5, fill: "#ffd6e0" },
    { id: "fish", t: "ellipse", cx: 40, cy: 150, rx: 9, ry: 5, fill: "#ffa94d" },
  ],
  diffs: [
    { id: "d1", target: "sail", patch: { fill: "#5b8def" }, cx: 288, cy: 104, label: "돛 색" },
    { id: "d2", target: "gull2", patch: { hidden: true }, cx: 310, cy: 62, label: "갈매기" },
    { id: "d3", target: "umb", patch: { fill: "#5b8def" }, cx: 100, cy: 140, label: "파라솔 색" },
    { id: "d4", target: "ballstripe", patch: { fill: "#34d399" }, cx: 236, cy: 210, label: "공 무늬" },
    { id: "d5", target: "crab", patch: { hidden: true }, cx: 300, cy: 214, label: "게" },
    { id: "d6", target: "coco2", patch: { hidden: true }, cx: 346, cy: 140, label: "코코넛" },
    { id: "d7", target: "bucket", patch: { fill: "#ff5c8a" }, cx: 127, cy: 209, label: "양동이 색" },
    { id: "d8", target: "star", patch: { fill: "#c084fc" }, cx: 44, cy: 220, label: "불가사리 색" },
    { id: "d9", target: "towelstripe", patch: { hidden: true }, cx: 180, cy: 207, label: "타월 줄무늬" },
    { id: "d10", target: "fish", patch: { hidden: true }, cx: 40, cy: 150, label: "물고기" },
    { id: "d11", target: "cloud", patch: { cx: 300 }, cx: 275, cy: 40, label: "구름 위치" },
    { id: "d12", target: "shell", patch: { hidden: true }, cx: 190, cy: 230, label: "조개" },
  ],
};

const space: Scene = {
  id: "space",
  name: "우주 탐험",
  bg: ["#0b1026", "#1b2250"],
  objects: [
    ...Array.from({ length: 18 }, (_, i) => ({ id: `s${i}`, t: "circle" as const, cx: (i * 53) % 350 + 5, cy: (i * 37) % 110 + 8, r: i % 3 === 0 ? 2 : 1.2, fill: "#fff" })),
    { id: "planet", t: "circle", cx: 290, cy: 70, r: 30, fill: "#f6a23b" },
    { id: "ring", t: "ellipse", cx: 290, cy: 72, rx: 48, ry: 10, fill: "none", stroke: "#ffe08a", sw: 4 },
    { id: "moon", t: "circle", cx: 70, cy: 190, r: 46, fill: "#d9dbe3" },
    { id: "crater1", t: "circle", cx: 56, cy: 178, r: 8, fill: "#b8bac4" },
    { id: "crater2", t: "circle", cx: 84, cy: 200, r: 6, fill: "#b8bac4" },
    { id: "crater3", t: "circle", cx: 70, cy: 214, r: 5, fill: "#b8bac4" },
    { id: "rocket", t: "path", d: "M180 60 q22 30 0 90 q-22 -60 0 -90Z", fill: "#f1f5f9" },
    { id: "rocketwin", t: "circle", cx: 180, cy: 95, r: 7, fill: "#5b8def" },
    { id: "rocketwin2", t: "circle", cx: 180, cy: 118, r: 5, fill: "#5b8def" },
    { id: "fin1", t: "poly", pts: "170,130 158,150 172,146", fill: "#ef4444" },
    { id: "fin2", t: "poly", pts: "190,130 202,150 188,146", fill: "#ef4444" },
    { id: "flame", t: "poly", pts: "172,150 180,172 188,150", fill: "#ffb347" },
    { id: "astro", t: "circle", cx: 130, cy: 120, r: 11, fill: "#fff" },
    { id: "astrovisor", t: "circle", cx: 132, cy: 120, r: 6, fill: "#1e293b" },
    { id: "astrobody", t: "rect", x: 122, y: 131, w: 16, h: 18, fill: "#e2e8f0", rx: 4 },
    { id: "flagpole", t: "rect", x: 108, y: 150, w: 2, h: 36, fill: "#cbd5e1" },
    { id: "flag", t: "rect", x: 110, y: 150, w: 18, h: 11, fill: "#ef4444" },
    { id: "ufo", t: "ellipse", cx: 60, cy: 70, rx: 26, ry: 8, fill: "#94a3b8" },
    { id: "ufodome", t: "path", d: "M44 66 A16 12 0 0 1 76 66 Z", fill: "#a5f3fc" },
    { id: "ufolight", t: "circle", cx: 60, cy: 74, r: 3, fill: "#fde047" },
    { id: "comet", t: "circle", cx: 240, cy: 150, r: 6, fill: "#fde68a" },
    { id: "comettail", t: "line", x1: 240, y1: 150, x2: 280, y2: 130, stroke: "#fde68a", sw: 3, op: 0.7 },
    { id: "sat", t: "rect", x: 300, y: 170, w: 14, h: 14, fill: "#cbd5e1", rx: 2 },
    { id: "satpanel1", t: "rect", x: 280, y: 173, w: 18, h: 8, fill: "#3b82f6" },
    { id: "satpanel2", t: "rect", x: 316, y: 173, w: 18, h: 8, fill: "#3b82f6" },
    { id: "earth", t: "circle", cx: 330, cy: 215, r: 18, fill: "#3b82f6" },
    { id: "earthland", t: "path", d: "M322 206 q10 -4 14 4 q-6 8 -14 4Z", fill: "#22c55e" },
  ],
  diffs: [
    { id: "d1", target: "ring", patch: { stroke: "#a5f3fc" }, cx: 290, cy: 72, label: "고리 색" },
    { id: "d2", target: "crater2", patch: { hidden: true }, cx: 84, cy: 200, label: "분화구" },
    { id: "d3", target: "rocketwin2", patch: { hidden: true }, cx: 180, cy: 118, label: "로켓 창" },
    { id: "d4", target: "fin1", patch: { fill: "#3b82f6" }, cx: 165, cy: 142, label: "날개 색" },
    { id: "d5", target: "flag", patch: { fill: "#22c55e" }, cx: 119, cy: 155, label: "깃발 색" },
    { id: "d6", target: "ufolight", patch: { hidden: true }, cx: 60, cy: 74, label: "UFO 불빛" },
    { id: "d7", target: "comettail", patch: { x2: 200, y2: 130 }, cx: 225, cy: 140, label: "혜성 꼬리" },
    { id: "d8", target: "satpanel2", patch: { fill: "#f59e0b" }, cx: 325, cy: 177, label: "태양광 패널" },
    { id: "d9", target: "earthland", patch: { hidden: true }, cx: 330, cy: 210, label: "지구 대륙" },
    { id: "d10", target: "astrovisor", patch: { fill: "#f59e0b" }, cx: 132, cy: 120, label: "헬멧" },
    { id: "d11", target: "flame", patch: { fill: "#60a5fa" }, cx: 180, cy: 160, label: "불꽃 색" },
    { id: "d12", target: "s0", patch: { r: 5, fill: "#fde047" }, cx: 5, cy: 8, label: "별" },
  ],
};

export const SCENES: Scene[] = [park, beach, space];

export function applyDiffs(scene: Scene, diffIds: string[]): Shape[] {
  const byId = new Map(scene.diffs.map((d) => [d.id, d]));
  return scene.objects.flatMap((o) => {
    let out: Shape = { ...o };
    for (const id of diffIds) {
      const d = byId.get(id);
      if (!d || d.target !== o.id) continue;
      if (d.patch.hidden) return [];
      out = { ...out, ...(d.patch as object) } as Shape;
    }
    return [out];
  });
}
