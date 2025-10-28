// utils/normalizeRecommendationData.ts
export function normalizeRecommendationData(rawData: any) {
  if (!rawData || typeof rawData !== "object") return {};

  // Normalize key variations across languages
  const keyMap: Record<string, string> = {
    // English
    "planName": "planName",
    "sumInsured": "sumInsured",
    "premium": "premium",
    "reason": "reason",
    "riders": "riders",

    // Hindi
    "योजना का नाम": "planName",
    "बीमित राशि": "sumInsured",
    "प्रीमियम": "premium",
    "कारण": "reason",
    "राइडर्स": "riders",

    // Marathi
    "योजनेचे नाव": "planName",
    "विम्याची रक्कम": "sumInsured",
    // "प्रीमियम": "premium",
    // "कारण": "reason",
    "रायडर्स": "riders",

    // Tamil / Telugu / Bengali etc — can extend here
    "ప్రణాళిక పేరు": "planName",
    "বীমার পরিমাণ": "sumInsured",
    "প্রিমিয়াম": "premium",
    "কারণ": "reason",
  };

  const normalized: any = {};

  Object.keys(rawData).forEach((key) => {
    const englishKey = keyMap[key] || key; // fallback to same key
    normalized[englishKey] = rawData[key];
  });

  // Optional: Fix missing fields
  normalized.planName ??= "N/A";
  normalized.sumInsured ??= 0;
  normalized.premium ??= 0;
  normalized.reason ??= "";
  normalized.riders ??= [];

  return normalized;
}
