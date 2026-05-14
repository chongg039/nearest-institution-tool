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

const CITY = '成都';
const CONCURRENCY = 2;
const amapJsonpBase = 'https://restapi.amap.com/v3';
let outputUrl = '';
let toastTimer = null;

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

toggleKeyButton.addEventListener('click', () => {
  const visible = amapKeyInput.type === 'text';
  amapKeyInput.type = visible ? 'password' : 'text';
  toggleKeyButton.textContent = visible ? '显示' : '隐藏';
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

if (window.desktopRuntime?.isDesktop) {
  privacyStatus.textContent = `桌面端 ${window.desktopRuntime.platform}`;
  document.body.classList.add('is-desktop');
}
