const amapKeyInput = document.querySelector('#amapKey');
const toggleKeyButton = document.querySelector('#toggleKey');
const companyFileInput = document.querySelector('#companyFile');
const institutionFileInput = document.querySelector('#institutionFile');
const queryInstitutionFileInput = document.querySelector('#queryInstitutionFile');
const resolvedFileInput = document.querySelector('#resolvedFile');
const batchForm = document.querySelector('#batchForm');
const batchButton = document.querySelector('#batchButton');
const progressFill = document.querySelector('#progressFill');
const batchProgress = document.querySelector('#batchProgress');
const batchMetrics = document.querySelector('#batchMetrics');
const resolvedMetrics = document.querySelector('#resolvedMetrics');
const topList = document.querySelector('#topList');
const rankingBody = document.querySelector('#rankingBody');
const previewTable = document.querySelector('#previewTable');
const downloadLink = document.querySelector('#downloadLink');
const queryForm = document.querySelector('#queryForm');
const queryAddress = document.querySelector('#queryAddress');
const queryButton = document.querySelector('#queryButton');
const queryResult = document.querySelector('#queryResult');
const toast = document.querySelector('#toast');
const privacyStatus = document.querySelector('#privacyStatus');
const modeButtons = [...document.querySelectorAll('.mode-button')];
const matcherView = document.querySelector('#matcherView');
const dashboardView = document.querySelector('#dashboardView');
const subsidyView = document.querySelector('#subsidyView');
const subsidyForm = document.querySelector('#subsidyForm');
const subsidyZipFileInput = document.querySelector('#subsidyZipFile');
const subsidyAuditButton = document.querySelector('#subsidyAuditButton');
const subsidyDownloadLink = document.querySelector('#subsidyDownloadLink');
const subsidySource = document.querySelector('#subsidySource');
const subsidyMetrics = document.querySelector('#subsidyMetrics');
const subsidyHint = document.querySelector('#subsidyHint');
const subsidySummary = document.querySelector('#subsidySummary');
const subsidyTable = document.querySelector('#subsidyTable');
const dashboardFileInput = document.querySelector('#dashboardFile');
const sampleDashboardButton = document.querySelector('#sampleDashboardButton');
const yearSelect = document.querySelector('#yearSelect');
const weekSelect = document.querySelector('#weekSelect');
const regionSelect = document.querySelector('#regionSelect');
const overviewRegionSelect = document.querySelector('#overviewRegionSelect');
const overviewScopeSelect = document.querySelector('#overviewScopeSelect');
const rankingMetricPicker = document.querySelector('#rankingMetricPicker');
const rankingRegionSelect = document.querySelector('#rankingRegionSelect');
const rankingScopeSelect = document.querySelector('#rankingScopeSelect');
const trendChartTypeSelect = document.querySelector('#trendChartTypeSelect');
const trendMetricPicker = document.querySelector('#trendMetricPicker');
const institutionSelect = document.querySelector('#institutionSelect');
const institutionMetricSelect = document.querySelector('#institutionMetricSelect');
const downloadInstitutionPdfButton = document.querySelector('#downloadInstitutionPdfButton');
const downloadAllInstitutionPdfsButton = document.querySelector('#downloadAllInstitutionPdfsButton');
const heatmapMetricScopeSelect = document.querySelector('#heatmapMetricScopeSelect');
const heatmapRegionSelect = document.querySelector('#heatmapRegionSelect');
const heatmapSortSelect = document.querySelector('#heatmapSortSelect');
const dashboardSource = document.querySelector('#dashboardSource');
const dashboardKpis = document.querySelector('#dashboardKpis');
const overviewInstitutionList = document.querySelector('#overviewInstitutionList');
const dashboardRankList = document.querySelector('#dashboardRankList');
const combinedTrendChart = document.querySelector('#combinedTrendChart');
const heatmap = document.querySelector('#heatmap');
const rankingHint = document.querySelector('#rankingHint');
const heatmapHint = document.querySelector('#heatmapHint');
const institutionHint = document.querySelector('#institutionHint');
const institutionKpis = document.querySelector('#institutionKpis');
const institutionBars = document.querySelector('#institutionBars');

const CITY = '成都';
const CONCURRENCY = 2;
const amapJsonpBase = 'https://restapi.amap.com/v3';
let outputUrl = '';
let subsidyOutputUrl = '';
let toastTimer = null;
const defaultTrendMetricIds = ['coverage', 'highPenetration', 'settlement', 'contribution', 'loanCustomers', 'loanDepositRatio'];
let dashboardState = {
  rows: [],
  years: [],
  weeks: [],
  selectedYear: '',
  selectedWeek: '',
  selectedRegion: 'all',
  overviewRegion: 'all',
  selectedMetricId: 'coverage',
  selectedRankingMetricIds: ['coverage'],
  overviewScope: 'all',
  rankingScope: 'all',
  trendChartType: 'combo',
  selectedTrendMetricIds: [...defaultTrendMetricIds],
  selectedInstitution: '',
  selectedInstitutionMetricId: 'coverage',
  heatmapMetricScope: 'core',
  heatmapSort: 'customers',
  overviewDetailScope: '',
  rankExpanded: false,
  source: '',
  metricLabels: {},
};

const metricDefinitions = [
  { id: 'coverage', label: '综合业务覆盖率', aliases: ['综合业务覆盖率', '综合覆盖渗透率', '综合业务指标', '年初覆盖率', '年初综合覆盖率'], kind: 'rate', target: 0.65 },
  { id: 'highPenetration', label: '高渗透覆盖率', aliases: ['高渗透客户占比', '高渗透客户户数占比', '高渗透覆盖率'], kind: 'rate', target: 0.35 },
  { id: 'bill', label: '电票覆盖率', aliases: ['电票业务穿透率', '电票业务渗透率', '电票覆盖率', '电票结算覆盖率'], kind: 'rate', target: 0.55 },
  { id: 'acquiring', label: '收单业务覆盖率', aliases: ['收单业务覆盖率', '收单业务渗透率', '收单覆盖率'], kind: 'rate', target: 0.55 },
  { id: 'payroll', label: '代发工资业务覆盖率', aliases: ['代发工资业务覆盖率', '代发工资业务渗透率', '代发覆盖率'], kind: 'rate', target: 0.5 },
  { id: 'stateBusiness', label: '国业覆盖率', aliases: ['国业业务穿透率', '国业业务渗透率', '国业覆盖率'], kind: 'rate', target: 0.45 },
  { id: 'settlement', label: '结算活跃率', aliases: ['对公结算业务', '对公结算业务覆盖率', '对公结算渗透率', '结算活跃率'], kind: 'rate', target: 0.55 },
  { id: 'loan', label: '对公贷款业务', aliases: ['对公贷款业务', '对公贷款业务覆盖率', '对公贷款渗透率'], kind: 'rate', target: 0.4 },
  { id: 'contribution', label: '存款有效率', aliases: ['综合业务备款贡献度', '综合业务备款贡献率', '综合业务存款贡献度', '存款有效率'], kind: 'rate', target: 0.45 },
  { id: 'interest', label: '综合付息率', aliases: ['综合付息率'], kind: 'inverseRate', target: 0.018 },
  { id: 'keyCustomers', label: '重点客群数', aliases: ['重点客群数', '重点客群', '重点客群客户数', '客户数', '客户编号', '计数项:客户编号'], kind: 'count', target: 50 },
  { id: 'loanCustomers', label: '贷款户数量', aliases: ['贷款户数量', '贷款户数', '重点客群贷款余额>0户数', '贷款余额>0户数'], kind: 'count', target: 50 },
  { id: 'loanDepositRatio', label: '存贷比', aliases: ['存贷比', '重点客群贷款户存款年日均余额/重点客群贷款余额×100%'], kind: 'ratio', target: 1 },
];

const internalMetricDefinitions = [
  { id: '_coverageCount', aliases: ['综合业务覆盖', '综合覆盖户数', '综合业务覆盖户数', '综合业务覆盖客户数', '求和项:综合业务覆盖'], kind: 'count' },
  { id: '_billCount', aliases: ['电票结算覆盖', '电票覆盖', '电票户数', '电票结算户数', '电票覆盖户数', '电票结算覆盖户数', '电票覆盖客户数'], kind: 'count' },
  { id: '_acquiringCount', aliases: ['收单结算覆盖', '收单覆盖', '收单户数', '收单结算户数', '收单覆盖户数', '收单结算覆盖户数', '收单覆盖客户数'], kind: 'count' },
  { id: '_payrollCount', aliases: ['代发覆盖', '代发户数', '代发覆盖户数', '代发工资户数', '代发工资覆盖户数', '代发覆盖客户数'], kind: 'count' },
  { id: '_stateBusinessCount', aliases: ['国业覆盖', '国业户数', '国业覆盖户数', '国业覆盖客户数'], kind: 'count' },
  { id: '_settlementCount', aliases: ['结算活跃', '结算活跃户数', '结算活跃客户数', '对公结算业务', '对公结算业务户数'], kind: 'count' },
  { id: '_depositCount', aliases: ['存款有效', '存款有效户数', '存款有效客户数', '对公存款覆盖', '对公存款覆盖户数'], kind: 'count' },
  { id: '_highPenetrationCount', aliases: ['高渗透覆盖', '高渗透户数', '高渗透客户数', '高渗透客户户数', '高渗透客户数量', '高渗透覆盖户数', '高渗透覆盖客户数', '求和项:高渗透覆盖'], kind: 'count' },
];

const allMetricDefinitions = [...metricDefinitions, ...internalMetricDefinitions];
const heatmapMetricGroups = {
  core: ['coverage', 'highPenetration', 'bill', 'acquiring', 'payroll', 'stateBusiness'],
  contribution: ['settlement', 'contribution', 'loanCustomers', 'loanDepositRatio'],
};
const rankingMetricCountMap = {
  coverage: { metricId: '_coverageCount', label: '综合覆盖户数' },
  bill: { metricId: '_billCount', label: '电票覆盖户数' },
  acquiring: { metricId: '_acquiringCount', label: '收单覆盖户数' },
  payroll: { metricId: '_payrollCount', label: '代发覆盖户数' },
  stateBusiness: { metricId: '_stateBusinessCount', label: '国业覆盖户数' },
  highPenetration: { metricId: '_highPenetrationCount', label: '高渗透户数' },
  settlement: { metricId: '_settlementCount', label: '结算活跃户数' },
  loan: { metricId: 'loanCustomers', label: '贷款户数' },
  contribution: { metricId: '_depositCount', label: '存款有效户数' },
  loanDepositRatio: { metricId: 'loanCustomers', label: '存贷比贷款户数' },
};
const institutionLowShareMetricIds = new Set(['acquiring', 'stateBusiness']);
const SUBSIDY_MAX_FILE_SIZE = 10 * 1024 * 1024;
const subsidyAllowedExtensions = ['png', 'jpg', 'pdf'];
const subsidyRequiredDocuments = [
  { key: 'businessLicense', label: '营业执照', baseName: '营业执照', required: true },
  { key: 'accountPermit', label: '开户许可证', baseName: '开户许可证', required: true },
  { key: 'loanContract', label: '贷款合同', baseName: '贷款合同', required: true },
  { key: 'loanVoucher', label: '放款凭证', baseName: '放款凭证', required: true },
  { key: 'repaymentVoucher', label: '还款凭证', baseName: '还款凭证', required: false },
  { key: 'taxReturn', label: '纳税申报表', baseName: '纳税申报表', required: true },
  { key: 'loanUse', label: '贷款用途', baseName: '贷款用途', required: true },
  { key: 'subsidyAgreement', label: '贴息补充协议', baseName: '服务业经营主体贷款财政贴息服务协议', required: true },
];
const subsidyReportHeader = [
  '借据编号',
  '审核状态',
  '必备材料齐全',
  '文件格式合规',
  '文件大小合规',
  ...subsidyRequiredDocuments.map((item) => item.label),
  '缺失材料',
  '需人工确认',
  '命名或格式问题',
  '超限文件',
  '其他文件',
  '文件夹路径',
];

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.classList.toggle('is-error', type === 'error');
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
}

function syncStaticLabels() {
  const coreScopeOption = heatmapMetricScopeSelect?.querySelector('option[value="core"]');
  if (coreScopeOption) coreScopeOption.textContent = '综合业务';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMeters(value) {
  if (value == null || Number.isNaN(Number(value))) return '0m';
  const meters = Number(value);
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)}km`;
  return `${Math.round(meters)}m`;
}

function getAmapKey() {
  return amapKeyInput.value.trim();
}

function requireAmapKey() {
  const key = getAmapKey();
  if (!key) {
    amapKeyInput.focus();
    throw new Error('请先输入高德 Key');
  }
  return key;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  if (rows[0]?.[0]) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '');
  return trimTrailingEmptyHeaderColumns(rows.filter((item) => item.some((cell) => String(cell || '').trim())));
}

function trimTrailingEmptyHeaderColumns(rows) {
  if (!rows.length) return rows;
  const header = rows[0];
  while (header.length > 0 && String(header[header.length - 1] || '').trim() === '') {
    const lastIndex = header.length - 1;
    const allTrailingCellsEmpty = rows.every((row) => row.length <= lastIndex
      || String(row[lastIndex] || '').trim() === '');
    if (!allTrailingCellsEmpty) break;
    for (const row of rows) row.splice(lastIndex, 1);
  }
  return rows;
}

function csvField(value) {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function serializeCsv(rows) {
  return `${rows.map((row) => row.map(csvField).join(',')).join('\r\n')}\r\n`;
}

function decodeZipFileName(bytes, useUtf8) {
  if (!bytes.length) return '';
  const decoders = useUtf8 ? ['utf-8', 'gb18030'] : ['utf-8', 'gb18030'];
  let fallback = '';
  for (const encoding of decoders) {
    try {
      const decoded = new TextDecoder(encoding).decode(bytes);
      if (!decoded.includes('\uFFFD')) return decoded;
      fallback ||= decoded;
    } catch {
      // Try the next decoder; older browsers may not support gb18030.
    }
  }
  return fallback || Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
}

function parseZipCentralDirectory(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  const minEocdOffset = Math.max(0, bytes.length - 22 - 65535);
  let eocdOffset = -1;
  for (let index = bytes.length - 22; index >= minEocdOffset; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      eocdOffset = index;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('无法读取 ZIP 目录，请确认文件未损坏');

  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const entries = [];
  let offset = centralDirectoryOffset;
  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('ZIP 目录结构异常');
    const flags = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const nameStart = offset + 46;
    const nameBytes = bytes.slice(nameStart, nameStart + fileNameLength);
    const rawName = decodeZipFileName(nameBytes, Boolean(flags & 0x0800));
    const name = rawName.replace(/\\/g, '/').replace(/^\/+/, '');
    if (name) {
      entries.push({
        name,
        compressedSize,
        uncompressedSize,
        isDirectory: name.endsWith('/'),
      });
    }
    offset = nameStart + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

function isIgnoredZipEntry(entryName) {
  return entryName
    .split('/')
    .some((part) => !part || part === '__MACOSX' || part === '.DS_Store' || part.startsWith('._'));
}

function stripZipWrapper(entries) {
  const files = entries.filter((entry) => !entry.isDirectory && !isIgnoredZipEntry(entry.name));
  const roots = [...new Set(files.map((entry) => entry.name.split('/')[0]))];
  if (roots.length !== 1) return files;

  const root = roots[0];
  const expectedNames = new Set(subsidyRequiredDocuments.map((item) => item.baseName));
  const directExpectedFile = files.some((entry) => {
    const parts = entry.name.split('/');
    if (parts.length !== 2) return false;
    const { baseName } = splitFileName(parts[1]);
    return expectedNames.has(baseName);
  });
  if (directExpectedFile) return files;

  return files.map((entry) => ({
    ...entry,
    name: entry.name.startsWith(`${root}/`) ? entry.name.slice(root.length + 1) : entry.name,
  }));
}

function splitFileName(fileName) {
  const index = fileName.lastIndexOf('.');
  if (index <= 0) return { baseName: fileName, extension: '' };
  return {
    baseName: fileName.slice(0, index),
    extension: fileName.slice(index + 1).toLowerCase(),
  };
}

function formatFileSize(bytes) {
  const number = Number(bytes || 0);
  if (number >= 1024 * 1024) return `${(number / 1024 / 1024).toFixed(1)}MB`;
  if (number >= 1024) return `${Math.round(number / 1024)}KB`;
  return `${number}B`;
}

function auditSubsidyGroup(loanNumber, files) {
  const directFiles = [];
  const nestedFiles = [];
  for (const file of files) {
    const parts = file.name.split('/');
    if (parts.length === 2) directFiles.push({ ...file, fileName: parts[1] });
    else nestedFiles.push(file.name);
  }

  const missing = [];
  const manualChecks = [];
  const namingIssues = nestedFiles.map((name) => `材料不在借据编号文件夹第一层：${name}`);
  const sizeIssues = [];
  const otherFiles = [];
  const documentCells = {};
  let requiredComplete = true;
  let formatOk = true;
  let sizeOk = true;

  for (const documentRule of subsidyRequiredDocuments) {
    const candidates = directFiles.filter((file) => splitFileName(file.fileName).baseName === documentRule.baseName);
    const validExtensionCandidates = candidates.filter((file) => subsidyAllowedExtensions.includes(splitFileName(file.fileName).extension));
    const oversizedCandidates = validExtensionCandidates.filter((file) => file.uncompressedSize > SUBSIDY_MAX_FILE_SIZE);
    let cellValue = '缺失';

    if (validExtensionCandidates.length > 0) {
      cellValue = validExtensionCandidates.map((file) => file.fileName).join('；');
      if (validExtensionCandidates.length > 1) {
        namingIssues.push(`${documentRule.label}重复提交 ${validExtensionCandidates.length} 份`);
        formatOk = false;
      }
      if (oversizedCandidates.length > 0) {
        sizeOk = false;
        for (const file of oversizedCandidates) {
          sizeIssues.push(`${file.fileName} ${formatFileSize(file.uncompressedSize)}`);
        }
      }
    } else if (candidates.length > 0) {
      cellValue = `格式错误：${candidates.map((file) => file.fileName).join('；')}`;
      namingIssues.push(`${documentRule.label}格式错误：${candidates.map((file) => file.fileName).join('、')}`);
      formatOk = false;
    } else if (documentRule.required) {
      missing.push(documentRule.label);
      requiredComplete = false;
    } else {
      manualChecks.push(`${documentRule.label}缺失，请确认是否未还款`);
    }

    if (documentRule.required && !validExtensionCandidates.length) requiredComplete = false;
    documentCells[documentRule.label] = cellValue;
  }

  const expectedBaseNames = new Set(subsidyRequiredDocuments.map((item) => item.baseName));
  for (const file of directFiles) {
    const { baseName, extension } = splitFileName(file.fileName);
    if (expectedBaseNames.has(baseName)) continue;
    otherFiles.push(file.fileName);
    if (!subsidyAllowedExtensions.includes(extension)) {
      namingIssues.push(`其他文件格式不符合要求：${file.fileName}`);
      formatOk = false;
    }
    if (file.uncompressedSize > SUBSIDY_MAX_FILE_SIZE) {
      sizeIssues.push(`${file.fileName} ${formatFileSize(file.uncompressedSize)}`);
      sizeOk = false;
    }
  }

  let status = '通过';
  if (!requiredComplete || !formatOk || !sizeOk) status = '不通过';
  else if (manualChecks.length) status = '待确认';

  return {
    loanNumber,
    status,
    requiredComplete,
    formatOk,
    sizeOk,
    documentCells,
    missing,
    manualChecks,
    namingIssues,
    sizeIssues,
    otherFiles,
    folderPath: loanNumber,
  };
}

function analyzeSubsidyZipEntries(entries) {
  const files = stripZipWrapper(entries);
  if (!files.length) throw new Error('ZIP 内没有可审核的文件');

  const groups = new Map();
  const rootFiles = [];
  for (const file of files) {
    const parts = file.name.split('/').filter(Boolean);
    if (parts.length < 2) {
      rootFiles.push(file.name);
      continue;
    }
    const loanNumber = parts[0].trim();
    if (!loanNumber) {
      rootFiles.push(file.name);
      continue;
    }
    const group = groups.get(loanNumber) || [];
    group.push({ ...file, name: parts.join('/') });
    groups.set(loanNumber, group);
  }

  const rows = [...groups.entries()]
    .map(([loanNumber, groupFiles]) => auditSubsidyGroup(loanNumber, groupFiles))
    .sort((a, b) => a.loanNumber.localeCompare(b.loanNumber, 'zh-CN'));

  if (!rows.length) throw new Error('未识别到以借据编号命名的材料文件夹');
  const rootIssues = rootFiles.map((name) => `未放入借据编号文件夹：${name}`);
  const stats = {
    total: rows.length,
    passed: rows.filter((row) => row.status === '通过').length,
    pending: rows.filter((row) => row.status === '待确认').length,
    failed: rows.filter((row) => row.status === '不通过').length,
    rootIssues,
  };
  return { rows, stats };
}

async function auditSubsidyZip(file) {
  if (!file) throw new Error('请选择机构报送 ZIP');
  if (!/\.zip$/i.test(file.name)) throw new Error('仅支持 ZIP 压缩包');
  const entries = parseZipCentralDirectory(await file.arrayBuffer());
  return analyzeSubsidyZipEntries(entries);
}

function subsidyRowToCsvRow(row) {
  return [
    row.loanNumber,
    row.status,
    row.requiredComplete ? '是' : '否',
    row.formatOk ? '是' : '否',
    row.sizeOk ? '是' : '否',
    ...subsidyRequiredDocuments.map((item) => row.documentCells[item.label] || ''),
    row.missing.join('；'),
    row.manualChecks.join('；'),
    row.namingIssues.join('；'),
    row.sizeIssues.join('；'),
    row.otherFiles.join('；'),
    row.folderPath,
  ];
}

function subsidyAnalysisToCsv(analysis) {
  return serializeCsv([subsidyReportHeader, ...analysis.rows.map(subsidyRowToCsvRow)]);
}

function renderSubsidyMetrics(stats = {}) {
  const values = [
    [stats.total || 0, '借据文件夹'],
    [stats.passed || 0, '通过'],
    [stats.pending || 0, '待确认'],
    [stats.failed || 0, '不通过'],
  ];
  subsidyMetrics.innerHTML = values
    .map(([value, label]) => `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`)
    .join('');
}

function renderSubsidyAnalysis(analysis) {
  renderSubsidyMetrics(analysis.stats);
  subsidyHint.textContent = `已生成 ${analysis.rows.length} 条电子台账记录`;
  subsidySummary.innerHTML = analysis.stats.rootIssues.length
    ? `<div class="audit-alert">${escapeHtml(analysis.stats.rootIssues.join('；'))}</div>`
    : '';

  const previewRows = analysis.rows.slice(0, 80);
  const statusClass = {
    通过: 'is-pass',
    待确认: 'is-pending',
    不通过: 'is-fail',
  };
  const bodyHtml = previewRows.map((row) => {
    const csvRow = subsidyRowToCsvRow(row);
    return `<tr>${csvRow.map((cell, index) => {
      const className = index === 1 ? ` class="audit-status ${statusClass[row.status] || ''}"` : '';
      return `<td${className} title="${escapeHtml(cell)}">${escapeHtml(cell || '-')}</td>`;
    }).join('')}</tr>`;
  }).join('');
  subsidyTable.innerHTML = `
    <thead><tr>${subsidyReportHeader.map((name) => `<th>${escapeHtml(name)}</th>`).join('')}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  `;
}

function resetSubsidyView() {
  renderSubsidyMetrics();
  subsidyHint.textContent = '等待上传 ZIP';
  subsidySummary.innerHTML = '';
  subsidyTable.innerHTML = '';
  subsidySource.textContent = '未载入资料';
  subsidyDownloadLink.classList.add('is-disabled');
}

function getColumn(header, names, fallbackIndex = -1) {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const index = header.indexOf(name);
    if (index !== -1) return index;
  }
  if (fallbackIndex >= 0 && fallbackIndex < header.length) return fallbackIndex;
  throw new Error(`缺少列：${list.join(' / ')}`);
}

function ensureColumn(header, name, preferredAfterIndex) {
  const existing = header.indexOf(name);
  if (existing !== -1) return existing;
  let index = preferredAfterIndex + 1;
  if ((header[index] || '').trim() !== '') index = header.length;
  header[index] = name;
  return index;
}

function isExcelFile(fileName) {
  return /\.(xls|xlsx)$/i.test(fileName);
}

function isCsvFile(fileName, fileType) {
  return /\.csv$/i.test(fileName) || fileType === 'text/csv';
}

async function readSelectedTableFile(input) {
  const file = input.files?.[0];
  if (!file) return '';
  if (isCsvFile(file.name, file.type)) return file.text();
  if (!isExcelFile(file.name)) throw new Error('仅支持 CSV、XLS、XLSX 文件');
  if (!window.XLSX) throw new Error('Excel 解析组件加载失败，请刷新页面后重试');
  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error('Excel 文件没有可读取的工作表');
  const sheet = workbook.Sheets[firstSheetName];
  return window.XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
}

async function readSelectedWorkbookTables(input) {
  const file = input.files?.[0];
  if (!file) return [];
  if (isCsvFile(file.name, file.type)) {
    return [{ csvText: await file.text(), sheetName: '', fileName: file.name }];
  }
  if (!isExcelFile(file.name)) throw new Error('仅支持 CSV、XLS、XLSX 文件');
  if (!window.XLSX) throw new Error('Excel 解析组件加载失败，请刷新页面后重试');
  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
  if (!workbook.SheetNames.length) throw new Error('Excel 文件没有可读取的工作表');
  return workbook.SheetNames.map((sheetName) => ({
    csvText: window.XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { blankrows: false }),
    sheetName,
    fileName: file.name,
  })).filter((item) => item.csvText.trim());
}

function jsonp(path, params, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const callback = `__amap_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('高德接口超时'));
    }, timeoutMs);

    function cleanup() {
      window.clearTimeout(timer);
      delete window[callback];
      script.remove();
    }

    window[callback] = (payload) => {
      cleanup();
      resolve(payload);
    };

    const query = new URLSearchParams({ ...params, output: 'json', callback });
    script.src = `${amapJsonpBase}/${path}?${query.toString()}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('高德接口加载失败'));
    };
    document.head.append(script);
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function parseLocation(location) {
  if (!location || typeof location !== 'string') return null;
  const [lngText, latText] = location.split(',');
  const lng = Number(lngText);
  const lat = Number(latText);
  return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()).filter(Boolean))];
}

function addressVariants(address) {
  const cleanBase = String(address || '')
    .replace(/^\uFEFF/, '')
    .replace(/中国\(四川\)自由贸易试验区/g, '')
    .replace(/中国（四川）自由贸易试验区/g, '')
    .replace(/\s+/g, '')
    .trim();
  const noParen = cleanBase.replace(/（[^）]*）|\([^)]*\)/g, '');
  const firstComma = noParen.split(/[，,；;]/)[0];
  const firstEnumeration = noParen.split('、')[0];
  const firstCommaEnumeration = firstComma.split('、')[0];
  const roadNumberMatch = noParen.match(/^(.+?(?:大道|大街|路|街|巷|道|段)[^,，；;、]*?\d+(?:-\d+)?号)/);
  const commaRoadNumberMatch = firstComma.match(/^(.+?(?:大道|大街|路|街|巷|道|段)[^,，；;、]*?\d+(?:-\d+)?号)/);
  return unique([
    cleanBase,
    noParen,
    firstComma,
    firstEnumeration,
    firstCommaEnumeration,
    roadNumberMatch?.[1] || '',
    commaRoadNumberMatch?.[1] || '',
  ]);
}

function normalizeAddress(address) {
  return String(address || '')
    .replace(/中国|四川省|成都市|成都/g, '')
    .replace(/[()（）\s,，、。.;；:："'“”‘’\-—_]/g, '')
    .replace(/自主申报/g, '');
}

function levelScore(level) {
  const scores = {
    门牌号: 120,
    门址: 115,
    兴趣点: 105,
    单元号: 100,
    楼号: 98,
    道路: 75,
    交叉路口: 70,
    乡镇: 45,
    区县: 35,
    市: 20,
    省: 10,
  };
  return scores[level] ?? 60;
}

function commonPrefixLength(a, b) {
  const limit = Math.min(a.length, b.length);
  let i = 0;
  while (i < limit && a[i] === b[i]) i += 1;
  return i;
}

function expectedDistricts(address) {
  const text = String(address || '');
  const directDistricts = [
    '锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区',
    '新都区', '温江区', '双流区', '郫都区', '新津区', '都江堰市', '彭州市',
    '邛崃市', '崇州市', '简阳市', '金堂县', '大邑县', '蒲江县',
  ];
  const direct = directDistricts.find((district) => text.includes(district));
  if (direct) return [direct];
  if (text.includes('简城镇') || text.includes('简城街道')) return ['简阳市'];
  if (text.includes('龙泉镇') || text.includes('成都经济技术开发区')) return ['龙泉驿区'];
  if (text.includes('天府新区')) return ['双流区'];
  if (text.includes('高新区')) return ['武侯区', '双流区', '郫都区', '金牛区', '温江区'];
  return [];
}

function isDistrictCompatible(candidateDistrict, allowedDistricts) {
  if (allowedDistricts.length === 0) return true;
  return allowedDistricts.includes(String(candidateDistrict || ''));
}

function selectBestGeocode(address, geocodes) {
  const normalizedInput = normalizeAddress(address);
  const allowedDistricts = expectedDistricts(address);
  const hasCompatibleCandidate = allowedDistricts.length === 0
    || geocodes.some((candidate) => parseLocation(candidate?.location)
      && isDistrictCompatible(candidate.district, allowedDistricts));
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  geocodes.forEach((candidate, index) => {
    const location = parseLocation(candidate?.location);
    if (!location) return;

    const formatted = normalizeAddress(candidate.formatted_address);
    const street = normalizeAddress(candidate.street);
    const number = normalizeAddress(candidate.number);
    const district = normalizeAddress(candidate.district);
    const neighborhood = normalizeAddress(candidate.neighborhood?.name);
    const building = normalizeAddress(candidate.building?.name);
    const districtCompatible = isDistrictCompatible(candidate.district, allowedDistricts);

    if (hasCompatibleCandidate && !districtCompatible) return;

    let score = levelScore(candidate.level);
    if (districtCompatible && allowedDistricts.length > 0) score += 80;
    if (district && normalizedInput.includes(district)) score += 18;
    if (street && normalizedInput.includes(street)) score += 35;
    if (number && normalizedInput.includes(number)) score += 45;
    if (neighborhood && normalizedInput.includes(neighborhood)) score += 20;
    if (building && normalizedInput.includes(building)) score += 20;
    if (formatted && normalizedInput.includes(formatted)) score += 20;
    if (formatted && formatted.includes(normalizedInput.slice(0, Math.min(12, normalizedInput.length)))) score += 10;
    score += Math.min(25, commonPrefixLength(normalizedInput, formatted));
    score -= index * 2;

    if (score > bestScore) {
      bestScore = score;
      best = {
        ok: true,
        lng: location.lng,
        lat: location.lat,
        formattedAddress: candidate.formatted_address || '',
        level: candidate.level || '',
        district: candidate.district || '',
        score,
      };
    }
  });

  return best;
}

async function geocodeQuery(key, address, queryAddress) {
  let lastError = '';
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const payload = await jsonp('geocode/geo', {
      key,
      address: queryAddress,
      city: CITY,
    });

    if (payload.status === '1') {
      const selected = selectBestGeocode(address, Array.isArray(payload.geocodes) ? payload.geocodes : []);
      if (selected) return { ...selected, queryAddress, geocodeMethod: 'geocode' };
      return { ok: false, error: payload.info || 'NO_GEOCODE_RESULT' };
    }

    lastError = `${payload.info || 'AMAP_ERROR'} (${payload.infocode || 'no infocode'})`;
    if (/INVALID_USER_KEY|USERKEY_PLAT_NOMATCH|INSUFFICIENT_PRIVILEGES/.test(lastError)) {
      throw new Error(lastError);
    }
    const isQpsLimit = /CUQPS_HAS_EXCEEDED_THE_LIMIT|QPS/.test(lastError);
    const isTransient = isQpsLimit || /ENGINE_RESPONSE_DATA_ERROR|UNKNOWN_ERROR|REQUEST_FAILED/.test(lastError);
    if (!isTransient && attempt >= 2) break;
    await sleep((isQpsLimit ? 1800 : 500) * (attempt + 1));
  }

  return { ok: false, error: lastError || 'REQUEST_FAILED' };
}

async function placeSearch(key, address, queryAddress) {
  const payload = await jsonp('place/text', {
    key,
    keywords: queryAddress,
    city: CITY,
    citylimit: 'true',
    offset: '5',
    page: '1',
    extensions: 'base',
  });
  if (payload.status !== '1') return { ok: false, error: payload.info || 'AMAP_POI_ERROR' };

  const poi = Array.isArray(payload.pois) ? payload.pois.find((item) => parseLocation(item.location)) : null;
  const location = parseLocation(poi?.location);
  if (!poi || !location) return { ok: false, error: 'NO_POI_RESULT' };
  return {
    ok: true,
    lng: location.lng,
    lat: location.lat,
    formattedAddress: poi.address || poi.name || '',
    level: 'POI',
    district: poi.adname || '',
    queryAddress,
    geocodeMethod: 'place-text',
  };
}

async function geocodeAddress(key, address) {
  let last = { ok: false, error: 'NO_VARIANTS' };
  for (const queryAddress of addressVariants(address)) {
    last = await geocodeQuery(key, address, queryAddress);
    if (last.ok) return last;
  }
  for (const queryAddress of addressVariants(address)) {
    last = await placeSearch(key, address, queryAddress);
    if (last.ok) return last;
  }
  return last;
}

function shouldRetryForDistrict(address, entry) {
  if (!entry?.ok) return false;
  const allowedDistricts = expectedDistricts(address);
  if (allowedDistricts.length === 0) return false;
  const currentDistrict = entry.district || expectedDistricts(entry.formattedAddress)[0] || '';
  return !isDistrictCompatible(currentDistrict, allowedDistricts);
}

async function geocodeAll(key, addresses, onProgress) {
  const cache = new Map();
  const queue = [...new Set(addresses.filter(Boolean))];
  let completed = 0;

  onProgress?.({ completed, total: queue.length, message: `等待定位 ${queue.length} 个地址` });

  async function worker() {
    while (queue.length > 0) {
      const address = queue.shift();
      if (cache.has(address) && !shouldRetryForDistrict(address, cache.get(address))) continue;
      cache.set(address, await geocodeAddress(key, address));
      completed += 1;
      onProgress?.({ completed, total: queue.length + completed, message: `已定位 ${completed}/${queue.length + completed}` });
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
  return cache;
}

function distanceMeters(a, b) {
  const radius = 6371008.8;
  const toRadians = Math.PI / 180;
  const lat1 = a.lat * toRadians;
  const lat2 = b.lat * toRadians;
  const dLat = (b.lat - a.lat) * toRadians;
  const dLng = (b.lng - a.lng) * toRadians;
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function parseInstitutions(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error('机构列表为空');
  const header = rows[0];
  const addressIndex = getColumn(header, '机构地址');
  const branchIndex = getColumn(header, '网点');
  const institutions = rows.slice(1).map((row) => ({
    address: String(row[addressIndex] || '').trim(),
    branch: String(row[branchIndex] || '').trim(),
  })).filter((row) => row.address);
  if (!institutions.length) throw new Error('机构列表缺少有效机构地址');
  return institutions;
}

async function matchCompanies({ key, companyCsv, institutionCsv, onProgress }) {
  const companyRows = parseCsv(companyCsv);
  if (companyRows.length < 2) throw new Error('企业列表为空');
  const companyHeader = companyRows[0];
  const companyAddressIndex = getColumn(companyHeader, ['注册地址', '企业地址', '公司地址', '地址'], 1);
  const nearestAddressIndex = ensureColumn(companyHeader, '最近机构地址', companyHeader.length - 1);
  const nearestBranchIndex = ensureColumn(companyHeader, '最近机构网点', nearestAddressIndex);
  const nearestDistanceIndex = ensureColumn(companyHeader, '企业到网点直线距离(米)', nearestBranchIndex);
  const institutionsRaw = parseInstitutions(institutionCsv);
  const companyAddresses = companyRows.slice(1).map((row) => String(row[companyAddressIndex] || '').trim()).filter(Boolean);
  const institutionAddresses = institutionsRaw.map((institution) => institution.address);
  const cache = await geocodeAll(key, [...companyAddresses, ...institutionAddresses], onProgress);
  const institutions = institutionsRaw.map((institution) => {
    const geo = cache.get(institution.address);
    return geo?.ok ? { ...institution, ...geo } : null;
  }).filter(Boolean);
  if (!institutions.length) throw new Error('机构地址全部定位失败');

  let matched = 0;
  let unmatched = 0;
  let sumDistance = 0;
  let maxDistance = 0;
  for (const row of companyRows.slice(1)) {
    while (row.length <= nearestDistanceIndex) row.push('');
    const address = String(row[companyAddressIndex] || '').trim();
    const geo = cache.get(address);
    if (!address || !geo?.ok) {
      row[nearestAddressIndex] = '';
      row[nearestBranchIndex] = '';
      row[nearestDistanceIndex] = '';
      unmatched += 1;
      continue;
    }
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const institution of institutions) {
      const distance = distanceMeters(geo, institution);
      if (distance < nearestDistance) {
        nearest = institution;
        nearestDistance = distance;
      }
    }
    const rounded = Math.round(nearestDistance);
    row[nearestAddressIndex] = nearest?.address || '';
    row[nearestBranchIndex] = nearest?.branch || '';
    row[nearestDistanceIndex] = Number.isFinite(rounded) ? String(rounded) : '';
    matched += 1;
    sumDistance += rounded;
    maxDistance = Math.max(maxDistance, rounded);
  }
  return {
    csv: serializeCsv(companyRows),
    stats: {
      companyRows: companyRows.length - 1,
      institutionRows: institutionsRaw.length,
      matched,
      unmatched,
      averageDistanceMeters: matched ? Math.round(sumDistance / matched) : null,
      maxDistanceMeters: matched ? maxDistance : null,
    },
  };
}

async function queryNearest({ key, address, institutionCsv }) {
  const institutionsRaw = parseInstitutions(institutionCsv);
  const cache = await geocodeAll(key, [address, ...institutionsRaw.map((item) => item.address)]);
  const companyGeo = cache.get(address);
  if (!companyGeo?.ok) throw new Error(`企业地址定位失败：${companyGeo?.error || 'NO_GEOCODE_RESULT'}`);
  let nearest = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const institution of institutionsRaw) {
    const geo = cache.get(institution.address);
    if (!geo?.ok) continue;
    const distance = distanceMeters(companyGeo, geo);
    if (distance < nearestDistance) {
      nearest = { ...institution, geo };
      nearestDistance = distance;
    }
  }
  if (!nearest) throw new Error('机构地址全部定位失败');
  return { companyGeo, nearest, distanceMeters: Math.round(nearestDistance) };
}

function setProgress(progress) {
  const total = Number(progress?.total || 0);
  const completed = Number(progress?.completed || 0);
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  progressFill.style.width = `${percent}%`;
  batchProgress.textContent = progress?.message || '处理中';
}

function setMetrics(stats = {}) {
  const values = [
    [stats.companyRows || 0, '企业行'],
    [stats.matched || 0, '已匹配'],
    [formatMeters(stats.averageDistanceMeters), '平均距离'],
    [formatMeters(stats.maxDistanceMeters), '最远距离'],
  ];
  batchMetrics.innerHTML = values
    .map(([value, label]) => `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`)
    .join('');
}

function resetResolvedView() {
  resolvedMetrics.innerHTML = [
    ['0', '企业行'],
    ['0', '覆盖网点'],
    ['-', '最多网点'],
    ['0m', '平均距离'],
  ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
  topList.innerHTML = '<div class="empty-state">暂无数据</div>';
  rankingBody.innerHTML = '<tr><td colspan="5">暂无数据</td></tr>';
  previewTable.innerHTML = '';
}

function analyzeResolvedCsv(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error('文件没有数据行');
  const header = rows[0];
  const branchIndex = header.indexOf('最近机构网点');
  const distanceIndex = header.indexOf('企业到网点直线距离(米)');
  if (branchIndex === -1) throw new Error('文件缺少 最近机构网点 列');

  const groups = new Map();
  let distanceCount = 0;
  let distanceSum = 0;
  for (const row of rows.slice(1)) {
    const branch = String(row[branchIndex] || '').trim() || '未匹配';
    const distance = distanceIndex >= 0 ? Number(row[distanceIndex]) : NaN;
    const group = groups.get(branch) || { branch, count: 0, distanceSum: 0, distanceCount: 0 };
    group.count += 1;
    if (Number.isFinite(distance)) {
      group.distanceSum += distance;
      group.distanceCount += 1;
      distanceSum += distance;
      distanceCount += 1;
    }
    groups.set(branch, group);
  }

  const ranking = [...groups.values()].map((group) => ({
    ...group,
    averageDistance: group.distanceCount ? Math.round(group.distanceSum / group.distanceCount) : null,
  })).sort((a, b) => b.count - a.count || a.branch.localeCompare(b.branch, 'zh-CN'));

  return { rows, header, dataRows: rows.slice(1), total: rows.length - 1, ranking, averageDistance: distanceCount ? Math.round(distanceSum / distanceCount) : null };
}

function renderResolvedAnalysis(analysis) {
  const topBranch = analysis.ranking[0];
  resolvedMetrics.innerHTML = [
    [analysis.total, '企业行'],
    [analysis.ranking.length, '覆盖网点'],
    [topBranch ? `${topBranch.branch} ${topBranch.count}` : '-', '最多网点'],
    [formatMeters(analysis.averageDistance), '平均距离'],
  ].map(([value, label]) => `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`).join('');

  const maxCount = topBranch?.count || 1;
  topList.innerHTML = analysis.ranking.slice(0, 10).map((item) => {
    const width = Math.max(4, Math.round((item.count / maxCount) * 100));
    return `
      <div class="bar-row">
        <div class="bar-name" title="${escapeHtml(item.branch)}">${escapeHtml(item.branch)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        <div class="bar-count">${item.count}</div>
      </div>
    `;
  }).join('') || '<div class="empty-state">暂无数据</div>';

  rankingBody.innerHTML = analysis.ranking.map((item, index) => {
    const percent = analysis.total ? `${((item.count / analysis.total) * 100).toFixed(1)}%` : '0%';
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.branch)}</td>
        <td>${item.count}</td>
        <td>${percent}</td>
        <td>${formatMeters(item.averageDistance)}</td>
      </tr>
    `;
  }).join('');

  const previewColumns = analysis.header.slice(0, 8);
  const headerHtml = previewColumns.map((name) => `<th>${escapeHtml(name)}</th>`).join('');
  const bodyHtml = analysis.dataRows.slice(0, 20).map((row) => (
    `<tr>${previewColumns.map((_, index) => `<td title="${escapeHtml(row[index] || '')}">${escapeHtml(row[index] || '')}</td>`).join('')}</tr>`
  )).join('');
  previewTable.innerHTML = `<thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody>`;
}

function setMode(mode) {
  const isDashboard = mode === 'dashboard';
  const isSubsidy = mode === 'subsidy';
  matcherView.classList.toggle('is-active', !isDashboard && !isSubsidy);
  dashboardView.classList.toggle('is-active', isDashboard);
  subsidyView.classList.toggle('is-active', isSubsidy);
  modeButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === mode);
  });
}

function normalizeHeaderName(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function findHeaderIndex(header, names) {
  const normalized = header.map(normalizeHeaderName);
  for (const name of names) {
    const index = normalized.indexOf(normalizeHeaderName(name));
    if (index !== -1) return index;
  }
  return -1;
}

function headerMatchesAny(value, names) {
  const normalized = normalizeHeaderName(value);
  return names.some((name) => normalized.includes(normalizeHeaderName(name)));
}

function findExactHeaderColumn(labels, names) {
  const normalized = labels.map(normalizeHeaderName);
  for (const name of names) {
    const index = normalized.indexOf(normalizeHeaderName(name));
    if (index !== -1) return index;
  }
  return -1;
}

function findLooseHeaderColumn(labels, names) {
  return labels.findIndex((label) => headerMatchesAny(label, names));
}

function regionMapFromCsv(csvText) {
  const rows = parseCsv(csvText).filter((row) => row.some((cell) => String(cell || '').trim()));
  if (rows.length < 2) return new Map();
  const { rowIndex: headerRowIndex, index: institutionIndex } = detectDashboardHeader(rows);
  if (institutionIndex === -1) return new Map();
  const headerRows = rows.slice(0, headerRowIndex + 1);
  const columnCount = maxColumnCount(rows);
  const labels = Array.from({ length: columnCount }, (_, index) => dashboardColumnLabel(headerRows, index));
  const regionIndex = findLooseHeaderColumn(labels, ['区域类型', '区域', '地区']);
  if (regionIndex === -1) return new Map();

  const regionMap = new Map();
  let activeRegion = '';
  for (const row of rows.slice(headerRowIndex + 1)) {
    const region = String(row[regionIndex] || '').trim();
    if (region) activeRegion = region;
    const institution = String(row[institutionIndex] || '').trim();
    if (!institution || !activeRegion || isAggregateInstitution(institution)) continue;
    regionMap.set(institution, activeRegion);
  }
  return regionMap;
}

function isFormulaHeaderCell(value) {
  const text = String(value || '').trim();
  return Boolean(text && (
    /[×*/=<>≥≤＞＜]/.test(text)
    || /客户数\/重点客群总数/.test(text)
    || /覆盖客户数/.test(text)
    || text.length > 18
  ));
}

function dashboardColumnLabel(headerRows, columnIndex) {
  for (let rowIndex = headerRows.length - 1; rowIndex >= 0; rowIndex -= 1) {
    const value = String(headerRows[rowIndex]?.[columnIndex] || '').trim();
    if (value && !isFormulaHeaderCell(value)) return value;
  }
  return headerRows
    .map((row) => String(row[columnIndex] || '').trim())
    .filter(Boolean)
    .join(' ');
}

function hasNumericCell(row, ignoredIndexes = []) {
  return row.some((cell, index) => !ignoredIndexes.includes(index) && /\d/.test(String(cell || '')));
}

function isAggregateInstitution(value) {
  return /^(总计|合计|小计)$/i.test(String(value || '').trim());
}

function detectDashboardHeader(rows) {
  const maxHeaderRows = Math.min(rows.length, 8);
  for (let rowIndex = 0; rowIndex < maxHeaderRows; rowIndex += 1) {
    const index = findHeaderIndex(rows[rowIndex], ['机构', '机构名称', '网点', '支行']);
    if (index !== -1) return { rowIndex, index };
  }
  return { rowIndex: 0, index: -1 };
}

function detectDashboardDataStart(rows, institutionIndex, headerRowIndex) {
  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const institution = String(rows[rowIndex]?.[institutionIndex] || '').trim();
    if (institution && !isAggregateInstitution(institution) && hasNumericCell(rows[rowIndex], [institutionIndex])) {
      return rowIndex;
    }
  }
  return headerRowIndex + 1;
}

function maxColumnCount(rows) {
  return rows.reduce((max, row) => Math.max(max, row.length), 0);
}

function scoreMetricHeader(label, metric) {
  const text = normalizeHeaderName(label);
  let score = 0;
  if (metric.kind === 'count') {
    if (/(客户数|户数|数量|计数项)/.test(text)) score += 40;
  } else if (/(率|占比|存贷比|付息率)/.test(text)) {
    score += 40;
  }
  if (metric.aliases.some((alias) => text === normalizeHeaderName(alias))) score += 10;
  if (metric.kind !== 'count' && !/(率|占比|存贷比|付息率)/.test(text)) score -= 20;
  return score;
}

function detectMetricColumns(labels, ignoredIndexes = [], defaultWeek = '本周') {
  const bestByMetricPeriod = new Map();
  const currentWeek = currentWeekFromLabels(labels, defaultWeek);
  const periods = detectColumnPeriods(labels, currentWeek);
  labels.forEach((label, index) => {
    if (ignoredIndexes.includes(index)) return;
    allMetricDefinitions
      .filter((item) => headerMatchesAny(label, item.aliases))
      .forEach((metric) => {
        const period = periods[index] || currentWeek;
        const phase = period === '年初' ? 'baseline' : 'current';
        const score = scoreMetricHeader(label, metric);
        if (score <= 0) return;
        const key = `${metric.id}:${period}`;
        const candidate = { metric, index, phase, period, score };
        const previous = bestByMetricPeriod.get(key);
        if (!previous || candidate.score > previous.score) {
          bestByMetricPeriod.set(key, candidate);
        }
      });
  });
  return [...bestByMetricPeriod.values()].map(({ metric, index, phase, period }) => ({
    metric,
    index,
    phase,
    period,
    label: labels[index],
  }));
}

function parsePeriodLabel(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/年初/.test(text)) return { kind: 'baseline', label: '年初' };
  const explicit = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (explicit) {
    const month = Number(explicit[1]);
    const day = Number(explicit[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { kind: 'date', label: `${month}月${day}日`, month };
    }
  }
  const compact = text.match(/(?:^|[^\d])(\d{1,2})(\d{2})(?=\D|$)/);
  if (compact) {
    const month = Number(compact[1]);
    const day = Number(compact[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { kind: 'date', label: `${month}月${day}日`, month };
    }
  }
  const monthOnly = text.match(/(\d{1,2})月/);
  if (monthOnly) {
    const month = Number(monthOnly[1]);
    if (month >= 1 && month <= 12) return { kind: 'month', label: `${month}月`, month };
  }
  return null;
}

function detectColumnPeriods(labels, fallback = '本周') {
  const raw = labels.map(parsePeriodLabel);
  return raw.map((period, index) => {
    if (!period) {
      const inherited = raw.slice(0, index).reverse().find((item) => item?.kind === 'date' || item?.kind === 'baseline');
      return inherited?.label || fallback;
    }
    if (period.kind !== 'month') return period.label;
    const leftExact = raw
      .slice(0, index)
      .reverse()
      .find((item) => item?.kind === 'date' && item.month === period.month);
    const rightExact = raw
      .slice(index + 1)
      .find((item) => item?.kind === 'date' && item.month === period.month);
    return leftExact?.label || rightExact?.label || period.label;
  });
}

function currentWeekFromLabels(labels, fallback = '本周') {
  const periods = labels
    .map(parsePeriodLabel)
    .filter((period) => period && period.kind !== 'baseline');
  const exact = periods.find((period) => period.kind === 'date');
  return exact?.label || periods[0]?.label || fallback;
}

function fallbackCurrentWeekForRow(explicitWeek, detectedPeriod, currentWeek) {
  if (detectedPeriod === '年初') return '年初';
  return explicitWeek || detectedPeriod || currentWeek;
}

function compactDateFromText(text, preferredMonth = null) {
  const matches = [...String(text || '').matchAll(/(?:^|[^\d])(\d{1,2})(\d{2})(?=\D|$)/g)];
  for (const match of matches) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && (preferredMonth == null || month === preferredMonth)) {
      return { label: `${month}月${day}日`, month, day };
    }
  }
  return null;
}

function yearFromText(text) {
  const year = String(text || '').match(/(?:19|20)\d{2}/)?.[0];
  return year ? Number(year) : null;
}

function inferDashboardTableDefaults(table, comparisonYear = null) {
  const sheetName = table.sheetName || '';
  const fileName = table.fileName || '';
  const sheetYear = yearFromText(sheetName);
  if (/年底/.test(sheetName)) {
    return { defaultWeek: '年初', defaultYear: String(comparisonYear || (sheetYear ? sheetYear + 1 : '')) };
  }
  if (/年初/.test(sheetName)) {
    return { defaultWeek: '年初', defaultYear: String(comparisonYear || sheetYear || '') };
  }
  const sheetPeriod = parsePeriodLabel(sheetName);
  if (sheetPeriod?.kind === 'date') {
    return { defaultWeek: sheetPeriod.label, defaultYear: String(sheetYear || comparisonYear || '') };
  }
  if (sheetPeriod?.kind === 'month') {
    const exactDate = compactDateFromText(fileName, sheetPeriod.month);
    return { defaultWeek: exactDate?.label || sheetPeriod.label, defaultYear: String(sheetYear || comparisonYear || '') };
  }
  const fileDate = compactDateFromText(fileName);
  return { defaultWeek: fileDate?.label || '', defaultYear: String(sheetYear || comparisonYear || '') };
}

function parseDashboardNumber(value, metric) {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '-' || raw === '--') return null;
  const isPercent = raw.includes('%');
  const normalized = raw.replace(/,/g, '').replace(/%/g, '').replace(/[^\d.-]/g, '');
  if (!normalized) return null;
  let number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  if (metric.kind === 'ratio') {
    if (isPercent || number > 10) number /= 100;
    return number;
  }
  if (metric.kind !== 'count' && (isPercent || number > 1)) number /= 100;
  return number;
}

function formatDashboardValue(value, metric) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  if (metric.kind === 'count') return `${Math.round(value)}`;
  if (metric.kind === 'ratio') return `${(value * 100).toFixed(1)}%`;
  if (metric.id === 'interest') return `${(value * 100).toFixed(2)}%`;
  return `${(value * 100).toFixed(1)}%`;
}

function formatDelta(value, metric) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  if (metric.kind === 'count') return `${value >= 0 ? '+' : ''}${Math.round(value)}`;
  if (metric.kind === 'ratio') return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
}

function valueForScore(value, metric) {
  if (value == null) return null;
  if (metric.kind === 'inverseRate') return Math.max(0, 1 - (value / Math.max(metric.target * 2, 0.01)));
  if (metric.kind === 'count') return Math.min(1, value / metric.target);
  if (metric.kind === 'ratio') return Math.min(1, value / metric.target);
  return Math.max(0, Math.min(1, value));
}

function niceInstitutionScaleMax(value, metric) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  if (metric.kind === 'count') {
    const step = value <= 50 ? 5 : value <= 200 ? 10 : value <= 1000 ? 50 : 100;
    return Math.max(step, Math.ceil(value / step) * step);
  }
  const percent = value * 100;
  const step = percent <= 50 ? 5 : percent <= 200 ? 10 : 50;
  return Math.max(step, Math.ceil(percent / step) * step) / 100;
}

function formatInstitutionScaleLabel(maxValue, metric) {
  if (metric.kind === 'count') return `0-${Math.round(maxValue)}`;
  return `0-${Math.round(maxValue * 100)}%`;
}

function defaultInstitutionScaleMax(metric, columnMax = 0) {
  if (metric.id === 'loanCustomers') {
    return 200;
  }
  if (metric.id === 'bill') {
    return 0.3;
  }
  if (metric.id === 'payroll') {
    return 0.4;
  }
  if (metric.id === 'loanDepositRatio') {
    return 2;
  }
  if (metric.kind === 'rate' && (institutionLowShareMetricIds.has(metric.id) || columnMax < 0.1)) {
    return 0.1;
  }
  if (metric.kind === 'count') return metric.target || Math.max(1, columnMax);
  return 1;
}

function institutionMetricScale(metric, week = dashboardState.selectedWeek) {
  const columnValues = rowsForWeek(week)
    .map((row) => row.metrics[metric.id])
    .filter((value) => value != null && Number.isFinite(value));
  const columnMax = columnValues.length ? Math.max(...columnValues) : 0;
  const maxValue = niceInstitutionScaleMax(Math.max(defaultInstitutionScaleMax(metric, columnMax), columnMax), metric);
  return {
    maxValue,
    label: formatInstitutionScaleLabel(maxValue, metric),
  };
}

function institutionBarScale(value, metric, scale = null) {
  const metricScale = scale || institutionMetricScale(metric);
  if (value == null || !Number.isFinite(value)) return { score: 0, label: metricScale.label };
  return {
    score: Math.max(0, Math.min(1, value / Math.max(metricScale.maxValue, 0.01))),
    label: metricScale.label,
  };
}

function average(values) {
  const valid = values.filter((value) => value != null && Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function getWeekRank(week) {
  const text = String(week || '');
  const number = text.match(/\d+/g)?.map(Number).pop();
  return Number.isFinite(number) ? number : 0;
}

function inferYear(text, explicitYear = '') {
  const directYear = String(explicitYear || '').match(/(?:19|20)\d{2}/)?.[0];
  if (directYear) return directYear;
  return String(text || '').match(/(?:19|20)\d{2}/)?.[0] || '未标年份';
}

function sortWeeks(weeks) {
  return [...weeks].sort((a, b) => {
    const rank = getWeekRank(a) - getWeekRank(b);
    return rank || String(a).localeCompare(String(b), 'zh-CN');
  });
}

function parseDashboardCsv(csvText, source = '上传文件', options = {}) {
  const rows = parseCsv(csvText).filter((row) => row.some((cell) => String(cell || '').trim()));
  if (rows.length < 2) throw new Error('指标文件没有数据行');
  const { rowIndex: headerRowIndex, index: institutionIndex } = detectDashboardHeader(rows);
  if (institutionIndex === -1) throw new Error('指标文件缺少 机构 列');
  const dataStartIndex = detectDashboardDataStart(rows, institutionIndex, headerRowIndex);
  const headerRows = rows.slice(headerRowIndex, dataStartIndex);
  const columnCount = maxColumnCount(rows);
  const labels = Array.from({ length: columnCount }, (_, index) => dashboardColumnLabel(headerRows, index));
  const yearIndex = findExactHeaderColumn(labels, ['年份', '年', '年度']);
  const weekIndex = findExactHeaderColumn(labels, ['周次', '周', '统计周', '日期']);
  const regionIndex = findLooseHeaderColumn(labels, ['区域类型', '区域', '地区']);
  const currentWeek = currentWeekFromLabels(labels, options.defaultWeek || '本周');
  const metricColumns = detectMetricColumns(
    labels,
    [institutionIndex, yearIndex, weekIndex, regionIndex].filter((index) => index !== -1),
    currentWeek,
  );
  if (!metricColumns.length) throw new Error('指标文件没有可识别的指标列');

  let activeRegion = '';
  const metricLabels = {};
  metricColumns.forEach(({ metric, label, period }) => {
    if (!label) return;
    if (!metricLabels[metric.id] || period !== '年初') metricLabels[metric.id] = label;
  });

  const parsedRows = rows.slice(dataStartIndex).flatMap((row) => {
    if (regionIndex >= 0) {
      const regionValue = String(row[regionIndex] || '').trim();
      if (regionValue) activeRegion = regionValue;
    }
    const institution = String(row[institutionIndex] || '').trim();
    if (!institution || isAggregateInstitution(institution)) return [];
    const region = activeRegion || '未标区域';
    const metricsByWeek = new Map();
    const explicitWeek = weekIndex >= 0 ? String(row[weekIndex] || '').trim() : '';
    for (const { metric, index, period } of metricColumns) {
      const value = parseDashboardNumber(row[index], metric);
      if (value == null) continue;
      const metricWeek = fallbackCurrentWeekForRow(explicitWeek, period, currentWeek);
      const target = metricsByWeek.get(metricWeek) || {};
      target[metric.id] = value;
      metricsByWeek.set(metricWeek, target);
    }
    const explicitYear = yearIndex >= 0 ? row[yearIndex] : '';
    const year = options.defaultYear || inferYear(`${source} ${currentWeek}`, explicitYear);
    return [...metricsByWeek.entries()].map(([week, metrics]) => ({ year, week, institution, region, metrics }));
  });

  if (!parsedRows.length) throw new Error('指标文件没有有效机构数据');
  return {
    rows: parsedRows,
    years: [...new Set(parsedRows.map((row) => row.year))].sort(),
    weeks: sortWeeks([...new Set(parsedRows.map((row) => row.week))]),
    source,
    metricLabels,
  };
}

function inferDashboardComparisonYear(tables) {
  const currentSheetYears = tables
    .map((table) => table.sheetName || '')
    .filter((name) => !/年初|年底/.test(name))
    .map(yearFromText)
    .filter(Boolean);
  if (currentSheetYears.length) return Math.max(...currentSheetYears);
  const years = tables.map((table) => yearFromText(table.sheetName || table.fileName)).filter(Boolean);
  return years.length ? Math.max(...years) : null;
}

function dashboardPeriodName(year, week) {
  const safeYear = String(year || '').trim();
  const safeWeek = String(week || '').trim();
  if (!safeWeek) return safeYear || '未标周期';
  if (safeWeek === '年初') return safeYear ? `${safeYear}年初` : '年初';
  if (safeYear && !safeWeek.includes(safeYear)) return `${safeYear}年${safeWeek}`;
  return safeWeek;
}

function dashboardDataSourceName(rows, tableCount = 1) {
  const periodRows = rows.filter((row) => row.week && row.week !== '年初');
  const sourceRows = periodRows.length ? periodRows : rows;
  const periods = [...new Set(sourceRows.map((row) => dashboardPeriodName(row.year, row.week)))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const hasBaseline = rows.some((row) => row.week === '年初');
  const notes = [];
  if (hasBaseline && periodRows.length) notes.push('含年初基准');
  if (tableCount > 1) notes.push(`${tableCount}个工作表`);
  return `指标数据：${periods.join('、') || '未标周期'}${notes.length ? `（${notes.join('，')}）` : ''}`;
}

function parseDashboardTables(tables, fileName = '') {
  if (!tables.length) throw new Error('指标文件没有可读取的数据表');
  const comparisonYear = inferDashboardComparisonYear(tables);
  const regionMap = new Map();
  tables.forEach((table) => {
    regionMapFromCsv(table.csvText).forEach((region, institution) => {
      if (!regionMap.has(institution)) regionMap.set(institution, region);
    });
  });
  const parsedParts = [];
  const errors = [];
  for (const table of tables) {
    const source = table.sheetName ? `上传文件：${fileName || table.fileName} / ${table.sheetName}` : `上传文件：${fileName || table.fileName || ''}`;
    try {
      parsedParts.push(parseDashboardCsv(
        table.csvText,
        source,
        inferDashboardTableDefaults(table, comparisonYear),
      ));
    } catch (error) {
      errors.push(`${table.sheetName || 'CSV'}：${error.message}`);
    }
  }
  const rows = parsedParts.flatMap((part) => part.rows).map((row) => ({
    ...row,
    region: row.region && row.region !== '未标区域'
      ? row.region
      : regionMap.get(row.institution) || row.region || '未标区域',
  }));
  if (!rows.length) throw new Error(errors[0] || '指标文件没有有效机构数据');
  const metricLabels = {};
  parsedParts.forEach((part) => {
    Object.entries(part.metricLabels || {}).forEach(([id, label]) => {
      if (!metricLabels[id] || !part.weeks?.every((week) => week === '年初')) metricLabels[id] = label;
    });
  });
  return {
    rows,
    years: [...new Set(rows.map((row) => row.year))].sort(),
    weeks: sortWeeks([...new Set(rows.map((row) => row.week))]),
    source: dashboardDataSourceName(rows, parsedParts.length),
    metricLabels,
  };
}

function generateDashboardSample() {
  const institutions = ['机构A', '机构B', '机构C', '机构D', '机构E', '机构F', '机构G', '机构H', '机构I', '机构J'];
  const regions = ['城区支行', '郊县支行', '异地分行'];
  const sampleYear = '2026';
  const weeks = Array.from({ length: 8 }, (_, index) => `${sampleYear}年第${index + 1}周`);
  const rows = [];
  weeks.forEach((week, weekIndex) => {
    institutions.forEach((institution, institutionIndex) => {
      const base = 0.38 + institutionIndex * 0.035 + weekIndex * 0.018;
      const wave = Math.sin((institutionIndex + 1) * (weekIndex + 2)) * 0.025;
      rows.push({
        year: sampleYear,
        week,
        institution,
        region: regions[institutionIndex % regions.length],
        metrics: {
          coverage: Math.min(0.92, base + wave),
          bill: Math.min(0.88, base - 0.06 + Math.cos(institutionIndex + weekIndex) * 0.025),
          acquiring: Math.min(0.9, base - 0.02 + Math.sin(weekIndex / 2) * 0.03),
          payroll: Math.min(0.86, base - 0.08 + Math.cos(institutionIndex / 2) * 0.026),
          stateBusiness: Math.min(0.78, base - 0.12 + Math.sin(institutionIndex) * 0.024),
          highPenetration: Math.min(0.72, base - 0.18 + Math.cos(weekIndex) * 0.018),
          settlement: Math.min(0.9, base - 0.03 + Math.sin(institutionIndex + 1) * 0.02),
          loan: Math.min(0.76, base - 0.14 + Math.cos(weekIndex + institutionIndex) * 0.018),
          contribution: Math.min(0.82, base - 0.1 + Math.sin(weekIndex + institutionIndex / 2) * 0.022),
          interest: Math.max(0.006, 0.022 - weekIndex * 0.0008 + institutionIndex * 0.0003),
          keyCustomers: Math.round(34 + institutionIndex * 4 + weekIndex * 3 + Math.sin(institutionIndex + weekIndex) * 4),
        },
      });
    });
  });
  return { rows, years: [sampleYear], weeks, source: '模拟数据：2026年 / 8周 / 10机构' };
}

function metricDefinitionById(metricId) {
  return metricDefinitions.find((metric) => metric.id === metricId);
}

function displayMetric(metric) {
  if (!metric) return metric;
  const label = dashboardState.metricLabels?.[metric.id];
  return label ? { ...metric, label } : metric;
}

function metricDisplayLabel(metricId, fallbackLabel = '') {
  return dashboardState.metricLabels?.[metricId] || fallbackLabel;
}

function availableMetrics(rows) {
  return metricDefinitions
    .filter((metric) => rows.some((row) => row.metrics[metric.id] != null))
    .map(displayMetric);
}

function allRowsForYear(year = dashboardState.selectedYear) {
  return dashboardState.rows.filter((row) => row.year === year);
}

function rowMatchesRegion(row) {
  return dashboardState.selectedRegion === 'all' || (row.region || '未标区域') === dashboardState.selectedRegion;
}

function rowsForYear(year = dashboardState.selectedYear) {
  return allRowsForYear(year).filter(rowMatchesRegion);
}

function regionOptionsForYear(year = dashboardState.selectedYear) {
  return [...new Set(allRowsForYear(year).map((row) => row.region || '未标区域'))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function globalRegionSelectControls() {
  return [regionSelect, rankingRegionSelect, heatmapRegionSelect].filter(Boolean);
}

function overviewRowsForWeek(week) {
  return dashboardState.rows.filter((row) => (
    row.year === dashboardState.selectedYear
    && row.week === week
    && (dashboardState.overviewRegion === 'all' || (row.region || '未标区域') === dashboardState.overviewRegion)
  ));
}

function weeksForYear(year = dashboardState.selectedYear) {
  return sortWeeks([...new Set(rowsForYear(year).map((row) => row.week))]);
}

function rowsForWeek(week) {
  return dashboardState.rows.filter((row) => (
    row.year === dashboardState.selectedYear
    && row.week === week
    && rowMatchesRegion(row)
  ));
}

function yearStartWeek() {
  return weeksForYear()[0] || '';
}

function metricAverageForWeek(week, metricId) {
  return average(rowsForWeek(week).map((row) => row.metrics[metricId]));
}

function metricAverageForRegionWeek(week, region, metricId) {
  const regionLabel = region || '未标区域';
  return average(dashboardState.rows
    .filter((row) => (
      row.year === dashboardState.selectedYear
      && row.week === week
      && (row.region || '未标区域') === regionLabel
    ))
    .map((row) => row.metrics[metricId]));
}

function institutionMetricForWeek(week, institution, metricId) {
  return rowsForWeek(week).find((row) => row.institution === institution)?.metrics[metricId] ?? null;
}

function sumMetric(rows, metricId) {
  const values = rows.map((row) => row.metrics[metricId]).filter((value) => value != null && Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function weightedCoverage(rows) {
  const coverageCount = sumMetric(rows, '_coverageCount');
  const customers = sumMetric(rows, 'keyCustomers');
  if (coverageCount != null && customers) return coverageCount / customers;
  return average(rows.map((row) => row.metrics.coverage));
}

function weightedHighPenetration(rows) {
  const highCount = sumMetric(rows, '_highPenetrationCount');
  const coverageCount = sumMetric(rows, '_coverageCount');
  if (highCount != null && coverageCount) return highCount / coverageCount;
  return average(rows.map((row) => row.metrics.highPenetration));
}

function institutionNames() {
  return [...new Set(rowsForYear().map((row) => row.institution))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function metricById(metricId) {
  return displayMetric(metricDefinitionById(metricId));
}

function weakMetricsBelowRegionAverage(row, week) {
  const region = row.region || '未标区域';
  const peers = dashboardState.rows.filter((item) => (
    item.year === dashboardState.selectedYear
    && item.week === week
    && (item.region || '未标区域') === region
  ));
  return availableMetrics([row])
    .filter((metric) => metric.id !== 'keyCustomers')
    .map((metric) => {
      const value = row.metrics[metric.id];
      const peerAverage = average(peers.map((item) => item.metrics[metric.id]));
      if (value == null || peerAverage == null) return null;
      const rawGap = metric.kind === 'inverseRate' ? value - peerAverage : peerAverage - value;
      const weak = metric.kind === 'inverseRate' ? value > peerAverage : value < peerAverage;
      return weak ? { metric, gap: rawGap, average: peerAverage } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.gap - a.gap);
}

function filterRowsByScope(rows, scope) {
  if (scope === 'reached') return rows.filter((row) => row.metrics.coverage != null && row.metrics.coverage >= metricById('coverage').target);
  if (scope === 'unreached') return rows.filter((row) => row.metrics.coverage != null && row.metrics.coverage < metricById('coverage').target);
  return rows;
}

function overviewDetailRows(scope) {
  const coverageMetric = metricById('coverage');
  const rows = filterRowsByScope(overviewRowsForWeek(dashboardState.selectedWeek), scope)
    .filter((row) => row.metrics.coverage != null);
  return [...rows].sort((a, b) => {
    if (scope === 'unreached') {
      return a.metrics.coverage - b.metrics.coverage || a.institution.localeCompare(b.institution, 'zh-CN');
    }
    return b.metrics.coverage - a.metrics.coverage || a.institution.localeCompare(b.institution, 'zh-CN');
  }).map((row) => ({
    institution: row.institution,
    region: row.region || '未标区域',
    coverage: row.metrics.coverage,
    keyCustomers: row.metrics.keyCustomers,
    reached: row.metrics.coverage >= coverageMetric.target,
  }));
}

function selectableTrendMetrics() {
  const yearRows = rowsForYear();
  return availableMetrics(yearRows);
}

function selectableRankingMetrics() {
  const yearRows = rowsForYear();
  const rankingMetricIds = [...heatmapMetricGroups.core, ...heatmapMetricGroups.contribution];
  return availableMetrics(yearRows).filter((metric) => (
    rankingMetricIds.includes(metric.id)
  ));
}

function ensureTrendMetricSelection() {
  const allowedIds = selectableTrendMetrics().map((metric) => metric.id);
  const selected = dashboardState.selectedTrendMetricIds.filter((id) => allowedIds.includes(id));
  const defaultSelected = defaultTrendMetricIds.filter((id) => allowedIds.includes(id));
  dashboardState.selectedTrendMetricIds = selected.length ? selected : defaultSelected.length ? defaultSelected : allowedIds.slice(0, 6);
}

function ensureRankingMetricSelection() {
  const allowedIds = selectableRankingMetrics().map((metric) => metric.id);
  const currentIds = dashboardState.selectedRankingMetricIds?.length
    ? dashboardState.selectedRankingMetricIds
    : [dashboardState.selectedMetricId || 'coverage'];
  const selected = currentIds.filter((id) => allowedIds.includes(id));
  dashboardState.selectedRankingMetricIds = selected.length
    ? selected
    : allowedIds.slice(0, Math.min(3, allowedIds.length));
  dashboardState.selectedMetricId = dashboardState.selectedRankingMetricIds[0] || allowedIds[0] || 'coverage';
}

function heatmapMetricsForSelection(rows) {
  const metrics = availableMetrics(rows);
  if (dashboardState.heatmapMetricScope === 'all') return metrics;
  const group = heatmapMetricGroups[dashboardState.heatmapMetricScope] || heatmapMetricGroups.core;
  return group.map((id) => metricById(id)).filter((metric) => metric && rows.some((row) => row.metrics[metric.id] != null));
}

function renderDashboardControls() {
  const metrics = availableMetrics(rowsForYear());
  const rankingMetrics = selectableRankingMetrics();
  const yearWeeks = weeksForYear();
  const regions = regionOptionsForYear();
  yearSelect.innerHTML = dashboardState.years.map((year) => (
    `<option value="${escapeHtml(year)}"${year === dashboardState.selectedYear ? ' selected' : ''}>${escapeHtml(year)}</option>`
  )).join('');
  weekSelect.innerHTML = yearWeeks.map((week) => (
    `<option value="${escapeHtml(week)}"${week === dashboardState.selectedWeek ? ' selected' : ''}>${escapeHtml(week)}</option>`
  )).join('');
  globalRegionSelectControls().forEach((select) => {
    select.innerHTML = [
      `<option value="all"${dashboardState.selectedRegion === 'all' ? ' selected' : ''}>全部区域</option>`,
      ...regions.map((region) => (
        `<option value="${escapeHtml(region)}"${region === dashboardState.selectedRegion ? ' selected' : ''}>${escapeHtml(region)}</option>`
      )),
    ].join('');
    select.value = dashboardState.selectedRegion;
    select.disabled = regions.length <= 1;
  });
  if (overviewRegionSelect) {
    overviewRegionSelect.innerHTML = [
      `<option value="all"${dashboardState.overviewRegion === 'all' ? ' selected' : ''}>全部区域</option>`,
      ...regions.map((region) => (
        `<option value="${escapeHtml(region)}"${region === dashboardState.overviewRegion ? ' selected' : ''}>${escapeHtml(region)}</option>`
      )),
    ].join('');
    overviewRegionSelect.value = dashboardState.overviewRegion;
    overviewRegionSelect.disabled = regions.length <= 1;
  }
  rankingMetricPicker.innerHTML = rankingMetrics.map((metric) => `
    <label class="metric-chip">
      <input type="checkbox" value="${metric.id}" ${dashboardState.selectedRankingMetricIds.includes(metric.id) ? 'checked' : ''}>
      <span>${escapeHtml(metric.label)}</span>
    </label>
  `).join('') || '<div class="empty-state">暂无可选指标</div>';
  yearSelect.disabled = dashboardState.years.length <= 1;
  weekSelect.disabled = yearWeeks.length <= 1;
  overviewScopeSelect.value = dashboardState.overviewScope;
  rankingScopeSelect.value = dashboardState.rankingScope;
  trendChartTypeSelect.value = dashboardState.trendChartType;
  heatmapMetricScopeSelect.value = dashboardState.heatmapMetricScope;
  heatmapSortSelect.value = dashboardState.heatmapSort;
  dashboardSource.textContent = dashboardState.source || '未载入数据';
}

function renderTrendMetricPicker() {
  const metrics = selectableTrendMetrics();
  trendMetricPicker.innerHTML = metrics.map((metric) => `
    <label class="metric-chip">
      <input type="checkbox" value="${metric.id}" ${dashboardState.selectedTrendMetricIds.includes(metric.id) ? 'checked' : ''}>
      <span>${escapeHtml(metric.label)}</span>
    </label>
  `).join('') || '<div class="empty-state">暂无可选指标</div>';
}

function ensureDashboardSelections() {
  if (!dashboardState.years.includes(dashboardState.selectedYear)) {
    dashboardState.selectedYear = dashboardState.years[dashboardState.years.length - 1] || '';
  }
  const regions = regionOptionsForYear();
  if (dashboardState.selectedRegion !== 'all' && !regions.includes(dashboardState.selectedRegion)) {
    dashboardState.selectedRegion = 'all';
  }
  if (dashboardState.overviewRegion !== 'all' && !regions.includes(dashboardState.overviewRegion)) {
    dashboardState.overviewRegion = 'all';
  }
  const yearWeeks = weeksForYear();
  if (!yearWeeks.includes(dashboardState.selectedWeek)) {
    dashboardState.selectedWeek = yearWeeks[yearWeeks.length - 1] || '';
  }
  const weekRows = rowsForWeek(dashboardState.selectedWeek);
  if (!weekRows.some((row) => row.institution === dashboardState.selectedInstitution)) {
    dashboardState.selectedInstitution = weekRows[0]?.institution || institutionNames()[0] || '';
  }
  const rankingMetrics = selectableRankingMetrics();
  ensureRankingMetricSelection();
  const yearMetrics = availableMetrics(rowsForYear());
  if (!yearMetrics.some((metric) => metric.id === dashboardState.selectedInstitutionMetricId)) {
    dashboardState.selectedInstitutionMetricId = yearMetrics[0]?.id || 'coverage';
  }
  ensureTrendMetricSelection();
}

function renderDashboardKpis() {
  const week = dashboardState.selectedWeek;
  const baseWeek = yearStartWeek();
  const scopedRows = overviewRowsForWeek(week);
  const latestRows = filterRowsByScope(overviewRowsForWeek(week), dashboardState.overviewScope);
  const baseRows = baseWeek ? filterRowsByScope(overviewRowsForWeek(baseWeek), dashboardState.overviewScope) : [];
  const coverageMetric = metricDefinitions.find((metric) => metric.id === 'coverage');
  const keyCustomersMetric = metricById('keyCustomers');
  const highPenetrationMetric = metricById('highPenetration');
  const coverage = weightedCoverage(latestRows);
  const baseCoverage = baseRows.length ? weightedCoverage(baseRows) : null;
  const coverageDelta = coverage != null && baseCoverage != null ? coverage - baseCoverage : null;
  const keyCustomers = sumMetric(latestRows, 'keyCustomers') ?? 0;
  const baseKeyCustomers = baseRows.length ? sumMetric(baseRows, 'keyCustomers') : null;
  const hasKeyCustomers = latestRows.some((row) => row.metrics.keyCustomers != null);
  const keyCustomersDelta = hasKeyCustomers && baseKeyCustomers != null ? keyCustomers - baseKeyCustomers : null;
  const highPenetration = weightedHighPenetration(latestRows);
  const baseHighPenetration = baseRows.length ? weightedHighPenetration(baseRows) : null;
  const highPenetrationDelta = highPenetration != null && baseHighPenetration != null ? highPenetration - baseHighPenetration : null;
  const eligibleRows = scopedRows.filter((row) => row.metrics.coverage != null);
  const reached = eligibleRows.filter((row) => row.metrics.coverage >= coverageMetric.target).length;
  const unreached = Math.max(0, eligibleRows.length - reached);
  const metricWeakness = availableMetrics(latestRows).map((metric) => ({
    metric,
    score: average(latestRows.map((row) => valueForScore(row.metrics[metric.id], metric))),
  })).filter((item) => item.score != null).sort((a, b) => a.score - b.score)[0];

  dashboardKpis.innerHTML = [
    [hasKeyCustomers ? `${formatDashboardValue(keyCustomers, keyCustomersMetric)} / ${formatDelta(keyCustomersDelta, keyCustomersMetric)}` : '-', '重点客群数量 / 较年初新增数'],
    [`${formatDashboardValue(coverage, coverageMetric)} / ${formatDelta(coverageDelta, coverageMetric)}`, '综合业务覆盖率 / 较年初新增'],
    [`${reached}/${eligibleRows.length || 0}`, `达标机构数 / 未达标 ${unreached}`, 'reached'],
    [`${formatDashboardValue(highPenetration, highPenetrationMetric)} / ${formatDelta(highPenetrationDelta, highPenetrationMetric)}`, `${highPenetrationMetric.label} / 较年初新增`],
    [metricWeakness?.metric.label || '-', '最低短板指标'],
  ].map(([value, label, detailScope]) => `
    <div${detailScope ? ` class="is-clickable" role="button" tabindex="0" data-overview-detail="${detailScope}" aria-expanded="${dashboardState.overviewDetailScope ? 'true' : 'false'}"` : ''}>
      <strong>${escapeHtml(String(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `).join('');
  renderOverviewInstitutionList();
}

function renderOverviewInstitutionList() {
  if (!dashboardState.overviewDetailScope || !overviewInstitutionList) {
    overviewInstitutionList.innerHTML = '';
    return;
  }
  const scope = dashboardState.overviewDetailScope;
  const coverageMetric = metricById('coverage');
  const keyCustomersMetric = metricById('keyCustomers');
  const rows = overviewDetailRows(scope);
  const scopeLabel = scope === 'unreached' ? '未达标机构' : '达标机构';
  const list = rows.map((row) => `
    <div class="overview-institution-row">
      <strong title="${escapeHtml(row.institution)}">${escapeHtml(row.institution)}</strong>
      <span>${escapeHtml(row.region)}</span>
      <em>${escapeHtml(formatDashboardValue(row.coverage, coverageMetric))}</em>
      <b>${escapeHtml(formatDashboardValue(row.keyCustomers, keyCustomersMetric))}</b>
    </div>
  `).join('');
  overviewInstitutionList.innerHTML = `
    <div class="overview-list-head">
      <div>
        <strong>${escapeHtml(scopeLabel)}</strong>
        <span>${escapeHtml(dashboardState.selectedWeek)}，达标线 ${escapeHtml(formatDashboardValue(coverageMetric.target, coverageMetric))}</span>
      </div>
      <div class="overview-list-tabs">
        <button type="button" class="${scope === 'reached' ? 'is-active' : ''}" data-overview-detail="reached">达标机构</button>
        <button type="button" class="${scope === 'unreached' ? 'is-active' : ''}" data-overview-detail="unreached">未达标机构</button>
      </div>
    </div>
    <div class="overview-list-table">
      <div class="overview-institution-row is-header">
        <span>机构</span><span>区域</span><span>综合覆盖率</span><span>重点客群</span>
      </div>
      ${list || '<div class="empty-state">暂无机构</div>'}
    </div>
  `;
}

function renderDashboardRanking() {
  const selectedMetrics = dashboardState.selectedRankingMetricIds
    .map((id) => metricById(id))
    .filter(Boolean);
  const metric = selectedMetrics[0] || metricById(dashboardState.selectedMetricId) || metricDefinitions[0];
  const week = dashboardState.selectedWeek;
  const rows = filterRowsByScope(rowsForWeek(week), dashboardState.rankingScope).map((row) => {
    const value = row.metrics[metric.id];
    return {
      institution: row.institution,
      value,
      metrics: selectedMetrics.map((selectedMetric) => {
        const relatedCount = rankingMetricCountMap[selectedMetric.id];
        return {
          metric: selectedMetric,
          value: row.metrics[selectedMetric.id],
          relatedCount,
          relatedCountMetric: metricById(relatedCount?.metricId) || { kind: 'count' },
          relatedCountValue: relatedCount ? row.metrics[relatedCount.metricId] ?? null : null,
        };
      }),
    };
  }).filter((row) => row.value != null).sort((a, b) => {
    if (metric.kind === 'inverseRate') return a.value - b.value || a.institution.localeCompare(b.institution, 'zh-CN');
    return b.value - a.value || a.institution.localeCompare(b.institution, 'zh-CN');
  });

  rankingHint.textContent = selectedMetrics.length
    ? `按${metric.label}排序，展示${selectedMetrics.map((item) => item.label).join('、')}${selectedMetrics.some((item) => rankingMetricCountMap[item.id]) ? '及对应户数' : ''}`
    : '暂无排行指标';
  if (!rows.length || !selectedMetrics.length) {
    dashboardRankList.innerHTML = '<div class="empty-state">暂无排行数据</div>';
    return;
  }
  const maxScore = Math.max(...rows.map((row) => valueForScore(row.value, metric) || 0), 0.01);
  const topRows = rows.slice(0, 5);
  const bottomRows = rows.length > 5 ? rows.slice(-5) : [];
  const middleRows = rows.length > 10 ? rows.slice(5, -5) : [];
  const metricColumns = selectedMetrics.reduce((count, selectedMetric) => count + (rankingMetricCountMap[selectedMetric.id] ? 2 : 1), 0);
  const gridStyle = `--rank-metric-cols:${metricColumns};`;
  const metricHeaderHtml = selectedMetrics.map((selectedMetric) => {
    const relatedCount = rankingMetricCountMap[selectedMetric.id];
    const relatedCountLabel = relatedCount ? metricDisplayLabel(relatedCount.metricId, relatedCount.label) : '';
    return `
      <span>${escapeHtml(selectedMetric.label)}</span>
      ${relatedCount ? `<span>${escapeHtml(relatedCountLabel)}</span>` : ''}
    `;
  }).join('');
  const metricCellsHtml = (row) => row.metrics.map((item) => `
    <strong>${escapeHtml(formatDashboardValue(item.value, item.metric))}</strong>
    ${item.relatedCount ? `<span class="rank-key-customers">${escapeHtml(formatDashboardValue(item.relatedCountValue, item.relatedCountMetric))}</span>` : ''}
  `).join('');
  const rankRowHtml = (row, index, markerText, markerClass = '') => {
    const score = valueForScore(row.value, metric) || 0;
    const width = Math.max(3, Math.round((score / maxScore) * 100));
    return `
      <div class="dashboard-rank-row" style="${gridStyle}">
        <span class="rank-freeze-mask" aria-hidden="true"></span>
        <span class="rank-marker ${markerClass}">${escapeHtml(markerText)}</span>
        <span class="rank-title" title="${escapeHtml(row.institution)}">${escapeHtml(row.institution)}</span>
        <span class="rank-track"><span style="width:${width}%"></span></span>
        ${metricCellsHtml(row)}
      </div>
    `;
  };
  const miniBars = rows.map((row, index) => {
    const score = valueForScore(row.value, metric) || 0;
    const height = Math.max(10, Math.round((score / maxScore) * 100));
    const isTop = index < 5;
    const isBottom = index >= rows.length - 5;
    return `<span class="${isTop ? 'is-top' : isBottom ? 'is-bottom' : ''}" style="height:${height}%" title="${escapeHtml(row.institution)} ${escapeHtml(formatDashboardValue(row.value, metric))}"></span>`;
  }).join('');
  const renderSection = (title, sectionRows, offset, markerClass) => {
    if (!sectionRows.length) return '';
    return `
      <div class="rank-section-title">${escapeHtml(title)}</div>
      ${sectionRows.map((row, index) => rankRowHtml(row, offset + index + 1, `${offset + index + 1}`, markerClass)).join('')}
    `;
  };
  const foldedRanking = dashboardState.rankExpanded ? `
    <div class="rank-section-title">中间机构表现</div>
    ${middleRows.length ? middleRows.map((row, index) => rankRowHtml(row, index + 6, `${index + 6}`)).join('') : '<div class="empty-state">暂无被折叠的中间机构</div>'}
  ` : '';
  dashboardRankList.innerHTML = [
    `<div class="rank-table-scroll">
      <div class="rank-table-inner" style="${gridStyle}">
        <div class="rank-header" style="${gridStyle}">
          <span class="rank-freeze-mask" aria-hidden="true"></span>
          <span class="rank-head-marker">排名</span>
          <span class="rank-head-title">机构</span>
          <span class="rank-head-track">表现</span>
          ${metricHeaderHtml}
        </div>
        ${renderSection('前五家', topRows, 0, 'is-top')}
        <button class="rank-mini" type="button" data-rank-toggle="true" aria-expanded="${dashboardState.rankExpanded ? 'true' : 'false'}">
          <span class="rank-mini-bars">${miniBars}</span>
          <strong>${dashboardState.rankExpanded ? '收起' : `展开中间 ${middleRows.length} 家`}</strong>
        </button>
        ${foldedRanking}
        ${renderSection('后五家', bottomRows, Math.max(0, rows.length - bottomRows.length), 'is-bottom')}
      </div>
    </div>`,
  ].join('');
}

function comboChartSvg({ metric, values, title }) {
  const validValues = values.filter((item) => item.value != null);
  if (!validValues.length) return '';
  const width = 680;
  const height = 230;
  const padding = 34;
  const maxValue = Math.max(...validValues.map((item) => item.value));
  const minValue = Math.min(0, ...validValues.map((item) => item.value));
  const valueRange = Math.max(maxValue - minValue, 0.01);
  const baseValue = values.find((item) => item.value != null)?.value ?? null;
  const deltaValues = values.map((item) => ({
    ...item,
    value: item.value != null && baseValue != null ? item.value - baseValue : null,
  }));
  const validDeltas = deltaValues.filter((item) => item.value != null);
  const maxDelta = Math.max(...validDeltas.map((item) => item.value), 0.01);
  const minDelta = Math.min(...validDeltas.map((item) => item.value), -0.01);
  const deltaRange = Math.max(maxDelta - minDelta, 0.01);
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : plotWidth;
  const barWidth = Math.max(12, Math.min(34, step * 0.44));
  const bars = values.map((item, index) => {
    if (item.value == null) return '';
    const x = padding + (values.length === 1 ? plotWidth / 2 : index * step) - barWidth / 2;
    const normalized = (item.value - minValue) / valueRange;
    const barHeight = Math.max(2, normalized * plotHeight);
    const y = height - padding - barHeight;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="4"></rect>`;
  }).join('');
  const deltaPoints = deltaValues.map((item, index) => {
    if (item.value == null) return null;
    const x = padding + (values.length === 1 ? plotWidth / 2 : index * step);
    const y = height - padding - ((item.value - minDelta) / deltaRange) * plotHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean).join(' ');
  const xLabels = values.map((item, index) => {
    const x = padding + (values.length === 1 ? plotWidth / 2 : index * step);
    return `<text x="${x.toFixed(1)}" y="${height - 8}" text-anchor="middle">${escapeHtml(item.week)}</text>`;
  }).join('');
  const lastValue = validValues[validValues.length - 1]?.value;
  const lastDelta = validDeltas[validDeltas.length - 1]?.value;
  return `
    <div class="combo-chart">
      <div class="combo-chart-head">
        <span>${escapeHtml(title || metric.label)}</span>
        <strong>${escapeHtml(formatDashboardValue(lastValue, metric))}</strong>
        <em>较年初 ${escapeHtml(formatDelta(lastDelta, metric))}</em>
      </div>
      <svg class="trend-svg combo-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title || metric.label)}折柱趋势">
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="axis-line"></line>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="axis-line"></line>
        <g class="combo-bars">${bars}</g>
        <polyline points="${deltaPoints}" fill="none" class="combo-line" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${xLabels}
      </svg>
      <div class="chart-legend">
        <span><i class="legend-bar"></i>当前值</span>
        <span><i class="legend-line"></i>较年初新增</span>
      </div>
    </div>
  `;
}

function renderComboChart(container, series, emptyText) {
  const validSeries = series.filter((item) => item.values.some((point) => point.value != null));
  if (!validSeries.length) {
    container.innerHTML = `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
    return;
  }
  container.innerHTML = validSeries.map((item) => comboChartSvg(item)).join('');
}

function renderCombinedTrendChart() {
  const yearWeeks = weeksForYear();
  const selectedMetricIds = dashboardState.selectedTrendMetricIds.length
    ? dashboardState.selectedTrendMetricIds
    : selectableTrendMetrics().map((metric) => metric.id);
  const series = selectedMetricIds
    .map((id) => metricById(id))
    .filter((metric) => metric && rowsForYear().some((row) => row.metrics[metric.id] != null))
    .map((metric) => ({
      metric,
      values: yearWeeks.map((week) => ({ week, value: metricAverageForWeek(week, metric.id) })),
    }))
    .filter((item) => item.values.some((point) => point.value != null));
  if (!series.length) {
    combinedTrendChart.innerHTML = '<div class="empty-state">暂无周度趋势数据</div>';
    return;
  }

  if (dashboardState.trendChartType === 'radar') {
    renderRadarChart(series);
    return;
  }
  if (dashboardState.trendChartType === 'rose') {
    renderRoseChart(series);
    return;
  }
  if (dashboardState.trendChartType === 'heatmap') {
    renderTrendHeatmap(series);
    return;
  }

  const width = 900;
  const height = 390;
  const padding = { top: 28, right: 34, bottom: 54, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const colors = ['#0f766e', '#2563eb', '#b45309', '#7c3aed', '#0e7490', '#be123c', '#4338ca', '#15803d'];
  const weekStep = yearWeeks.length > 1 ? plotWidth / (yearWeeks.length - 1) : plotWidth;
  const xForWeek = (index) => padding.left + (yearWeeks.length === 1 ? plotWidth / 2 : index * weekStep);
  const yForScore = (score) => padding.top + plotHeight - Math.max(0, Math.min(100, score)) / 100 * plotHeight;
  const scoredSeries = series.map((item) => {
    const baseValue = item.values.find((point) => point.value != null)?.value ?? null;
    const latestValue = latestMetricValue(item);
    const latestDelta = latestValue != null && baseValue != null ? latestValue - baseValue : null;
    return {
      ...item,
      latestValue,
      latestDelta,
      points: item.values.map((point) => ({
        ...point,
        score: point.value == null ? null : Math.round((valueForScore(point.value, item.metric) ?? 0) * 100),
      })),
    };
  });
  const gridLines = [0, 25, 50, 75, 100].map((score) => {
    const y = yForScore(score);
    return `
      <line x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}" class="trend-grid-line"></line>
      <text x="${padding.left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end">${score}</text>
    `;
  }).join('');
  const xLabels = yearWeeks.map((week, index) => (
    `<text x="${xForWeek(index).toFixed(1)}" y="${height - 18}" text-anchor="middle">${escapeHtml(week)}</text>`
  )).join('');
  const lines = scoredSeries.map((item, seriesIndex) => {
    const color = colors[seriesIndex % colors.length];
    const points = item.points.map((point, weekIndex) => {
      if (point.score == null) return null;
      return `${xForWeek(weekIndex).toFixed(1)},${yForScore(point.score).toFixed(1)}`;
    }).filter(Boolean).join(' ');
    const dots = item.points.map((point, weekIndex) => {
      if (point.score == null) return '';
      const x = xForWeek(weekIndex);
      const y = yForScore(point.score);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${color}" class="trend-point"><title>${escapeHtml(item.metric.label)} ${escapeHtml(point.week)} ${escapeHtml(formatDashboardValue(point.value, item.metric))}</title></circle>`;
    }).join('');
    return points ? `
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${dots}
    ` : '';
  }).join('');
  const latestCards = scoredSeries.map((item, index) => `
    <div class="trend-summary-card" style="--series-color:${colors[index % colors.length]}">
      <span>${escapeHtml(item.metric.label)}</span>
      <strong>${escapeHtml(formatDashboardValue(item.latestValue, item.metric))}</strong>
      <em>较年初 ${escapeHtml(formatDelta(item.latestDelta, item.metric))}</em>
    </div>
  `).join('');
  const legend = scoredSeries.map((item, index) => (
    `<span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.metric.label)}</span>`
  )).join('');

  combinedTrendChart.innerHTML = `
    <div class="trend-summary">${latestCards}</div>
    <svg class="trend-svg combined-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="周度趋势总览">
      ${gridLines}
      <line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${width - padding.right}" y2="${padding.top + plotHeight}" class="axis-line"></line>
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}" class="axis-line"></line>
      <text x="${padding.left}" y="18" class="trend-axis-title">表现指数 0-100</text>
      <g class="combined-lines">${lines}</g>
      ${xLabels}
    </svg>
    <div class="chart-legend">
      ${legend}
      <span>已按指标目标值归一化，便于跨量纲比较</span>
    </div>
  `;
}

function latestMetricValue(seriesItem) {
  const point = seriesItem.values.find((item) => item.week === dashboardState.selectedWeek)
    || seriesItem.values.filter((item) => item.value != null).at(-1);
  return point?.value ?? null;
}

function renderRadarChart(series) {
  const width = 520;
  const height = 420;
  const cx = width / 2;
  const cy = 210;
  const radius = 138;
  const points = series.map((item, index) => {
    const score = valueForScore(latestMetricValue(item), item.metric) ?? 0;
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(series.length, 1);
    return {
      item,
      score,
      x: cx + Math.cos(angle) * radius * score,
      y: cy + Math.sin(angle) * radius * score,
      labelX: cx + Math.cos(angle) * (radius + 34),
      labelY: cy + Math.sin(angle) * (radius + 34),
      axisX: cx + Math.cos(angle) * radius,
      axisY: cy + Math.sin(angle) * radius,
    };
  });
  const polygon = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const axes = points.map((point) => `
    <line x1="${cx}" y1="${cy}" x2="${point.axisX.toFixed(1)}" y2="${point.axisY.toFixed(1)}" class="axis-line"></line>
    <text x="${point.labelX.toFixed(1)}" y="${point.labelY.toFixed(1)}" text-anchor="middle">${escapeHtml(point.item.metric.label)}</text>
  `).join('');
  const rings = [0.25, 0.5, 0.75, 1].map((scale) => (
    `<circle cx="${cx}" cy="${cy}" r="${(radius * scale).toFixed(1)}" class="radar-ring"></circle>`
  )).join('');
  combinedTrendChart.innerHTML = `
    <svg class="trend-svg radar-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="周度指标雷达图">
      ${rings}
      ${axes}
      <polygon points="${polygon}" class="radar-area"></polygon>
      ${points.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4" class="radar-point"></circle>`).join('')}
    </svg>
    <div class="chart-legend"><span>按 ${escapeHtml(dashboardState.selectedWeek)} 当前值归一化展示</span></div>
  `;
}

function renderRoseChart(series) {
  const maxScore = Math.max(...series.map((item) => valueForScore(latestMetricValue(item), item.metric) ?? 0), 0.01);
  combinedTrendChart.innerHTML = `
    <div class="rose-chart">
      ${series.map((item, index) => {
    const score = valueForScore(latestMetricValue(item), item.metric) ?? 0;
    const height = Math.max(16, Math.round((score / maxScore) * 180));
    const color = ['#0f766e', '#2563eb', '#b45309', '#7c3aed', '#0e7490'][index % 5];
    return `
        <div class="rose-item">
          <div class="rose-bar" style="height:${height}px;background:${color}"></div>
          <strong>${escapeHtml(formatDashboardValue(latestMetricValue(item), item.metric))}</strong>
          <span>${escapeHtml(item.metric.label)}</span>
        </div>
      `;
  }).join('')}
    </div>
  `;
}

function renderTrendHeatmap(series) {
  const header = series.map((item) => `<th>${escapeHtml(item.metric.label)}</th>`).join('');
  const rows = weeksForYear().map((week) => {
    const cells = series.map((item) => {
      const value = item.values.find((point) => point.week === week)?.value ?? null;
      const level = Math.round((valueForScore(value, item.metric) ?? 0) * 100);
      return `<td><span class="heat-cell" style="--heat:${level}">${escapeHtml(formatDashboardValue(value, item.metric))}</span></td>`;
    }).join('');
    return `<tr><th>${escapeHtml(week)}</th>${cells}</tr>`;
  }).join('');
  combinedTrendChart.innerHTML = `
    <div class="heatmap-wrap trend-heatmap">
      <table class="heatmap-table">
        <thead><tr><th>周次</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderTrendCharts() {
  renderCombinedTrendChart();
}

function renderHeatmap() {
  const week = dashboardState.selectedWeek;
  const baseRows = rowsForWeek(week);
  const keyCustomersMetric = metricById('keyCustomers');
  const metrics = heatmapMetricsForSelection(baseRows);
  const displayMetrics = [
    keyCustomersMetric,
    ...metrics.filter((metric) => metric.id !== 'keyCustomers'),
  ].filter((metric) => metric && baseRows.some((row) => row.metrics[metric.id] != null));
  const regionScoreAverages = new Map();
  const allWeekRows = dashboardState.rows.filter((row) => row.year === dashboardState.selectedYear && row.week === week);
  const averageScoreForRegionMetric = (region, metric) => {
    const key = `${region}:${metric.id}`;
    if (!regionScoreAverages.has(key)) {
      const peers = allWeekRows.filter((row) => (row.region || '未标区域') === region);
      regionScoreAverages.set(key, average(peers.map((row) => valueForScore(row.metrics[metric.id], metric))));
    }
    return regionScoreAverages.get(key);
  };
  const rows = [...baseRows].sort((a, b) => {
    if (dashboardState.heatmapSort === 'name') return a.institution.localeCompare(b.institution, 'zh-CN');
    if (dashboardState.heatmapSort === 'customers') {
      return (b.metrics.keyCustomers ?? -Infinity) - (a.metrics.keyCustomers ?? -Infinity)
        || a.institution.localeCompare(b.institution, 'zh-CN');
    }
    const aCoverage = a.metrics.coverage ?? -Infinity;
    const bCoverage = b.metrics.coverage ?? -Infinity;
    if (dashboardState.heatmapSort === 'weak') {
      return aCoverage - bCoverage || a.institution.localeCompare(b.institution, 'zh-CN');
    }
    return bCoverage - aCoverage || a.institution.localeCompare(b.institution, 'zh-CN');
  });
  const sortLabel = dashboardState.heatmapSort === 'customers'
    ? '重点客群数量降序'
    : `综合业务覆盖率${dashboardState.heatmapSort === 'weak' ? '升序' : '降序'}`;
  heatmapHint.textContent = `${week}，按${sortLabel}排列，圆点标出低于所属区域类型均值的指标`;
  if (!rows.length || !displayMetrics.length) {
    heatmap.innerHTML = '<div class="empty-state">暂无热力图数据</div>';
    return;
  }
  const header = displayMetrics.map((metric) => `<th>${escapeHtml(metric.label)}</th>`).join('');
  const body = rows.map((row) => {
    const region = row.region || '未标区域';
    const cells = displayMetrics.map((metric) => {
      const value = row.metrics[metric.id];
      const score = valueForScore(value, metric);
      const level = score == null ? 0 : Math.round(score * 100);
      const regionAverageScore = averageScoreForRegionMetric(region, metric);
      const isWeakness = metric.id !== 'keyCustomers' && score != null && regionAverageScore != null && score < regionAverageScore;
      return `<td><span class="heat-cell ${isWeakness ? 'is-row-low' : ''}" style="--heat:${level}">${escapeHtml(formatDashboardValue(value, metric))}</span></td>`;
    }).join('');
    return `<tr><th>${escapeHtml(row.institution)}</th>${cells}</tr>`;
  }).join('');
  heatmap.innerHTML = `
    <table class="heatmap-table">
      <thead><tr><th>机构</th>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function safeFileNamePart(value) {
  return String(value || '未命名')
    .replace(/[\\/:*?"<>|\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || '未命名';
}

function currentDashboardPeriodLabel() {
  const year = dashboardState.selectedYear || '';
  const week = dashboardState.selectedWeek || '';
  if (year && week && !week.includes(year)) return `${year}_${week}`;
  return week || year || '未标日期';
}

function institutionPdfFileName(institution) {
  return `${safeFileNamePart(institution)}_${safeFileNamePart(currentDashboardPeriodLabel())}.pdf`;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const source = String(text ?? '');
  const lines = [];
  let line = '';
  for (const char of source) {
    const candidate = `${line}${char}`;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  ctx.save();
  ctx.font = options.font || '24px "PingFang SC", "Microsoft YaHei", Arial, sans-serif';
  ctx.fillStyle = options.color || '#1f2428';
  ctx.textBaseline = 'top';
  const lines = wrapCanvasText(ctx, text, maxWidth);
  lines.slice(0, options.maxLines || lines.length).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  ctx.restore();
  return y + Math.min(lines.length, options.maxLines || lines.length) * lineHeight;
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function createInstitutionReport(institution) {
  const week = dashboardState.selectedWeek;
  const row = rowsForWeek(week).find((item) => item.institution === institution);
  if (!row) throw new Error(`暂无 ${institution || '该机构'} 的当前周数据`);
  const baseWeek = yearStartWeek();
  const coverageMetric = metricById('coverage');
  const keyCustomersMetric = metricById('keyCustomers');
  const coverage = row.metrics.coverage ?? null;
  const baseCoverage = baseWeek ? institutionMetricForWeek(baseWeek, institution, 'coverage') : null;
  const coverageDelta = coverage != null && baseCoverage != null ? coverage - baseCoverage : null;
  const keyCustomers = row.metrics.keyCustomers ?? null;
  const baseKeyCustomers = baseWeek ? institutionMetricForWeek(baseWeek, institution, 'keyCustomers') : null;
  const keyCustomersDelta = keyCustomers != null && baseKeyCustomers != null ? keyCustomers - baseKeyCustomers : null;
  const weaknesses = weakMetricsBelowRegionAverage(row, week);
  const trendMetric = metricById(dashboardState.selectedInstitutionMetricId) || coverageMetric;
  const businessMetrics = metricDefinitions
    .filter((metric) => metric.id !== 'keyCustomers' && row.metrics[metric.id] != null)
    .map((metric) => {
      const value = row.metrics[metric.id];
      const regionAverage = metricAverageForRegionWeek(week, row.region, metric.id);
      const metricScale = institutionMetricScale(metric, week);
      const score = institutionBarScale(value, metric, metricScale).score;
      const averageScore = regionAverage == null ? null : institutionBarScale(regionAverage, metric, metricScale).score;
      const gap = value != null && regionAverage != null
        ? (metric.kind === 'inverseRate' ? regionAverage - value : value - regionAverage)
        : null;
      return { metric, value, regionAverage, score, averageScore, gap, scaleLabel: metricScale.label };
    });
  return {
    institution,
    year: dashboardState.selectedYear,
    week,
    period: currentDashboardPeriodLabel(),
    region: row.region || '未标区域',
    source: dashboardState.source || '当前页面数据',
    generatedAt: new Date().toLocaleString('zh-CN'),
    kpis: [
      { label: '综合业务覆盖率', value: formatDashboardValue(coverage, coverageMetric) },
      { label: baseWeek ? '较年初新增' : '暂无基准', value: formatDelta(coverageDelta, coverageMetric) },
      { label: '重点客群数', value: formatDashboardValue(keyCustomers, keyCustomersMetric) },
      { label: baseWeek ? '重点客群较年初' : '暂无基准', value: formatDelta(keyCustomersDelta, keyCustomersMetric) },
    ],
    businessMetrics,
    weaknesses,
    trendMetric,
    trendValues: weeksForYear().map((itemWeek) => ({
      week: itemWeek,
      value: institutionMetricForWeek(itemWeek, institution, trendMetric.id),
    })),
  };
}

function drawInstitutionReport(report) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f766e';
  ctx.fillRect(0, 0, canvas.width, 18);
  drawWrappedText(ctx, `${report.institution} 机构分析报告`, 72, 64, 760, 52, {
    font: '700 42px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  });
  drawWrappedText(ctx, `数据周期：${report.period}    区域类型：${report.region}`, 72, 126, 920, 30, {
    font: '24px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    color: '#667085',
  });
  drawWrappedText(ctx, `生成时间：${report.generatedAt}`, 72, 166, 920, 28, {
    font: '22px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    color: '#667085',
  });
  drawWrappedText(ctx, `来源：${report.source}`, 72, 202, 1040, 28, {
    font: '20px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    color: '#667085',
    maxLines: 2,
  });

  const cardGap = 18;
  const cardWidth = (1096 - cardGap * 3) / 4;
  report.kpis.forEach((item, index) => {
    const x = 72 + index * (cardWidth + cardGap);
    const y = 292;
    drawRoundRect(ctx, x, y, cardWidth, 142, 14);
    ctx.fillStyle = '#f2f4f7';
    ctx.fill();
    ctx.strokeStyle = '#dadde1';
    ctx.lineWidth = 1;
    ctx.stroke();
    drawWrappedText(ctx, item.value, x + 22, y + 26, cardWidth - 44, 36, {
      font: '700 34px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#1f2428',
      maxLines: 1,
    });
    drawWrappedText(ctx, item.label, x + 22, y + 82, cardWidth - 44, 26, {
      font: '21px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#667085',
      maxLines: 2,
    });
  });

  drawWrappedText(ctx, '当前周业务结构', 72, 500, 400, 34, {
    font: '700 28px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  });
  drawWrappedText(ctx, `橙色刻度为 ${report.region} 平均值`, 72, 538, 520, 26, {
    font: '20px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    color: '#667085',
  });

  let metricY = 590;
  const barX = 330;
  const barWidth = 560;
  const rowsToDraw = report.businessMetrics.slice(0, 12);
  rowsToDraw.forEach((item) => {
    const rowY = metricY;
    drawWrappedText(ctx, item.metric.label, 72, rowY - 4, 220, 28, {
      font: '21px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#667085',
      maxLines: 1,
    });
    ctx.fillStyle = '#e8eaed';
    drawRoundRect(ctx, barX, rowY, barWidth, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#0f766e';
    drawRoundRect(ctx, barX, rowY, Math.max(8, barWidth * Math.max(0, Math.min(1, item.score))), 18, 9);
    ctx.fill();
    if (item.averageScore != null) {
      const markerX = barX + barWidth * Math.max(0, Math.min(1, item.averageScore));
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(markerX, rowY - 8);
      ctx.lineTo(markerX, rowY + 26);
      ctx.stroke();
    }
    drawWrappedText(ctx, formatDashboardValue(item.value, item.metric), 920, rowY - 8, 116, 28, {
      font: '700 22px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      maxLines: 1,
    });
    drawWrappedText(ctx, item.regionAverage == null ? '-' : formatDashboardValue(item.regionAverage, item.metric), 1042, rowY - 8, 120, 28, {
      font: '20px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#92400e',
      maxLines: 1,
    });
    metricY += 54;
  });
  if (!rowsToDraw.length) {
    drawWrappedText(ctx, '暂无业务指标', 72, metricY, 420, 30, {
      font: '22px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#667085',
    });
  }

  const weaknessY = 1250;
  drawWrappedText(ctx, '低于区域均值的短板指标', 72, weaknessY, 480, 34, {
    font: '700 28px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  });
  const weaknessText = report.weaknesses.length
    ? report.weaknesses.slice(0, 5).map((item) => `${item.metric.label}（区域均值 ${formatDashboardValue(item.average, item.metric)}）`).join('；')
    : '当前周暂无低于所属区域均值的业务指标。';
  drawWrappedText(ctx, weaknessText, 72, weaknessY + 44, 500, 34, {
    font: '22px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    color: '#667085',
    maxLines: 5,
  });

  drawInstitutionTrendOnCanvas(ctx, report, 640, 1248, 520, 300);
  return canvas;
}

function drawInstitutionTrendOnCanvas(ctx, report, x, y, width, height) {
  drawWrappedText(ctx, `${report.trendMetric.label}趋势`, x, y, width, 34, {
    font: '700 28px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  });
  const chartY = y + 52;
  const chartHeight = height - 52;
  const padding = { top: 20, right: 18, bottom: 48, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  ctx.strokeStyle = '#dadde1';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, chartY, width, chartHeight);
  const validValues = report.trendValues.filter((item) => item.value != null);
  if (!validValues.length) {
    drawWrappedText(ctx, '暂无趋势数据', x + 24, chartY + 86, width - 48, 30, {
      font: '22px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#667085',
    });
    return;
  }
  const scores = report.trendValues.map((item) => ({
    ...item,
    score: valueForScore(item.value, report.trendMetric),
  }));
  const xForIndex = (index) => x + padding.left + (scores.length === 1 ? plotWidth / 2 : (plotWidth * index) / (scores.length - 1));
  const yForScore = (score) => chartY + padding.top + plotHeight - Math.max(0, Math.min(1, score ?? 0)) * plotHeight;
  [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
    const lineY = yForScore(tick);
    ctx.strokeStyle = '#eef0f3';
    ctx.beginPath();
    ctx.moveTo(x + padding.left, lineY);
    ctx.lineTo(x + width - padding.right, lineY);
    ctx.stroke();
  });
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  let hasPoint = false;
  scores.forEach((item, index) => {
    if (item.score == null) return;
    const pointX = xForIndex(index);
    const pointY = yForScore(item.score);
    if (!hasPoint) {
      ctx.moveTo(pointX, pointY);
      hasPoint = true;
    } else {
      ctx.lineTo(pointX, pointY);
    }
  });
  ctx.stroke();
  scores.forEach((item, index) => {
    if (item.score == null) return;
    const pointX = xForIndex(index);
    const pointY = yForScore(item.score);
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2);
    ctx.fill();
    if (index === scores.length - 1 || index === 0) {
      drawWrappedText(ctx, formatDashboardValue(item.value, report.trendMetric), pointX - 42, pointY - 32, 84, 22, {
        font: '18px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
        color: '#1f2428',
        maxLines: 1,
      });
    }
  });
  const labelStep = Math.max(1, Math.ceil(scores.length / 5));
  scores.forEach((item, index) => {
    if (index % labelStep !== 0 && index !== scores.length - 1) return;
    drawWrappedText(ctx, item.week, xForIndex(index) - 42, chartY + chartHeight - 38, 84, 22, {
      font: '18px "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      color: '#667085',
      maxLines: 1,
    });
  });
}

function binaryStringToUint8Array(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function imageCanvasToPdfBlob(canvas) {
  const jpegData = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
  const imageBytes = atob(jpegData);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n${imageBytes}\nendstream\nendobj\n`,
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`,
  ];
  let pdf = '%PDF-1.3\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([binaryStringToUint8Array(pdf)], { type: 'application/pdf' });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function downloadInstitutionPdf(institution) {
  const report = createInstitutionReport(institution);
  const canvas = drawInstitutionReport(report);
  downloadBlob(imageCanvasToPdfBlob(canvas), institutionPdfFileName(institution));
}

async function downloadInstitutionPdfBatch(institutions) {
  if (!institutions.length) throw new Error('暂无可下载的机构数据');
  for (const institution of institutions) {
    downloadInstitutionPdf(institution);
    await new Promise((resolve) => { window.setTimeout(resolve, 220); });
  }
}

function renderSingleInstitution() {
  const week = dashboardState.selectedWeek;
  const institution = dashboardState.selectedInstitution;
  const row = rowsForWeek(week).find((item) => item.institution === institution);
  const baseWeek = yearStartWeek();
  const coverageMetric = metricById('coverage');
  const keyCustomersMetric = metricById('keyCustomers');
  institutionHint.textContent = institution ? `单一机构 / ${week}` : '单一机构';
  const institutions = institutionNames();
  institutionSelect.innerHTML = institutions.map((item) => (
    `<option value="${escapeHtml(item)}"${item === dashboardState.selectedInstitution ? ' selected' : ''}>${escapeHtml(item)}</option>`
  )).join('');
  institutionSelect.disabled = institutions.length <= 1;
  downloadInstitutionPdfButton.disabled = !row;
  downloadAllInstitutionPdfsButton.disabled = !rowsForWeek(week).length;

  if (!row) {
    institutionKpis.innerHTML = [
      ['-', '综合业务覆盖率'],
      ['-', '较年初新增'],
      ['-', '重点客群数'],
      ['-', '最低短板指标'],
    ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
    institutionBars.innerHTML = '<div class="empty-state">暂无机构数据</div>';
    return;
  }

  const coverage = row.metrics.coverage ?? null;
  const baseCoverage = baseWeek ? institutionMetricForWeek(baseWeek, institution, 'coverage') : null;
  const coverageDelta = coverage != null && baseCoverage != null ? coverage - baseCoverage : null;
  const regionWeakness = weakMetricsBelowRegionAverage(row, week);
  const weaknessLabel = regionWeakness.length
    ? regionWeakness.slice(0, 3).map((item) => item.metric.label).join('、')
    : '无';

  institutionKpis.innerHTML = [
    [formatDashboardValue(coverage, coverageMetric), '综合业务覆盖率'],
    [formatDelta(coverageDelta, coverageMetric), baseWeek ? '较年初新增' : '暂无基准'],
    [formatDashboardValue(row.metrics.keyCustomers, keyCustomersMetric), '重点客群数'],
    [weaknessLabel, `低于${row.region || '未标区域'}均值指标`],
  ].map(([value, label]) => `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`).join('');

  const barMetrics = metricDefinitions
    .filter((metric) => metric.id !== 'keyCustomers' && row.metrics[metric.id] != null)
    .map((metric) => {
      const metricScale = institutionMetricScale(metric, week);
      const scale = institutionBarScale(row.metrics[metric.id], metric, metricScale);
      const regionAverage = metricAverageForRegionWeek(week, row.region, metric.id);
      const averageScale = institutionBarScale(regionAverage, metric, metricScale);
      return {
        metric,
        value: row.metrics[metric.id],
        score: scale.score,
        scaleLabel: scale.label,
        regionAverage,
        averageScore: averageScale.score,
      };
    });
  institutionBars.innerHTML = barMetrics.map((item) => {
    const width = Math.max(3, Math.round(item.score * 100));
    const averagePosition = item.regionAverage == null ? null : Math.max(0, Math.min(100, Math.round(item.averageScore * 100)));
    const averageLabelClass = averagePosition == null ? '' : averagePosition > 84 ? ' is-right' : averagePosition < 16 ? ' is-left' : '';
    return `
      <div class="institution-bar-row">
        <span title="${escapeHtml(`${item.metric.label}，刻度 ${item.scaleLabel}`)}">${escapeHtml(item.metric.label)}<small>${escapeHtml(item.scaleLabel)}</small></span>
        <div class="rank-track institution-scale-track">
          <span style="width:${width}%"></span>
          ${averagePosition == null ? '' : `
            <i class="institution-average-marker" style="left:${averagePosition}%" title="${escapeHtml(`${row.region || '未标区域'}平均值 ${formatDashboardValue(item.regionAverage, item.metric)}`)}"></i>
            <b class="institution-average-label${averageLabelClass}" style="left:${averagePosition}%">${escapeHtml(formatDashboardValue(item.regionAverage, item.metric))}</b>
          `}
        </div>
        <strong>${escapeHtml(formatDashboardValue(item.value, item.metric))}</strong>
      </div>
    `;
  }).join('') || '<div class="empty-state">暂无业务指标</div>';
}

function renderDashboard() {
  if (!dashboardState.rows.length) {
    dashboardKpis.innerHTML = [
      ['-', '重点客群数量 / 较年初新增数'],
      ['-', '综合业务覆盖率 / 较年初新增'],
      ['-', '达标机构数'],
      ['-', '高渗透覆盖率 / 较年初新增'],
      ['-', '最低短板指标'],
    ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
    overviewInstitutionList.innerHTML = '';
    dashboardRankList.innerHTML = '<div class="empty-state">上传 Excel/CSV 或生成模拟数据</div>';
    combinedTrendChart.innerHTML = '<div class="empty-state">暂无周度趋势数据</div>';
    institutionKpis.innerHTML = [
      ['-', '综合业务覆盖率'],
      ['-', '较年初新增'],
      ['-', '重点客群数'],
      ['-', '最低短板指标'],
    ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
    institutionBars.innerHTML = '<div class="empty-state">暂无机构数据</div>';
    heatmap.innerHTML = '<div class="empty-state">暂无热力图数据</div>';
    dashboardSource.textContent = '未载入数据';
    yearSelect.innerHTML = '<option>暂无年份</option>';
    weekSelect.innerHTML = '<option>暂无数据</option>';
    globalRegionSelectControls().forEach((select) => {
      select.innerHTML = '<option>全部区域</option>';
      select.disabled = true;
    });
    if (overviewRegionSelect) {
      overviewRegionSelect.innerHTML = '<option>全部区域</option>';
      overviewRegionSelect.disabled = true;
    }
    rankingMetricPicker.innerHTML = '<div class="empty-state">暂无可选指标</div>';
    institutionSelect.innerHTML = '<option>暂无机构</option>';
    trendMetricPicker.innerHTML = '<div class="empty-state">暂无可选指标</div>';
    yearSelect.disabled = true;
    weekSelect.disabled = true;
    institutionSelect.disabled = true;
    downloadInstitutionPdfButton.disabled = true;
    downloadAllInstitutionPdfsButton.disabled = true;
    return;
  }
  ensureDashboardSelections();
  renderDashboardControls();
  renderTrendMetricPicker();
  renderDashboardKpis();
  renderDashboardRanking();
  renderTrendCharts();
  renderSingleInstitution();
  renderHeatmap();
}

function loadDashboardData(dataset) {
  const metrics = availableMetrics(dataset.rows);
  const years = dataset.years?.length ? dataset.years : [...new Set(dataset.rows.map((row) => row.year))].sort();
  const selectedYear = years.includes(dashboardState.selectedYear)
    ? dashboardState.selectedYear
    : years[years.length - 1] || '';
  const institutions = [...new Set(dataset.rows.filter((row) => row.year === selectedYear).map((row) => row.institution))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const regions = [...new Set(dataset.rows.filter((row) => row.year === selectedYear).map((row) => row.region || '未标区域'))];
  const selectedRegion = dashboardState.selectedRegion === 'all' || regions.includes(dashboardState.selectedRegion)
    ? dashboardState.selectedRegion
    : 'all';
  const selectedYearWeeks = sortWeeks([...new Set(dataset.rows.filter((row) => row.year === selectedYear).map((row) => row.week))]);
  dashboardState = {
    rows: dataset.rows,
    years,
    weeks: dataset.weeks,
    selectedYear,
    selectedWeek: selectedYearWeeks[selectedYearWeeks.length - 1] || dataset.weeks[dataset.weeks.length - 1] || '',
    selectedRegion,
    overviewRegion: dashboardState.overviewRegion === 'all' || regions.includes(dashboardState.overviewRegion)
      ? dashboardState.overviewRegion
      : 'all',
    selectedMetricId: metrics.some((metric) => metric.id === dashboardState.selectedMetricId)
      ? dashboardState.selectedMetricId
      : metrics[0]?.id || 'coverage',
    selectedRankingMetricIds: dashboardState.selectedRankingMetricIds?.length
      ? dashboardState.selectedRankingMetricIds
      : [dashboardState.selectedMetricId || 'coverage'],
    overviewScope: dashboardState.overviewScope || 'all',
    rankingScope: dashboardState.rankingScope || 'all',
    trendChartType: dashboardState.trendChartType || 'combo',
    selectedTrendMetricIds: dashboardState.selectedTrendMetricIds?.length
      ? dashboardState.selectedTrendMetricIds
      : [...defaultTrendMetricIds],
    selectedInstitution: institutions.includes(dashboardState.selectedInstitution)
      ? dashboardState.selectedInstitution
      : institutions[0] || '',
    selectedInstitutionMetricId: metrics.some((metric) => metric.id === dashboardState.selectedInstitutionMetricId)
      ? dashboardState.selectedInstitutionMetricId
      : 'coverage',
    heatmapMetricScope: dashboardState.heatmapMetricScope || 'core',
    heatmapSort: dashboardState.heatmapSort || 'customers',
    rankExpanded: false,
    source: dataset.source,
    metricLabels: dataset.metricLabels || {},
  };
  renderDashboard();
}

toggleKeyButton.addEventListener('click', () => {
  const visible = amapKeyInput.type === 'text';
  amapKeyInput.type = visible ? 'password' : 'text';
  toggleKeyButton.textContent = visible ? '显示' : '隐藏';
});

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

dashboardRankList.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-rank-toggle]');
  if (!toggle) return;
  dashboardState.rankExpanded = !dashboardState.rankExpanded;
  renderDashboardRanking();
});

trendMetricPicker.addEventListener('change', (event) => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  const selected = [...trendMetricPicker.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.value);
  if (!selected.length) {
    event.target.checked = true;
    showToast('至少保留一个趋势指标', 'error');
    return;
  }
  dashboardState.selectedTrendMetricIds = selected;
  renderTrendCharts();
});

dashboardFileInput.addEventListener('change', async () => {
  try {
    const tables = await readSelectedWorkbookTables(dashboardFileInput);
    if (!tables.length) return;
    loadDashboardData(parseDashboardTables(tables, dashboardFileInput.files?.[0]?.name || ''));
    showToast('指标数据已载入');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

sampleDashboardButton.addEventListener('click', () => {
  loadDashboardData(generateDashboardSample());
  showToast('已生成模拟指标数据');
});

yearSelect.addEventListener('change', () => {
  dashboardState.selectedYear = yearSelect.value;
  dashboardState.selectedWeek = weeksForYear()[weeksForYear().length - 1] || '';
  dashboardState.rankExpanded = false;
  renderDashboard();
});

weekSelect.addEventListener('change', () => {
  dashboardState.selectedWeek = weekSelect.value;
  renderDashboard();
});

function handleRegionSelectChange(event) {
  dashboardState.selectedRegion = event.target.value;
  dashboardState.rankExpanded = false;
  renderDashboard();
}

globalRegionSelectControls().forEach((select) => {
  select.addEventListener('change', handleRegionSelectChange);
});

overviewRegionSelect?.addEventListener('change', () => {
  dashboardState.overviewRegion = overviewRegionSelect.value;
  renderDashboardKpis();
});

overviewScopeSelect.addEventListener('change', () => {
  dashboardState.overviewScope = overviewScopeSelect.value;
  renderDashboardKpis();
});

function setOverviewDetailScope(scope) {
  dashboardState.overviewDetailScope = dashboardState.overviewDetailScope === scope ? '' : scope;
  renderDashboardKpis();
}

dashboardKpis.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-overview-detail]');
  if (!trigger) return;
  setOverviewDetailScope(trigger.dataset.overviewDetail);
});

dashboardKpis.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const trigger = event.target.closest('[data-overview-detail]');
  if (!trigger) return;
  event.preventDefault();
  setOverviewDetailScope(trigger.dataset.overviewDetail);
});

overviewInstitutionList.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-overview-detail]');
  if (!trigger) return;
  dashboardState.overviewDetailScope = trigger.dataset.overviewDetail;
  renderDashboardKpis();
});

rankingMetricPicker.addEventListener('change', (event) => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  const selected = [...rankingMetricPicker.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.value);
  if (!selected.length) {
    event.target.checked = true;
    showToast('至少保留一个排行指标', 'error');
    return;
  }
  dashboardState.selectedRankingMetricIds = selected;
  dashboardState.selectedMetricId = selected[0];
  dashboardState.rankExpanded = false;
  renderDashboardRanking();
});

rankingScopeSelect.addEventListener('change', () => {
  dashboardState.rankingScope = rankingScopeSelect.value;
  dashboardState.rankExpanded = false;
  renderDashboardRanking();
});

trendChartTypeSelect.addEventListener('change', () => {
  dashboardState.trendChartType = trendChartTypeSelect.value;
  renderTrendCharts();
});

institutionSelect.addEventListener('change', () => {
  dashboardState.selectedInstitution = institutionSelect.value;
  renderDashboard();
});

institutionMetricSelect?.addEventListener('change', () => {
  dashboardState.selectedInstitutionMetricId = institutionMetricSelect.value;
  renderSingleInstitution();
});

downloadInstitutionPdfButton.addEventListener('click', () => {
  try {
    if (!dashboardState.selectedInstitution) throw new Error('请选择机构');
    downloadInstitutionPdf(dashboardState.selectedInstitution);
    showToast('当前机构 PDF 已开始下载');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

downloadAllInstitutionPdfsButton.addEventListener('click', async () => {
  try {
    const institutions = [...new Set(rowsForWeek(dashboardState.selectedWeek).map((row) => row.institution))]
      .sort((a, b) => a.localeCompare(b, 'zh-CN'));
    downloadAllInstitutionPdfsButton.disabled = true;
    downloadInstitutionPdfButton.disabled = true;
    await downloadInstitutionPdfBatch(institutions);
    showToast(`已生成 ${institutions.length} 个机构 PDF 下载`);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    renderSingleInstitution();
  }
});

heatmapMetricScopeSelect.addEventListener('change', () => {
  dashboardState.heatmapMetricScope = heatmapMetricScopeSelect.value;
  renderHeatmap();
});

heatmapSortSelect.addEventListener('change', () => {
  dashboardState.heatmapSort = heatmapSortSelect.value;
  renderHeatmap();
});

resolvedFileInput.addEventListener('change', async () => {
  try {
    const csvText = await readSelectedTableFile(resolvedFileInput);
    if (!csvText) return;
    renderResolvedAnalysis(analyzeResolvedCsv(csvText));
    showToast('已解析数据已载入');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

batchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const key = requireAmapKey();
    const companyCsv = await readSelectedTableFile(companyFileInput);
    const institutionCsv = await readSelectedTableFile(institutionFileInput);
    if (!companyCsv) throw new Error('请选择企业列表 CSV/Excel');
    if (!institutionCsv) throw new Error('请选择机构列表 CSV/Excel');
    batchButton.disabled = true;
    downloadLink.classList.add('is-disabled');
    setProgress({ completed: 0, total: 1, message: '开始处理' });
    const result = await matchCompanies({
      key,
      companyCsv,
      institutionCsv,
      onProgress: setProgress,
    });
    setMetrics(result.stats);
    renderResolvedAnalysis(analyzeResolvedCsv(result.csv));
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = URL.createObjectURL(new Blob([`\uFEFF${result.csv}`], { type: 'text/csv;charset=utf-8' }));
    downloadLink.href = outputUrl;
    downloadLink.classList.remove('is-disabled');
    setProgress({ completed: 1, total: 1, message: '处理完成' });
    showToast('批量匹配完成');
  } catch (error) {
    setProgress({ completed: 0, total: 1, message: error.message });
    showToast(error.message, 'error');
  } finally {
    batchButton.disabled = false;
  }
});

subsidyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const file = subsidyZipFileInput.files?.[0];
    subsidyAuditButton.disabled = true;
    subsidyDownloadLink.classList.add('is-disabled');
    subsidySource.textContent = file ? `正在审核：${file.name}` : '未载入资料';
    const analysis = await auditSubsidyZip(file);
    renderSubsidyAnalysis(analysis);
    const csv = subsidyAnalysisToCsv(analysis);
    if (subsidyOutputUrl) URL.revokeObjectURL(subsidyOutputUrl);
    subsidyOutputUrl = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    subsidyDownloadLink.href = subsidyOutputUrl;
    subsidyDownloadLink.classList.remove('is-disabled');
    subsidySource.textContent = `${file.name}，${analysis.rows.length} 个借据文件夹`;
    showToast('贴息资料审核完成');
  } catch (error) {
    subsidyHint.textContent = error.message;
    showToast(error.message, 'error');
  } finally {
    subsidyAuditButton.disabled = false;
  }
});

queryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const key = requireAmapKey();
    const address = queryAddress.value.trim();
    const institutionCsv = await readSelectedTableFile(queryInstitutionFileInput);
    if (!address) throw new Error('请输入企业地址');
    if (!institutionCsv) throw new Error('请选择机构列表 CSV/Excel');
    queryButton.disabled = true;
    queryResult.innerHTML = '<div class="result-row"><span>状态</span><strong>查询中</strong></div>';
    const result = await queryNearest({ key, address, institutionCsv });
    const rows = [
      ['机构网点', result.nearest.branch],
      ['机构地址', result.nearest.address],
      ['直线距离', formatMeters(result.distanceMeters)],
      ['企业定位', result.companyGeo.formattedAddress],
      ['定位级别', result.companyGeo.level],
      ['企业坐标', `${result.companyGeo.lng}, ${result.companyGeo.lat}`],
    ];
    queryResult.innerHTML = rows.map(([label, value]) => (
      `<div class="result-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`
    )).join('');
  } catch (error) {
    queryResult.innerHTML = '';
    showToast(error.message, 'error');
  } finally {
    queryButton.disabled = false;
  }
});

setMetrics();
resetResolvedView();
resetSubsidyView();
syncStaticLabels();
renderDashboard();

if (window.desktopRuntime?.isDesktop) {
  privacyStatus.textContent = `桌面端 ${window.desktopRuntime.platform}`;
  document.body.classList.add('is-desktop');
}
