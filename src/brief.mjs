import { parseBrief } from "./schema.mjs";
import { runJsonTask } from "./llm.mjs";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractTerms(text, patterns) {
  return patterns.filter((item) => text.includes(item));
}

function heuristicBrief(sourceText, sourceType) {
  const text = sourceText.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  const useCases = unique(
    extractTerms(text, [
      "瑜伽",
      "训练",
      "跑步",
      "户外",
      "通勤",
      "连衣裙",
      "衬衫",
      "外套",
      "运动"
    ])
  );

  const materialDirection = unique(
    extractTerms(text, [
      "再生材料",
      "再生纤维",
      "再生涤纶",
      "有机棉",
      "天丝",
      "尼龙",
      "氨纶",
      "针织",
      "梭织",
      "仿麂皮",
      "复合面料"
    ])
  );

  const colorPalette = unique(
    extractTerms(text, [
      "多巴胺",
      "亮黄",
      "草木绿",
      "亮橙",
      "米白",
      "黑色",
      "卡其",
      "棕咖",
      "蓝色"
    ])
  );

  const textureAndFinish = unique(
    extractTerms(text, [
      "磨毛",
      "哑光",
      "光泽",
      "垂坠",
      "挺括",
      "柔软",
      "细腻",
      "高密"
    ])
  );

  const performance = unique(
    extractTerms(text, [
      "高弹",
      "四面弹",
      "吸湿排汗",
      "抗皱",
      "亲肤",
      "支撑",
      "透气",
      "防泼水"
    ])
  );

  const styleKeywords = unique(
    extractTerms(text, [
      "高级感",
      "静奢",
      "运动",
      "功能",
      "复古",
      "都市",
      "极简",
      "Y2K"
    ])
  );

  const exclusions = [];
  const budget = text.includes("预算")
    ? text.match(/预算[^，。；\n]*/)?.[0] || "已提及"
    : "未指定";

  const missingInfo = [];
  if (useCases.length === 0) {
    missingInfo.push("use_case");
  }
  if (materialDirection.length === 0) {
    missingInfo.push("material_direction");
  }
  if (performance.length === 0) {
    missingInfo.push("performance");
  }

  const ambiguities = [];
  if (text.includes("高级感")) {
    ambiguities.push("高级感");
  }
  if (text.includes("特别一点")) {
    ambiguities.push("特别一点");
  }

  return parseBrief({
    intent: "push_fabric",
    theme: useCases.length > 0 ? `${useCases[0]}面料提案` : "面料提案",
    audience: lower.includes("女性") ? "女性消费者" : "未指定",
    useCases,
    materialDirection,
    colorPalette,
    textureAndFinish,
    performance,
    styleKeywords,
    constraints: unique([
      ...extractTerms(text, ["环保", "纯色", "预算有限", "高支撑", "轻量"]),
      ...materialDirection
    ]),
    exclusions,
    budget,
    sourceType,
    summary: text.slice(0, 180),
    ambiguities,
    missingInfo,
    confidence:
      missingInfo.length === 0 && ambiguities.length === 0
        ? 0.78
        : 0.58
  });
}

export async function analyzeBrief(sourceText, sourceType) {
  const fallback = () => heuristicBrief(sourceText, sourceType);
  const result = await runJsonTask({
    system:
      "You are a fashion textile analyst. Read the user input and return only JSON with these keys: intent, theme, audience, useCases, materialDirection, colorPalette, textureAndFinish, performance, styleKeywords, constraints, exclusions, budget, sourceType, summary, ambiguities, missingInfo, confidence. Use Chinese strings for readable fields. The focus is fabric recommendation, not garment recommendation.",
    user: `Source type: ${sourceType}\n\nInput:\n${sourceText}`,
    fallback
  });

  return parseBrief({
    ...fallback(),
    ...result,
    sourceType
  });
}

export function buildClarifications(brief) {
  const questions = [];

  if (brief.ambiguities.includes("高级感")) {
    questions.push({
      id: "clarify-style",
      field: "styleKeywords",
      reason: "“高级感”过于宽泛，无法直接转成面料方向。",
      question:
        "你说的“高级感”更偏哪一种：垂坠感、细腻哑光、挺括有型，还是带一点光泽？"
    });
  }

  if (brief.missingInfo.includes("use_case")) {
    questions.push({
      id: "clarify-use-case",
      field: "useCases",
      reason: "面料用途不明确会直接影响性能建议。",
      question:
        "这批面料主要是做什么品类或场景：瑜伽服、外套、衬衫、连衣裙，还是其他？"
    });
  }

  if (brief.missingInfo.includes("performance")) {
    questions.push({
      id: "clarify-performance",
      field: "performance",
      reason: "缺少关键性能要求。",
      question:
        "你更在意哪些性能：高弹支撑、柔软亲肤、透气、吸湿排汗、抗皱，还是挺括？"
    });
  }

  if (brief.missingInfo.includes("material_direction")) {
    questions.push({
      id: "clarify-material",
      field: "materialDirection",
      reason: "材质方向不明确，候选面料会发散。",
      question:
        "材质上你更偏再生合成纤维、天然有机纤维、针织弹力面料，还是梭织功能面料？"
    });
  }

  return questions.slice(0, 2);
}

export function appendClarificationToInput(session, message) {
  const chunks = [session.inputText || session.extractedText];

  for (const item of session.clarificationHistory) {
    chunks.push(`补充说明：${item.message}`);
  }

  chunks.push(`补充说明：${message}`);
  return chunks.filter(Boolean).join("\n");
}
