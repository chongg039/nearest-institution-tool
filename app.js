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
const dashboardFileInput = document.querySelector('#dashboardFile');
const sampleDashboardButton = document.querySelector('#sampleDashboardButton');
const weekSelect = document.querySelector('#weekSelect');
const rankingMetricSelect = document.querySelector('#rankingMetricSelect');
const institutionSelect = document.querySelector('#institutionSelect');
const dashboardSource = document.querySelector('#dashboardSource');
const dashboardKpis = document.querySelector('#dashboardKpis');
const dashboardRankList = document.querySelector('#dashboardRankList');
const coverageTrendChart = document.querySelector('#coverageTrendChart');
const businessTrendChart = document.querySelector('#businessTrendChart');
const heatmap = document.querySelector('#heatmap');
const rankingHint = document.querySelector('#rankingHint');
const heatmapHint = document.querySelector('#heatmapHint');
const institutionHint = document.querySelector('#institutionHint');
const institutionKpis = document.querySelector('#institutionKpis');
const institutionBars = document.querySelector('#institutionBars');
const institutionTrendChart = document.querySelector('#institutionTrendChart');

const CITY = '成都';
const CONCURRENCY = 2;
const amapJsonpBase = 'https://restapi.amap.com/v3';
let outputUrl = '';
let toastTimer = null;
let dashboardState = {
  rows: [],
  weeks: [],
  selectedWeek: '',
  selectedMetricId: 'coverage',
  selectedInstitution: '',
  source: '',
};

const metricDefinitions = [
  { id: 'coverage', label: '综合业务覆盖率', aliases: ['综合业务覆盖率', '综合业务指标'], kind: 'rate', target: 0.65 },
  { id: 'bill', label: '电票业务穿透率', aliases: ['电票业务穿透率', '电票业务渗透率'], kind: 'rate', target: 0.55 },
  { id: 'acquiring', label: '收单业务覆盖率', aliases: ['收单业务覆盖率', '收单业务渗透率'], kind: 'rate', target: 0.55 },
  { id: 'payroll', label: '代发工资业务覆盖率', aliases: ['代发工资业务覆盖率', '代发工资业务渗透率'], kind: 'rate', target: 0.5 },
  { id: 'stateBusiness', label: '国业业务穿透率', aliases: ['国业业务穿透率', '国业业务渗透率'], kind: 'rate', target: 0.45 },
  { id: 'highPenetration', label: '高渗透客户占比', aliases: ['高渗透客户占比', '高渗透客户户数占比'], kind: 'rate', target: 0.35 },
  { id: 'settlement', label: '对公结算业务', aliases: ['对公结算业务', '对公结算业务覆盖率', '对公结算渗透率'], kind: 'rate', target: 0.55 },
  { id: 'loan', label: '对公贷款业务', aliases: ['对公贷款业务', '对公贷款业务覆盖率', '对公贷款渗透率'], kind: 'rate', target: 0.4 },
  { id: 'contribution', label: '综合业务备款贡献度', aliases: ['综合业务备款贡献度', '综合业务备款贡献率', '综合业务存款贡献度'], kind: 'rate', target: 0.45 },
  { id: 'interest', label: '综合付息率', aliases: ['综合付息率'], kind: 'inverseRate', target: 0.018 },
  { id: 'keyCustomers', label: '重点客群数', aliases: ['重点客群数', '重点客群'], kind: 'count', target: 50 },
];

const businessTrendMetricIds = ['bill', 'acquiring', 'payroll', 'stateBusiness'];

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.classList.toggle('is-error', type === 'error');
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
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
  matcherView.classList.toggle('is-active', !isDashboard);
  dashboardView.classList.toggle('is-active', isDashboard);
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

function parseDashboardNumber(value, metric) {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '-' || raw === '--') return null;
  const isPercent = raw.includes('%');
  const normalized = raw.replace(/,/g, '').replace(/%/g, '').replace(/[^\d.-]/g, '');
  if (!normalized) return null;
  let number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  if (metric.kind !== 'count' && (isPercent || number > 1)) number /= 100;
  return number;
}

function formatDashboardValue(value, metric) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  if (metric.kind === 'count') return `${Math.round(value)}`;
  if (metric.id === 'interest') return `${(value * 100).toFixed(2)}%`;
  return `${(value * 100).toFixed(1)}%`;
}

function formatDelta(value, metric) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  if (metric.kind === 'count') return `${value >= 0 ? '+' : ''}${Math.round(value)}`;
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}pct`;
}

function valueForScore(value, metric) {
  if (value == null) return null;
  if (metric.kind === 'inverseRate') return Math.max(0, 1 - (value / Math.max(metric.target * 2, 0.01)));
  if (metric.kind === 'count') return Math.min(1, value / metric.target);
  return Math.max(0, Math.min(1, value));
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

function sortWeeks(weeks) {
  return [...weeks].sort((a, b) => {
    const rank = getWeekRank(a) - getWeekRank(b);
    return rank || String(a).localeCompare(String(b), 'zh-CN');
  });
}

function parseDashboardCsv(csvText, source = '上传文件') {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error('指标文件没有数据行');
  const header = rows[0];
  const institutionIndex = findHeaderIndex(header, ['机构', '机构名称', '网点', '支行']);
  if (institutionIndex === -1) throw new Error('指标文件缺少 机构 列');
  const weekIndex = findHeaderIndex(header, ['周次', '周', '统计周', '日期']);
  const metricColumns = metricDefinitions.map((metric) => ({
    metric,
    index: findHeaderIndex(header, metric.aliases),
  })).filter((item) => item.index !== -1);
  if (!metricColumns.length) throw new Error('指标文件没有可识别的指标列');

  const parsedRows = rows.slice(1).map((row) => {
    const institution = String(row[institutionIndex] || '').trim();
    if (!institution) return null;
    const metrics = {};
    for (const { metric, index } of metricColumns) {
      const value = parseDashboardNumber(row[index], metric);
      if (value != null) metrics[metric.id] = value;
    }
    return {
      week: weekIndex >= 0 ? String(row[weekIndex] || '').trim() || '本周' : '本周',
      institution,
      metrics,
    };
  }).filter(Boolean);

  if (!parsedRows.length) throw new Error('指标文件没有有效机构数据');
  return {
    rows: parsedRows,
    weeks: sortWeeks([...new Set(parsedRows.map((row) => row.week))]),
    source,
  };
}

function generateDashboardSample() {
  const institutions = ['机构A', '机构B', '机构C', '机构D', '机构E', '机构F', '机构G', '机构H', '机构I', '机构J'];
  const weeks = Array.from({ length: 8 }, (_, index) => `第${index + 1}周`);
  const rows = [];
  weeks.forEach((week, weekIndex) => {
    institutions.forEach((institution, institutionIndex) => {
      const base = 0.38 + institutionIndex * 0.035 + weekIndex * 0.018;
      const wave = Math.sin((institutionIndex + 1) * (weekIndex + 2)) * 0.025;
      rows.push({
        week,
        institution,
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
  return { rows, weeks, source: '模拟数据：8周 / 10机构' };
}

function availableMetrics(rows) {
  return metricDefinitions.filter((metric) => rows.some((row) => row.metrics[metric.id] != null));
}

function rowsForWeek(week) {
  return dashboardState.rows.filter((row) => row.week === week);
}

function previousWeekOf(week) {
  const index = dashboardState.weeks.indexOf(week);
  return index > 0 ? dashboardState.weeks[index - 1] : '';
}

function metricAverageForWeek(week, metricId) {
  return average(rowsForWeek(week).map((row) => row.metrics[metricId]));
}

function institutionMetricForWeek(week, institution, metricId) {
  return rowsForWeek(week).find((row) => row.institution === institution)?.metrics[metricId] ?? null;
}

function institutionNames() {
  return [...new Set(dashboardState.rows.map((row) => row.institution))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function metricById(metricId) {
  return metricDefinitions.find((metric) => metric.id === metricId);
}

function renderDashboardControls() {
  const metrics = availableMetrics(dashboardState.rows);
  const institutions = institutionNames();
  weekSelect.innerHTML = dashboardState.weeks.map((week) => (
    `<option value="${escapeHtml(week)}"${week === dashboardState.selectedWeek ? ' selected' : ''}>${escapeHtml(week)}</option>`
  )).join('');
  rankingMetricSelect.innerHTML = metrics.map((metric) => (
    `<option value="${metric.id}"${metric.id === dashboardState.selectedMetricId ? ' selected' : ''}>${escapeHtml(metric.label)}</option>`
  )).join('');
  institutionSelect.innerHTML = institutions.map((institution) => (
    `<option value="${escapeHtml(institution)}"${institution === dashboardState.selectedInstitution ? ' selected' : ''}>${escapeHtml(institution)}</option>`
  )).join('');
  weekSelect.disabled = dashboardState.weeks.length <= 1;
  rankingMetricSelect.disabled = metrics.length <= 1;
  institutionSelect.disabled = institutions.length <= 1;
  dashboardSource.textContent = dashboardState.source || '未载入数据';
}

function ensureDashboardSelections() {
  const weekRows = rowsForWeek(dashboardState.selectedWeek);
  if (!weekRows.some((row) => row.institution === dashboardState.selectedInstitution)) {
    dashboardState.selectedInstitution = weekRows[0]?.institution || institutionNames()[0] || '';
  }
}

function renderDashboardKpis() {
  const week = dashboardState.selectedWeek;
  const previousWeek = previousWeekOf(week);
  const latestRows = rowsForWeek(week);
  const coverageMetric = metricDefinitions.find((metric) => metric.id === 'coverage');
  const coverage = metricAverageForWeek(week, 'coverage');
  const previousCoverage = previousWeek ? metricAverageForWeek(previousWeek, 'coverage') : null;
  const coverageDelta = coverage != null && previousCoverage != null ? coverage - previousCoverage : null;
  const eligibleRows = latestRows.filter((row) => row.metrics.coverage != null);
  const reached = eligibleRows.filter((row) => row.metrics.coverage >= coverageMetric.target).length;
  const metricWeakness = availableMetrics(latestRows).map((metric) => ({
    metric,
    score: average(latestRows.map((row) => valueForScore(row.metrics[metric.id], metric))),
  })).filter((item) => item.score != null).sort((a, b) => a.score - b.score)[0];
  const topInstitution = latestRows
    .map((row) => ({ institution: row.institution, value: row.metrics.coverage }))
    .filter((item) => item.value != null)
    .sort((a, b) => b.value - a.value)[0];

  dashboardKpis.innerHTML = [
    [formatDashboardValue(coverage, coverageMetric), '综合业务覆盖率'],
    [formatDelta(coverageDelta, coverageMetric), previousWeek ? `较${previousWeek}` : '暂无环比'],
    [`${reached}/${eligibleRows.length || 0}`, '达标机构数'],
    [metricWeakness?.metric.label || '-', '最低短板指标'],
    [topInstitution ? `${topInstitution.institution} ${formatDashboardValue(topInstitution.value, coverageMetric)}` : '-', '覆盖率最高机构'],
  ].map(([value, label]) => `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`).join('');
}

function renderDashboardRanking() {
  const metric = metricById(dashboardState.selectedMetricId)
    || metricDefinitions[0];
  const keyCustomersMetric = metricById('keyCustomers');
  const week = dashboardState.selectedWeek;
  const previousWeek = previousWeekOf(week);
  const rows = rowsForWeek(week).map((row) => {
    const value = row.metrics[metric.id];
    const previous = previousWeek ? institutionMetricForWeek(previousWeek, row.institution, metric.id) : null;
    return {
      institution: row.institution,
      value,
      keyCustomers: row.metrics.keyCustomers ?? null,
      delta: value != null && previous != null ? value - previous : null,
    };
  }).filter((row) => row.value != null).sort((a, b) => {
    if (metric.kind === 'inverseRate') return a.value - b.value || a.institution.localeCompare(b.institution, 'zh-CN');
    return b.value - a.value || a.institution.localeCompare(b.institution, 'zh-CN');
  });

  rankingHint.textContent = `按${metric.label}`;
  if (!rows.length) {
    dashboardRankList.innerHTML = '<div class="empty-state">暂无排行数据</div>';
    return;
  }
  const maxScore = Math.max(...rows.map((row) => valueForScore(row.value, metric) || 0), 0.01);
  const topRows = rows.slice(0, 5);
  const bottomRows = rows.length > 5 ? rows.slice(-5) : [];
  const rankRowHtml = (row, index, markerText, markerClass = '') => {
    const score = valueForScore(row.value, metric) || 0;
    const width = Math.max(3, Math.round((score / maxScore) * 100));
    return `
      <div class="dashboard-rank-row">
        <span class="rank-marker ${markerClass}">${escapeHtml(markerText)}</span>
        <span class="rank-title" title="${escapeHtml(row.institution)}">${escapeHtml(row.institution)}</span>
        <span class="rank-track"><span style="width:${width}%"></span></span>
        <strong>${escapeHtml(formatDashboardValue(row.value, metric))}</strong>
        <span class="rank-key-customers">${escapeHtml(formatDashboardValue(row.keyCustomers, keyCustomersMetric))}</span>
        <em>${escapeHtml(formatDelta(row.delta, metric))}</em>
      </div>
    `;
  };
  const renderSection = (title, sectionRows, offset, markerClass) => {
    if (!sectionRows.length) return '';
    return `
      <div class="rank-section-title">${escapeHtml(title)}</div>
      ${sectionRows.map((row, index) => rankRowHtml(row, offset + index + 1, `${offset + index + 1}`, markerClass)).join('')}
    `;
  };
  dashboardRankList.innerHTML = [
    '<div class="rank-header"><span>排名</span><span>机构</span><span>表现</span><span>指标值</span><span>重点客户</span><span>环比</span></div>',
    renderSection('前五家', topRows, 0, 'is-top'),
    renderSection('后五家', bottomRows, Math.max(0, rows.length - bottomRows.length), 'is-bottom'),
  ].join('');
}

function linePoints(values, width, height, padding, min, max) {
  const range = Math.max(max - min, 0.01);
  return values.map((item, index) => {
    if (item.value == null) return null;
    const x = padding + (values.length === 1 ? 0 : (index / (values.length - 1)) * (width - padding * 2));
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean).join(' ');
}

function renderLineChart(container, series, emptyText, ariaLabel) {
  const validSeries = series.filter((item) => item.values.some((point) => point.value != null));
  if (!validSeries.length) {
    container.innerHTML = `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
    return;
  }
  const width = 680;
  const height = 220;
  const padding = 34;
  const allValues = validSeries.flatMap((item) => item.values.map((point) => point.value)).filter((value) => value != null);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const domainPadding = Math.max((max - min) * 0.12, 0.01);
  const domainMin = Math.max(0, min - domainPadding);
  const domainMax = max + domainPadding;
  const colors = ['#0f766e', '#2563eb', '#b45309', '#7c3aed'];
  const lines = validSeries.map((item, index) => {
    const points = linePoints(item.values, width, height, padding, domainMin, domainMax);
    return points ? `<polyline points="${points}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>` : '';
  }).join('');
  const xLabels = dashboardState.weeks.map((week, index) => {
    const x = padding + (dashboardState.weeks.length === 1 ? 0 : (index / (dashboardState.weeks.length - 1)) * (width - padding * 2));
    return `<text x="${x}" y="${height - 8}" text-anchor="middle">${escapeHtml(week)}</text>`;
  }).join('');
  const legend = validSeries.map((item, index) => (
    `<span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.label)}</span>`
  )).join('');
  container.innerHTML = `
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(ariaLabel)}">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="axis-line"></line>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="axis-line"></line>
      ${lines}
      ${xLabels}
    </svg>
    <div class="chart-legend">${legend}</div>
  `;
}

function renderTrendCharts() {
  const coverageMetric = metricById('coverage');
  renderLineChart(coverageTrendChart, [{
    label: coverageMetric.label,
    values: dashboardState.weeks.map((week) => ({ week, value: metricAverageForWeek(week, 'coverage') })),
  }], '暂无综合覆盖率趋势数据', '综合业务覆盖率趋势');

  const businessSeries = businessTrendMetricIds
    .map((id) => metricById(id))
    .filter((metric) => metric && dashboardState.rows.some((row) => row.metrics[metric.id] != null))
    .map((metric) => ({
      label: metric.label,
      values: dashboardState.weeks.map((week) => ({ week, value: metricAverageForWeek(week, metric.id) })),
    }));
  renderLineChart(businessTrendChart, businessSeries, '暂无分业务趋势数据', '分业务覆盖和穿透趋势');
}

function renderHeatmap() {
  const week = dashboardState.selectedWeek;
  const metrics = availableMetrics(rowsForWeek(week));
  const rows = rowsForWeek(week).sort((a, b) => {
    const aScore = average(metrics.map((metric) => valueForScore(a.metrics[metric.id], metric)));
    const bScore = average(metrics.map((metric) => valueForScore(b.metrics[metric.id], metric)));
    return (aScore ?? 0) - (bScore ?? 0);
  });
  heatmapHint.textContent = `${week}，低分优先`;
  if (!rows.length || !metrics.length) {
    heatmap.innerHTML = '<div class="empty-state">暂无热力图数据</div>';
    return;
  }
  const header = metrics.map((metric) => `<th>${escapeHtml(metric.label)}</th>`).join('');
  const body = rows.map((row) => {
    const cells = metrics.map((metric) => {
      const value = row.metrics[metric.id];
      const score = valueForScore(value, metric);
      const level = score == null ? 0 : Math.round(score * 100);
      return `<td><span class="heat-cell" style="--heat:${level}">${escapeHtml(formatDashboardValue(value, metric))}</span></td>`;
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

function renderSingleInstitution() {
  const week = dashboardState.selectedWeek;
  const institution = dashboardState.selectedInstitution;
  const row = rowsForWeek(week).find((item) => item.institution === institution);
  const previousWeek = previousWeekOf(week);
  const coverageMetric = metricById('coverage');
  const keyCustomersMetric = metricById('keyCustomers');
  institutionHint.textContent = institution ? `${institution} / ${week}` : '按所选机构';

  if (!row) {
    institutionKpis.innerHTML = [
      ['-', '综合业务覆盖率'],
      ['-', '覆盖率环比'],
      ['-', '重点客群数'],
      ['-', '最低短板指标'],
    ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
    institutionBars.innerHTML = '<div class="empty-state">暂无机构数据</div>';
    institutionTrendChart.innerHTML = '<div class="empty-state">暂无机构趋势数据</div>';
    return;
  }

  const coverage = row.metrics.coverage ?? null;
  const previousCoverage = previousWeek ? institutionMetricForWeek(previousWeek, institution, 'coverage') : null;
  const coverageDelta = coverage != null && previousCoverage != null ? coverage - previousCoverage : null;
  const weakness = availableMetrics([row]).map((metric) => ({
    metric,
    score: valueForScore(row.metrics[metric.id], metric),
  })).filter((item) => item.score != null).sort((a, b) => a.score - b.score)[0];

  institutionKpis.innerHTML = [
    [formatDashboardValue(coverage, coverageMetric), '综合业务覆盖率'],
    [formatDelta(coverageDelta, coverageMetric), previousWeek ? `较${previousWeek}` : '暂无环比'],
    [formatDashboardValue(row.metrics.keyCustomers, keyCustomersMetric), '重点客群数'],
    [weakness?.metric.label || '-', '最低短板指标'],
  ].map(([value, label]) => `<div><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`).join('');

  const barMetrics = metricDefinitions
    .filter((metric) => metric.id !== 'keyCustomers' && row.metrics[metric.id] != null)
    .map((metric) => ({
      metric,
      value: row.metrics[metric.id],
      score: valueForScore(row.metrics[metric.id], metric) ?? 0,
    }));
  institutionBars.innerHTML = barMetrics.map((item) => {
    const width = Math.max(3, Math.round(item.score * 100));
    return `
      <div class="institution-bar-row">
        <span>${escapeHtml(item.metric.label)}</span>
        <div class="rank-track"><span style="width:${width}%"></span></div>
        <strong>${escapeHtml(formatDashboardValue(item.value, item.metric))}</strong>
      </div>
    `;
  }).join('') || '<div class="empty-state">暂无业务指标</div>';

  renderLineChart(institutionTrendChart, [{
    label: `${institution} 综合业务覆盖率`,
    values: dashboardState.weeks.map((itemWeek) => ({
      week: itemWeek,
      value: institutionMetricForWeek(itemWeek, institution, 'coverage'),
    })),
  }], '暂无机构趋势数据', `${institution} 综合业务覆盖率趋势`);
}

function renderDashboard() {
  if (!dashboardState.rows.length) {
    dashboardKpis.innerHTML = [
      ['-', '综合业务覆盖率'],
      ['-', '暂无环比'],
      ['-', '达标机构数'],
      ['-', '最低短板指标'],
    ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
    dashboardRankList.innerHTML = '<div class="empty-state">上传 Excel/CSV 或生成模拟数据</div>';
    coverageTrendChart.innerHTML = '<div class="empty-state">暂无综合覆盖率趋势数据</div>';
    businessTrendChart.innerHTML = '<div class="empty-state">暂无分业务趋势数据</div>';
    institutionKpis.innerHTML = [
      ['-', '综合业务覆盖率'],
      ['-', '覆盖率环比'],
      ['-', '重点客群数'],
      ['-', '最低短板指标'],
    ].map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
    institutionBars.innerHTML = '<div class="empty-state">暂无机构数据</div>';
    institutionTrendChart.innerHTML = '<div class="empty-state">暂无机构趋势数据</div>';
    heatmap.innerHTML = '<div class="empty-state">暂无热力图数据</div>';
    dashboardSource.textContent = '未载入数据';
    weekSelect.innerHTML = '<option>暂无数据</option>';
    rankingMetricSelect.innerHTML = '<option>暂无指标</option>';
    institutionSelect.innerHTML = '<option>暂无机构</option>';
    weekSelect.disabled = true;
    rankingMetricSelect.disabled = true;
    institutionSelect.disabled = true;
    return;
  }
  ensureDashboardSelections();
  renderDashboardControls();
  renderDashboardKpis();
  renderDashboardRanking();
  renderTrendCharts();
  renderSingleInstitution();
  renderHeatmap();
}

function loadDashboardData(dataset) {
  const metrics = availableMetrics(dataset.rows);
  const institutions = [...new Set(dataset.rows.map((row) => row.institution))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
  dashboardState = {
    rows: dataset.rows,
    weeks: dataset.weeks,
    selectedWeek: dataset.weeks[dataset.weeks.length - 1] || '',
    selectedMetricId: metrics.some((metric) => metric.id === dashboardState.selectedMetricId)
      ? dashboardState.selectedMetricId
      : metrics[0]?.id || 'coverage',
    selectedInstitution: institutions.includes(dashboardState.selectedInstitution)
      ? dashboardState.selectedInstitution
      : institutions[0] || '',
    source: dataset.source,
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

dashboardFileInput.addEventListener('change', async () => {
  try {
    const csvText = await readSelectedTableFile(dashboardFileInput);
    if (!csvText) return;
    loadDashboardData(parseDashboardCsv(csvText, `上传文件：${dashboardFileInput.files?.[0]?.name || ''}`));
    showToast('指标数据已载入');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

sampleDashboardButton.addEventListener('click', () => {
  loadDashboardData(generateDashboardSample());
  showToast('已生成模拟指标数据');
});

weekSelect.addEventListener('change', () => {
  dashboardState.selectedWeek = weekSelect.value;
  renderDashboard();
});

rankingMetricSelect.addEventListener('change', () => {
  dashboardState.selectedMetricId = rankingMetricSelect.value;
  renderDashboard();
});

institutionSelect.addEventListener('change', () => {
  dashboardState.selectedInstitution = institutionSelect.value;
  renderDashboard();
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
renderDashboard();

if (window.desktopRuntime?.isDesktop) {
  privacyStatus.textContent = `桌面端 ${window.desktopRuntime.platform}`;
  document.body.classList.add('is-desktop');
}
