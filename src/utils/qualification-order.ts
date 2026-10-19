/**
 * Qualification Hierarchy & Order in Bangladesh (Academic & Professional Standard):
 * Highest to Lowest (Reverse-Chronological):
 * 1. Ph.D. / Doctorate
 * 2. M.Phil.
 * 3. Master's Degree (e.g., M.Sc., MBA, M.A.)
 * 4. Postgraduate Diploma (PGD)
 * 5. Bachelor's Degree (e.g., B.Sc. Engg., B.Sc. Hons, BBA)
 * 6. Higher Secondary Certificate (H.S.C)
 * 7. Secondary School Certificate (S.S.C)
 */

export const QUALIFICATION_LEVELS = [
  { rank: 1, label: "Ph.D. / Doctorate" },
  { rank: 2, label: "M.Phil." },
  { rank: 3, label: "Master's Degree (e.g., M.Sc., MBA, M.A.)" },
  { rank: 4, label: "Postgraduate Diploma (PGD)" },
  { rank: 5, label: "Bachelor's Degree (e.g., B.Sc. Engg., B.Sc. Hons, BBA)" },
  { rank: 6, label: "Higher Secondary Certificate (H.S.C)" },
  { rank: 7, label: "Secondary School Certificate (S.S.C)" },
] as const;

/**
 * Returns numeric rank (1-7) for an educational qualification based on canonical hierarchy.
 * Lower number represents higher qualification rank.
 */
export function getQualificationRank(degreeTitle: string): number {
  if (!degreeTitle || typeof degreeTitle !== "string") return 99;

  // Normalize: lower-case, remove extra punctuation dots inside abbreviations for easier matching
  const text = degreeTitle.trim().toLowerCase();
  const clean = text.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);

  // 1. Ph.D. / Doctorate
  if (
    tokens.includes("phd") ||
    tokens.includes("dphil") ||
    tokens.includes("doctorate") ||
    text.includes("ph.d") ||
    text.includes("d.phil") ||
    text.includes("doctor of philosophy") ||
    text.includes("post-doc") ||
    text.includes("postdoc")
  ) {
    return 1;
  }

  // 2. M.Phil.
  if (
    tokens.includes("mphil") ||
    text.includes("m.phil") ||
    text.includes("master of philosophy")
  ) {
    return 2;
  }

  // 3. Master's Degree (e.g. M.Sc., MBA, M.A., M.Engg., M.Tech, M.Ed, LL.M.)
  // Must check after M.Phil
  if (
    tokens.includes("msc") ||
    tokens.includes("ms") ||
    tokens.includes("mba") ||
    tokens.includes("emba") ||
    tokens.includes("ma") ||
    tokens.includes("mcom") ||
    tokens.includes("mtech") ||
    tokens.includes("mengg") ||
    tokens.includes("meng") ||
    tokens.includes("med") ||
    tokens.includes("llm") ||
    tokens.includes("march") ||
    tokens.includes("mpharm") ||
    tokens.includes("mfa") ||
    text.includes("m.sc") ||
    text.includes("m.s.") ||
    text.includes("m.a.") ||
    text.includes("m.com") ||
    text.includes("m.tech") ||
    text.includes("m.engg") ||
    text.includes("m.eng") ||
    text.includes("ll.m") ||
    text.includes("m.ed") ||
    text.includes("master") ||
    text.includes("masters") ||
    text.includes("post-graduation") ||
    text.includes("postgraduation")
  ) {
    return 3;
  }

  // 4. Postgraduate Diploma (PGD)
  if (
    tokens.includes("pgd") ||
    tokens.includes("pgdiploma") ||
    text.includes("p.g.d") ||
    text.includes("pgd") ||
    text.includes("post graduate diploma") ||
    text.includes("postgraduate diploma") ||
    text.includes("pg diploma")
  ) {
    return 4;
  }

  // 5. Bachelor's Degree (e.g. B.Sc. Engg., B.Sc. Hons, BBA, B.A., LL.B., B.Arch)
  if (
    tokens.includes("bsc") ||
    tokens.includes("bs") ||
    tokens.includes("bba") ||
    tokens.includes("ba") ||
    tokens.includes("bcom") ||
    tokens.includes("btech") ||
    tokens.includes("bengg") ||
    tokens.includes("beng") ||
    tokens.includes("bed") ||
    tokens.includes("llb") ||
    tokens.includes("barch") ||
    tokens.includes("bpharm") ||
    tokens.includes("bfa") ||
    tokens.includes("mbbs") ||
    tokens.includes("bds") ||
    text.includes("b.sc") ||
    text.includes("b.s.") ||
    text.includes("b.a.") ||
    text.includes("b.com") ||
    text.includes("b.tech") ||
    text.includes("b.engg") ||
    text.includes("b.eng") ||
    text.includes("ll.b") ||
    text.includes("b.ed") ||
    text.includes("bachelor") ||
    text.includes("bachelors") ||
    text.includes("undergraduate") ||
    text.includes("graduation") ||
    text.includes("honours") ||
    text.includes("hons")
  ) {
    return 5;
  }

  // 6. Higher Secondary Certificate (H.S.C)
  if (
    tokens.includes("hsc") ||
    tokens.includes("alim") ||
    text.includes("h.s.c") ||
    text.includes("higher secondary") ||
    text.includes("intermediate") ||
    text.includes("a level") ||
    text.includes("a-level") ||
    text.includes("a levels") ||
    text.includes("12th")
  ) {
    return 6;
  }

  // 7. Secondary School Certificate (S.S.C)
  if (
    tokens.includes("ssc") ||
    tokens.includes("dakhil") ||
    tokens.includes("matric") ||
    tokens.includes("matriculation") ||
    text.includes("s.s.c") ||
    text.includes("secondary school") ||
    text.includes("o level") ||
    text.includes("o-level") ||
    text.includes("o levels") ||
    text.includes("10th")
  ) {
    return 7;
  }

  // General Diploma (e.g. 4-year Polytechnic Diploma in Engineering -> rank 5.5, or 8)
  if (tokens.includes("diploma") || text.includes("diploma")) {
    return 8;
  }

  return 9;
}

/**
 * Extracts a 4-digit calendar year (e.g. 2021) from text or number for sorting tie-breaker.
 */
function extractYear(val: any): number {
  if (typeof val === "number" && val >= 1950 && val <= 2099) return val;
  if (typeof val === "string") {
    const match = val.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) return num;
    }
  }
  return 0;
}

/**
 * Sorts an array of qualification objects in exact reverse-chronological order:
 * 1. Highest rank degree first (Ph.D. -> M.Phil. -> Masters -> PGD -> Bachelors -> HSC -> SSC)
 * 2. If same rank, newer passing year first (e.g. 2022 before 2018)
 */
export function sortQualifications<T>(
  items: T[],
  getDegree: (item: T) => string,
  getYearOrDetails?: (item: T) => any
): T[] {
  if (!Array.isArray(items) || items.length <= 1) return items ? [...items] : [];

  return [...items].sort((a, b) => {
    const degA = getDegree(a) || "";
    const degB = getDegree(b) || "";

    const rankA = getQualificationRank(degA);
    const rankB = getQualificationRank(degB);

    if (rankA !== rankB) {
      return rankA - rankB; // Lower rank number is higher priority (1 before 2, etc.)
    }

    // Secondary: Year descending (newer first)
    if (getYearOrDetails) {
      const yearA = extractYear(getYearOrDetails(a)) || extractYear(degA);
      const yearB = extractYear(getYearOrDetails(b)) || extractYear(degB);
      if (yearA && yearB && yearA !== yearB) {
        return yearB - yearA;
      }
    }

    return 0;
  });
}

/**
 * Sorts Record entries [degree, institutionOrDetails] in exact hierarchy order.
 */
export function sortQualificationEntries(
  entries: [string, string][]
): [string, string][] {
  if (!Array.isArray(entries) || entries.length <= 1) return entries ? [...entries] : [];

  return [...entries].sort(([degA, detailA], [degB, detailB]) => {
    const rankA = getQualificationRank(degA);
    const rankB = getQualificationRank(degB);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    const yearA = extractYear(detailA) || extractYear(degA);
    const yearB = extractYear(detailB) || extractYear(degB);
    if (yearA && yearB && yearA !== yearB) {
      return yearB - yearA;
    }

    return 0;
  });
}
