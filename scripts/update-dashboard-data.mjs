import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import { existsSync, watch as watchFs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT_DIR, "data", "raw");
const TEMPLATE_FILE = path.join(ROOT_DIR, "data", "templates", "warehouse-template.xlsx");
const OUTPUT_FILE = path.join(ROOT_DIR, "src", "generated", "warehouse-data.jsx");
const BANGKOK_TZ = "Asia/Bangkok";

const FIELD_ALIASES = {
  region: ["vung", "ten vung", "mien", "khu vuc", "region", "area"],
  name: ["ten kho", "kho", "warehouse", "warehouse name", "site", "chi nhanh", "diem kho"],
  cap: ["nl tong", "nang luc tong", "tong nang luc", "capacity", "total capacity", "cap", "nang luc"],
  ac: ["nl ml", "nang luc ml", "nang luc may lanh", "capacity ml", "capacity ac", "ac", "ml", "may lanh"],
  dhk: ["nl dhk", "nang luc dhk", "capacity dhk", "dhk", "dieu hoa khong khi"],
  declared: ["khai bao tong", "tong khai bao", "declared", "kb tong", "khai bao ht", "kb ht"],
  declAC: ["khai bao ml", "kb ml", "khai bao may lanh", "declared ml", "declared ac", "kb ac"],
  declDHK: ["khai bao dhk", "kb dhk", "declared dhk"],
  used: ["da su dung tong", "su dung tong", "tong su dung", "used", "used total"],
  usedAC: ["da su dung ml", "su dung ml", "used ml", "used ac"],
  usedDHK: ["da su dung dhk", "su dung dhk", "used dhk"],
  pctDecl: ["kb nl", "khai bao nl", "khai bao nang luc", "pct decl", "pctdecl", "% kb/nl", "% khai bao/nl"],
  pctAC: ["kb ml nl", "kb ml", "khai bao ml nl", "pct ac", "pctac", "% kb ml", "% kb/nl ml"],
  pctDHK: ["kb dhk nl", "kb dhk", "khai bao dhk nl", "pct dhk", "pctdhk", "% kb dhk", "% kb/nl dhk"],
  foreAC: ["nl dba ml", "dba ml", "du bao ml", "forecast ml", "forecast ac", "fore ac", "foreac", "% nl/dba ml"],
  foreDHK: ["nl dba dhk", "dba dhk", "du bao dhk", "forecast dhk", "fore dhk", "foredhk", "% nl/dba dhk"],
  status: ["trang thai", "status", "canh bao", "muc canh bao"],
};

const PERCENT_FIELDS = new Set(["pctDecl", "pctAC", "pctDHK", "foreAC", "foreDHK"]);
const REQUIRED_FIELDS = ["region", "name"];
const RECOMMENDED_FIELDS = ["cap", "ac", "dhk", "declAC", "declDHK", "usedAC", "usedDHK", "foreAC", "foreDHK"];

const REGION_NAME_ALIASES = new Map([
  ["dtb", "Đông Tây Bắc"],
  ["dongtaybac", "Đông Tây Bắc"],
  ["dbsh", "Đồng Bằng Sông Hồng"],
  ["dongbangsonghong", "Đồng Bằng Sông Hồng"],
  ["hn", "Hà Nội +"],
  ["hnplus", "Hà Nội +"],
  ["hanoi", "Hà Nội +"],
  ["hanoiplus", "Hà Nội +"],
  ["tb", "Trung Bộ"],
  ["trungbo", "Trung Bộ"],
  ["dh", "Duyên Hải"],
  ["duyenhai", "Duyên Hải"],
  ["dcn", "Đông Cao Nguyên"],
  ["dongcaonguyen", "Đông Cao Nguyên"],
  ["hcm", "Hồ Chí Minh"],
  ["hochiminh", "Hồ Chí Minh"],
  ["tnb1", "Tây Nam Bộ 1"],
  ["taynambo1", "Tây Nam Bộ 1"],
  ["tnb2", "Tây Nam Bộ 2"],
  ["taynambo2", "Tây Nam Bộ 2"],
]);

const REGION_SHORT_NAMES = new Map([
  ["Đông Tây Bắc", "ĐTB"],
  ["Đồng Bằng Sông Hồng", "ĐBSH"],
  ["Hà Nội +", "HN+"],
  ["Trung Bộ", "TB"],
  ["Duyên Hải", "DH"],
  ["Đông Cao Nguyên", "ĐCN"],
  ["Hồ Chí Minh", "HCM"],
  ["Tây Nam Bộ 1", "TNB1"],
  ["Tây Nam Bộ 2", "TNB2"],
]);

const REGION_ORDER = [
  "Đông Tây Bắc",
  "Đồng Bằng Sông Hồng",
  "Hà Nội +",
  "Trung Bộ",
  "Duyên Hải",
  "Đông Cao Nguyên",
  "Hồ Chí Minh",
  "Tây Nam Bộ 1",
  "Tây Nam Bộ 2",
];

const ALIAS_TO_FIELD = new Map();
for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_FIELD.set(normalizeHeader(alias), field);
  }
}

function parseArgs(argv) {
  const options = { input: null, watch: false, template: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--watch" || arg === "-w") options.watch = true;
    else if (arg === "--template") options.template = true;
    else if (arg === "--input" || arg === "-i") options.input = argv[++index];
    else if (arg.startsWith("--input=")) options.input = arg.slice("--input=".length);
    else if (!arg.startsWith("-") && !options.input) options.input = arg;
  }

  return options;
}

function printHelp() {
  console.log(`
Warehouse dashboard data updater

Usage:
  npm run data:update
  npm run data:update -- --input data/raw/file.xlsx
  npm run data:watch
  npm run data:template

The tool reads the newest .xlsx file in data/raw and writes:
  src/generated/warehouse-data.jsx
`);
}

function normalizeHeader(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[%/\\().:_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactKey(value) {
  return normalizeHeader(value).replace(/\s+/g, "");
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function cellValue(cell) {
  const value = cell?.value;
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value;
  if (typeof value !== "object") return value;
  if ("result" in value && value.result !== null && value.result !== undefined) return value.result;
  if ("text" in value && value.text !== null && value.text !== undefined) return value.text;
  if ("richText" in value && Array.isArray(value.richText)) return value.richText.map((item) => item.text ?? "").join("");
  if ("formula" in value) return value.result ?? "";
  return String(value);
}

function cellInfo(row, columnNumber) {
  if (!columnNumber) return { raw: "", numFmt: "" };
  const cell = row.getCell(columnNumber);
  return { raw: cellValue(cell), numFmt: cell.numFmt ?? "" };
}

function headerToField(value) {
  const normalized = normalizeHeader(value);
  if (!normalized) return null;
  const exact = ALIAS_TO_FIELD.get(normalized);
  if (exact) return exact;

  for (const [alias, field] of ALIAS_TO_FIELD.entries()) {
    if (alias.length >= 4 && normalized.includes(alias)) return field;
  }

  return null;
}

function detectHeaderMap(row) {
  const fieldMap = {};
  const headers = {};

  for (let columnNumber = 1; columnNumber <= row.cellCount; columnNumber += 1) {
    const rawHeader = cleanText(cellValue(row.getCell(columnNumber)));
    const field = headerToField(rawHeader);
    if (field && !fieldMap[field]) {
      fieldMap[field] = columnNumber;
      headers[field] = rawHeader;
    }
  }

  const fields = Object.keys(fieldMap);
  const hasRequired = REQUIRED_FIELDS.every((field) => fieldMap[field]);
  const score =
    fields.length +
    (fieldMap.region ? 5 : 0) +
    (fieldMap.name ? 5 : 0) +
    (fieldMap.cap ? 2 : 0) +
    (fieldMap.declAC || fieldMap.declDHK || fieldMap.declared ? 2 : 0);

  return { fieldMap, headers, fields, hasRequired, score };
}

function findWarehouseTable(workbook) {
  let best = null;

  for (const worksheet of workbook.worksheets) {
    const maxHeaderRow = Math.min(worksheet.rowCount, 30);
    for (let rowNumber = 1; rowNumber <= maxHeaderRow; rowNumber += 1) {
      const candidate = detectHeaderMap(worksheet.getRow(rowNumber));
      if (!candidate.hasRequired || candidate.fields.length < 4) continue;

      if (!best || candidate.score > best.score) {
        best = { worksheet, rowNumber, ...candidate };
      }
    }
  }

  return best;
}

function parseNumber(info, { percent = false } = {}) {
  const value = info?.raw;
  if (value === null || value === undefined || value === "") return null;

  let numberValue;
  if (typeof value === "number") {
    numberValue = value;
  } else if (value instanceof Date) {
    return null;
  } else {
    let text = String(value).trim();
    if (!text) return null;
    const hasPercent = text.includes("%");
    text = text
      .replace(/%/g, "")
      .replace(/\s/g, "")
      .replace(/[^\d,.-]/g, "");

    if (!text || text === "-" || text === "." || text === ",") return null;
    const commaDecimal = /,\d{1,3}$/.test(text) && text.includes(".");
    if (commaDecimal) text = text.replace(/\./g, "").replace(",", ".");
    else text = text.replace(/,/g, "");
    numberValue = Number(text);

    if (hasPercent && Number.isFinite(numberValue)) return numberValue;
  }

  if (!Number.isFinite(numberValue)) return null;
  const looksLikeExcelPercent = percent && Math.abs(numberValue) > 0 && Math.abs(numberValue) <= 2;
  if (looksLikeExcelPercent || (percent && String(info?.numFmt ?? "").includes("%") && Math.abs(numberValue) <= 2)) {
    return numberValue * 100;
  }

  return numberValue;
}

function rounded(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

function percent(numerator, denominator) {
  if (!denominator) return 0;
  return rounded((numerator / denominator) * 100);
}

function normalizeRegionName(value) {
  const cleaned = cleanText(value);
  const canonical = REGION_NAME_ALIASES.get(compactKey(cleaned));
  return canonical ?? cleaned;
}

function regionShortName(regionName) {
  const mapped = REGION_SHORT_NAMES.get(regionName);
  if (mapped) return mapped;

  const initials = normalizeHeader(regionName)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials.slice(0, 5) || regionName.slice(0, 5).toUpperCase();
}

function normalizeStatus(value) {
  const raw = cleanText(value);
  if (!raw) return null;
  if (raw.includes("🔴")) return "🔴";
  if (raw.includes("🟡")) return "🟡";
  if (raw.includes("🟢")) return "🟢";

  const text = normalizeHeader(raw);
  if (text.includes("qua tai") || text.includes("do") || text.includes("red") || text.includes("nguy hiem")) return "🔴";
  if (text.includes("canh bao") || text.includes("vang") || text.includes("yellow") || text.includes("warning")) return "🟡";
  if (text.includes("binh thuong") || text.includes("xanh") || text.includes("green") || text.includes("ok")) return "🟢";
  return null;
}

function deriveWarehouseStatus(row) {
  if (row.pctDecl > 100 || row.pctAC > 100 || row.pctDHK > 100 || row.foreAC > 200 || row.foreDHK > 200) return "🔴";
  if (row.pctDecl >= 90 || row.pctAC >= 90 || row.pctDHK >= 90 || row.foreAC >= 150 || row.foreDHK >= 150) return "🟡";
  return "🟢";
}

function deriveRegionStatus(region) {
  if (region.pctDecl > 110 || region.pctAC > 115 || region.pctDHK > 120) return "🔴";
  if (region.pctDecl >= 95 || region.pctAC >= 95 || region.pctDHK >= 100) return "🟡";
  return "🟢";
}

function cleanWarehouseName(value) {
  return cleanText(value)
    .replace(/^kho\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripRegionPrefix(value) {
  return cleanText(value).replace(/^vùng\s+/i, "").trim();
}

function fixedNumber(row, columnNumber, { percent = false } = {}) {
  return parseNumber(cellInfo(row, columnNumber), { percent });
}

function fixedStatus(row, columnNumber) {
  return normalizeStatus(cellValue(row.getCell(columnNumber)));
}

function isOverviewReportSheet(worksheet) {
  for (let rowNumber = 1; rowNumber <= Math.min(worksheet.rowCount, 12); rowNumber += 1) {
    for (let columnNumber = 1; columnNumber <= Math.min(worksheet.columnCount, 6); columnNumber += 1) {
      const text = normalizeHeader(cellValue(worksheet.getRow(rowNumber).getCell(columnNumber)));
      if (text.includes("tong quan nang luc thuc te")) return true;
    }
  }

  return false;
}

function parseOverviewReportWorksheet(worksheet) {
  let currentRegion = null;
  const regions = [];
  const warehouses = [];
  let skippedRows = 0;

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const firstText = cleanText(cellValue(row.getCell(2)));
    const fullName = cleanText(cellValue(row.getCell(3)));
    const shortName = cleanWarehouseName(cellValue(row.getCell(4)));
    const firstKey = compactKey(firstText);
    const cap = rounded(fixedNumber(row, 5) ?? 0);

    if (!firstText && !fullName && !shortName) continue;
    if (firstKey === "toanquoc") {
      skippedRows += 1;
      continue;
    }
    if (firstKey === "vung" || firstKey.includes("tongquannangluc") || firstKey === "tenkho") {
      skippedRows += 1;
      continue;
    }

    const looksLikeRegion = /^vùng\s+/i.test(firstText) && !fullName && cap > 0;
    if (looksLikeRegion) {
      currentRegion = normalizeRegionName(stripRegionPrefix(firstText));
      const region = {
        name: currentRegion,
        short: regionShortName(currentRegion),
        capacity: cap,
        ac: rounded(fixedNumber(row, 6) ?? 0),
        dhk: rounded(fixedNumber(row, 7) ?? 0),
        declared: rounded(fixedNumber(row, 9) ?? 0),
        declAC: rounded(fixedNumber(row, 10) ?? 0),
        declDHK: rounded(fixedNumber(row, 11) ?? 0),
        used: rounded(fixedNumber(row, 13) ?? 0),
        usedAC: rounded(fixedNumber(row, 14) ?? 0),
        usedDHK: rounded(fixedNumber(row, 15) ?? 0),
        remain: rounded(fixedNumber(row, 17) ?? 0),
        pctDecl: rounded(fixedNumber(row, 21, { percent: true }) ?? 0),
        pctAC: rounded(fixedNumber(row, 22, { percent: true }) ?? 0),
        pctDHK: rounded(fixedNumber(row, 23, { percent: true }) ?? 0),
        pctForeAC: rounded(fixedNumber(row, 25, { percent: true }) ?? 0),
        pctForeDHK: rounded(fixedNumber(row, 26, { percent: true }) ?? 0),
        status: fixedStatus(row, 33),
      };
      region.status = region.status ?? deriveRegionStatus(region);
      regions.push(region);
      continue;
    }

    const looksLikeWarehouse = currentRegion && fullName && shortName && cap > 0 && firstKey !== "vung";
    if (!looksLikeWarehouse) {
      skippedRows += 1;
      continue;
    }

    const warehouse = {
      region: currentRegion,
      name: shortName || firstText,
      cap,
      ac: rounded(fixedNumber(row, 6) ?? 0),
      dhk: rounded(fixedNumber(row, 7) ?? 0),
      declAC: rounded(fixedNumber(row, 10) ?? 0),
      declDHK: rounded(fixedNumber(row, 11) ?? 0),
      usedAC: rounded(fixedNumber(row, 14) ?? 0),
      usedDHK: rounded(fixedNumber(row, 15) ?? 0),
      pctDecl: rounded(fixedNumber(row, 21, { percent: true }) ?? 0),
      pctAC: rounded(fixedNumber(row, 22, { percent: true }) ?? 0),
      pctDHK: rounded(fixedNumber(row, 23, { percent: true }) ?? 0),
      foreAC: rounded(fixedNumber(row, 25, { percent: true }) ?? 0),
      foreDHK: rounded(fixedNumber(row, 26, { percent: true }) ?? 0),
      status: fixedStatus(row, 33),
    };
    warehouse.status = warehouse.status ?? deriveWarehouseStatus(warehouse);
    warehouses.push(warehouse);
  }

  return { regions, warehouses, warnings: skippedRows ? [`Skipped ${skippedRows} non-data row(s).`] : [] };
}

function parseOverviewReport(workbook) {
  const candidates = workbook.worksheets
    .filter(isOverviewReportSheet)
    .map((worksheet) => ({ worksheet, ...parseOverviewReportWorksheet(worksheet) }))
    .filter((candidate) => candidate.warehouses.length && candidate.regions.length);

  candidates.sort((a, b) => b.warehouses.length - a.warehouses.length);
  const best = candidates[0];
  if (!best) return null;

  return {
    regions: best.regions,
    warehouses: best.warehouses,
    warnings: ["Parsed multi-row overview report layout.", ...best.warnings],
    sheetName: best.worksheet.name,
  };
}

function rowLooksLikeTotal(name, region) {
  const text = compactKey(`${name} ${region}`);
  return text === "tong" || text === "tongcong" || text === "total" || text.includes("grandtotal");
}

function parseWarehouseRows(table) {
  const warnings = [];
  const { worksheet, rowNumber: headerRowNumber, fieldMap } = table;
  const missingRecommended = RECOMMENDED_FIELDS.filter((field) => !fieldMap[field]);
  if (missingRecommended.length) {
    warnings.push(`Missing optional columns: ${missingRecommended.join(", ")}. Values will be computed or set to 0 when needed.`);
  }
  if (!fieldMap.status) {
    warnings.push("Missing status column: status will be derived from threshold rules.");
  }

  const warehouses = [];
  let skippedRows = 0;

  for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const raw = {};
    const get = (field) => {
      if (!Object.prototype.hasOwnProperty.call(raw, field)) raw[field] = cellInfo(row, fieldMap[field]);
      return raw[field];
    };
    const optionalNumber = (field) => {
      if (!fieldMap[field]) return null;
      return parseNumber(get(field), { percent: PERCENT_FIELDS.has(field) });
    };

    const name = cleanText(cellValue(row.getCell(fieldMap.name)));
    const region = normalizeRegionName(cellValue(row.getCell(fieldMap.region)));
    if (!name && !region) continue;
    if (!name || !region || rowLooksLikeTotal(name, region)) {
      skippedRows += 1;
      continue;
    }

    const ac = rounded(optionalNumber("ac") ?? 0);
    const dhk = rounded(optionalNumber("dhk") ?? 0);
    const cap = rounded(optionalNumber("cap") ?? ac + dhk);
    const declaredTotal = optionalNumber("declared");
    const usedTotal = optionalNumber("used");

    let declAC = rounded(optionalNumber("declAC") ?? 0);
    let declDHK = rounded(optionalNumber("declDHK") ?? 0);
    if (declaredTotal !== null && (!fieldMap.declAC || !fieldMap.declDHK)) {
      if (!fieldMap.declAC && !fieldMap.declDHK) declDHK = rounded(declaredTotal);
      else if (!fieldMap.declDHK) declDHK = Math.max(0, rounded(declaredTotal - declAC));
      else if (!fieldMap.declAC) declAC = Math.max(0, rounded(declaredTotal - declDHK));
    }

    let usedAC = rounded(optionalNumber("usedAC") ?? 0);
    let usedDHK = rounded(optionalNumber("usedDHK") ?? 0);
    if (usedTotal !== null && (!fieldMap.usedAC || !fieldMap.usedDHK)) {
      if (!fieldMap.usedAC && !fieldMap.usedDHK) usedDHK = rounded(usedTotal);
      else if (!fieldMap.usedDHK) usedDHK = Math.max(0, rounded(usedTotal - usedAC));
      else if (!fieldMap.usedAC) usedAC = Math.max(0, rounded(usedTotal - usedDHK));
    }

    const rowData = {
      region,
      name,
      cap,
      ac,
      dhk,
      declAC,
      declDHK,
      usedAC,
      usedDHK,
      pctDecl: rounded(optionalNumber("pctDecl") ?? percent(declAC + declDHK, cap)),
      pctAC: rounded(optionalNumber("pctAC") ?? percent(declAC, ac)),
      pctDHK: rounded(optionalNumber("pctDHK") ?? percent(declDHK, dhk)),
      foreAC: rounded(optionalNumber("foreAC") ?? 0),
      foreDHK: rounded(optionalNumber("foreDHK") ?? 0),
      status: fieldMap.status ? normalizeStatus(cellValue(row.getCell(fieldMap.status))) : null,
    };

    rowData.status = rowData.status ?? deriveWarehouseStatus(rowData);
    warehouses.push(rowData);
  }

  if (skippedRows) warnings.push(`Skipped ${skippedRows} non-data row(s).`);
  if (!warehouses.length) {
    throw new Error(`No warehouse rows found in sheet "${worksheet.name}". Check the header names and data rows.`);
  }

  return { warehouses, warnings };
}

function buildRegions(warehouses) {
  const groups = new Map();

  warehouses.forEach((warehouse, index) => {
    if (!groups.has(warehouse.region)) {
      groups.set(warehouse.region, {
        name: warehouse.region,
        short: regionShortName(warehouse.region),
        capacity: 0,
        ac: 0,
        dhk: 0,
        declared: 0,
        declAC: 0,
        declDHK: 0,
        used: 0,
        usedAC: 0,
        usedDHK: 0,
        remain: 0,
        pctDecl: 0,
        pctAC: 0,
        pctDHK: 0,
        pctForeAC: 0,
        pctForeDHK: 0,
        status: "🟢",
        firstIndex: index,
        weightedForeAC: 0,
        weightedForeDHK: 0,
      });
    }

    const group = groups.get(warehouse.region);
    group.capacity += warehouse.cap;
    group.ac += warehouse.ac;
    group.dhk += warehouse.dhk;
    group.declAC += warehouse.declAC;
    group.declDHK += warehouse.declDHK;
    group.usedAC += warehouse.usedAC;
    group.usedDHK += warehouse.usedDHK;
    group.weightedForeAC += warehouse.foreAC * warehouse.ac;
    group.weightedForeDHK += warehouse.foreDHK * warehouse.dhk;
  });

  const regions = Array.from(groups.values()).map((region) => {
    region.declared = region.declAC + region.declDHK;
    region.used = region.usedAC + region.usedDHK;
    region.remain = region.declared - region.used;
    region.pctDecl = percent(region.declared, region.capacity);
    region.pctAC = percent(region.declAC, region.ac);
    region.pctDHK = percent(region.declDHK, region.dhk);
    region.pctForeAC = percent(region.weightedForeAC, region.ac * 100);
    region.pctForeDHK = percent(region.weightedForeDHK, region.dhk * 100);
    region.status = deriveRegionStatus(region);

    delete region.firstIndex;
    delete region.weightedForeAC;
    delete region.weightedForeDHK;
    return region;
  });

  return regions.sort((a, b) => {
    const orderA = REGION_ORDER.indexOf(a.name);
    const orderB = REGION_ORDER.indexOf(b.name);
    if (orderA !== -1 || orderB !== -1) {
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name, "vi");
  });
}

function isExcelFile(fileName) {
  const lower = fileName.toLowerCase();
  return (lower.endsWith(".xlsx") || lower.endsWith(".xlsm")) && !path.basename(fileName).startsWith("~$");
}

async function findNewestWorkbook() {
  await fs.mkdir(RAW_DIR, { recursive: true });
  const entries = await fs.readdir(RAW_DIR, { withFileTypes: true });
  const candidates = [];

  for (const entry of entries) {
    if (!entry.isFile() || !isExcelFile(entry.name)) continue;
    const fullPath = path.join(RAW_DIR, entry.name);
    const stats = await fs.stat(fullPath);
    candidates.push({ fullPath, mtimeMs: stats.mtimeMs });
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.fullPath ?? null;
}

function resolveInputFile(input) {
  if (!input) return null;
  return path.isAbsolute(input) ? input : path.resolve(ROOT_DIR, input);
}

function formatDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: BANGKOK_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toModuleCode({ regions, warehouses, sourceFile, warnings }) {
  const generatedAt = new Date();
  return `// Auto-generated by scripts/update-dashboard-data.mjs.
// Do not edit this file by hand. Put a new .xlsx in data/raw and run npm run data:update.

export const DATA_UPDATED_AT = ${JSON.stringify(generatedAt.toISOString())};
export const DATA_UPDATED_LABEL = ${JSON.stringify(formatDateLabel(generatedAt))};
export const DATA_SOURCE_FILE = ${JSON.stringify(path.basename(sourceFile))};
export const DATA_WARNINGS = ${JSON.stringify(warnings, null, 2)};

export const REGIONS = ${JSON.stringify(regions, null, 2)};

export const WAREHOUSES = ${JSON.stringify(warehouses, null, 2)};
`;
}

async function loadWorkbookData(inputFile) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputFile);

  const overviewReport = parseOverviewReport(workbook);
  if (overviewReport) return overviewReport;

  const table = findWarehouseTable(workbook);
  if (!table) {
    const sheetNames = workbook.worksheets.map((sheet) => sheet.name).join(", ");
    throw new Error(`Could not detect a warehouse table. Sheets found: ${sheetNames || "(none)"}.`);
  }

  const { warehouses, warnings } = parseWarehouseRows(table);
  const regions = buildRegions(warehouses);
  return { regions, warehouses, warnings, sheetName: table.worksheet.name };
}

async function updateData(options = {}) {
  const inputFile = resolveInputFile(options.input) ?? (await findNewestWorkbook());
  if (!inputFile) {
    throw new Error(`No .xlsx file found in ${path.relative(ROOT_DIR, RAW_DIR)}. Put the newest raw file there first.`);
  }
  if (!existsSync(inputFile)) {
    throw new Error(`Input file does not exist: ${inputFile}`);
  }

  const { regions, warehouses, warnings, sheetName } = await loadWorkbookData(inputFile);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, toModuleCode({ regions, warehouses, sourceFile: inputFile, warnings }), "utf8");

  console.log(`[OK] Updated ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`     Source: ${path.relative(ROOT_DIR, inputFile)}`);
  console.log(`     Sheet: ${sheetName}`);
  console.log(`     Rows: ${warehouses.length} warehouses, ${regions.length} regions`);
  if (warnings.length) {
    console.log("     Notes:");
    warnings.forEach((warning) => console.log(`      - ${warning}`));
  }
}

async function createTemplate() {
  await fs.mkdir(path.dirname(TEMPLATE_FILE), { recursive: true });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Warehouse dashboard updater";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Warehouses", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const headers = [
    "Vùng",
    "Tên kho",
    "NL Tổng",
    "NL ML",
    "NL ĐHK",
    "Khai báo ML",
    "Khai báo ĐHK",
    "Đã sử dụng ML",
    "Đã sử dụng ĐHK",
    "% KB/NL",
    "% KB ML",
    "% KB ĐHK",
    "% NL/DBA ML",
    "% NL/DBA ĐHK",
    "Trạng thái",
  ];

  sheet.addRow(headers);
  sheet.addRow(["Đông Tây Bắc", "Bắc Kạn", 50, 20, 30, 12, 28, 9, 2, "", "", "", 115, 93, "🔴"]);
  sheet.addRow(["Đồng Bằng Sông Hồng", "Bắc Giang", 230, 80, 150, 78, 148, 60, 66, "", "", "", 138, 103, "🟢"]);

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
  sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.max(12, Math.min(24, header.length + 4)),
  }));

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    sheet.getCell(`J${rowNumber}`).value = { formula: `IF(C${rowNumber}=0,0,(F${rowNumber}+G${rowNumber})/C${rowNumber})` };
    sheet.getCell(`K${rowNumber}`).value = { formula: `IF(D${rowNumber}=0,0,F${rowNumber}/D${rowNumber})` };
    sheet.getCell(`L${rowNumber}`).value = { formula: `IF(E${rowNumber}=0,0,G${rowNumber}/E${rowNumber})` };
    ["J", "K", "L"].forEach((column) => {
      sheet.getCell(`${column}${rowNumber}`).numFmt = "0%";
    });
  }

  sheet.autoFilter = "A1:O1";
  await workbook.xlsx.writeFile(TEMPLATE_FILE);
  console.log(`[OK] Created ${path.relative(ROOT_DIR, TEMPLATE_FILE)}`);
}

async function runOnce(options) {
  try {
    await updateData(options);
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    if (!options.watch) process.exitCode = 1;
  }
}

async function watchRawFolder(options) {
  await runOnce({ ...options, watch: true });
  console.log(`[WATCH] Watching ${path.relative(ROOT_DIR, RAW_DIR)} for Excel changes...`);

  let timer = null;
  const watcher = watchFs(RAW_DIR, { persistent: true }, (_eventType, fileName) => {
    if (!fileName || !isExcelFile(fileName)) return;
    clearTimeout(timer);
    timer = setTimeout(() => runOnce({ ...options, watch: true, input: null }), 800);
  });

  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (options.template) {
    await createTemplate();
    return;
  }
  if (options.watch) {
    await watchRawFolder(options);
    return;
  }
  await updateData(options);
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
});
