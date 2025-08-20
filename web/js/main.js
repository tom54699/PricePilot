import { PriceCalculator } from './calculator.js';
import { exportQuoteToXlsx } from './export.js';

const calc = new PriceCalculator();

// 自訂類型（僅標題）設定
const TYPE_KEY = 'pricepilot_types_v1';
function loadTypes() {
  try {
    const raw = localStorage.getItem(TYPE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr;
      // guard against empty stored list
    }
  } catch {}
  const defaults = Object.keys(calc.hourlyRates || {});
  return defaults.length ? defaults : ['一般'];
}
function saveTypes(types) {
  localStorage.setItem(TYPE_KEY, JSON.stringify(types));
}
let typeLabels = loadTypes();
function setTypeMsg(msg, isError = false) {
  const el = document.getElementById('typeMsg');
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('text-danger', !!isError);
}

function renderTypeManager() {
  const listEl = document.getElementById('typeList');
  if (!listEl) return;
  listEl.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'list-group list-group-flush';
  typeLabels.forEach((label, idx) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between';
    const left = document.createElement('div');
    left.className = 'd-flex align-items-center gap-2 flex-wrap';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'fw-medium';
    nameSpan.textContent = label;

    left.appendChild(nameSpan);

    const right = document.createElement('div');
    right.className = 'btn-group btn-group-sm';

    const upBtn = document.createElement('button');
    upBtn.className = 'btn btn-outline-secondary';
    upBtn.innerHTML = '▲';
    upBtn.title = '上移';
    upBtn.disabled = idx === 0;
    upBtn.addEventListener('click', () => {
      if (idx === 0) return;
      const [m] = typeLabels.splice(idx, 1);
      typeLabels.splice(idx - 1, 0, m);
      saveTypes(typeLabels);
      renderTypeManager();
      refreshTaskTypeSelects();
      setTypeMsg('已重新排序並套用');
    });

    const downBtn = document.createElement('button');
    downBtn.className = 'btn btn-outline-secondary';
    downBtn.innerHTML = '▼';
    downBtn.title = '下移';
    downBtn.disabled = idx === typeLabels.length - 1;
    downBtn.addEventListener('click', () => {
      if (idx === typeLabels.length - 1) return;
      const [m] = typeLabels.splice(idx, 1);
      typeLabels.splice(idx + 1, 0, m);
      saveTypes(typeLabels);
      renderTypeManager();
      refreshTaskTypeSelects();
      setTypeMsg('已重新排序並套用');
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline-primary';
    editBtn.textContent = '編輯';
    editBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.className = 'form-control form-control-sm';
      input.style.maxWidth = '240px';
      input.value = label;
      nameSpan.replaceWith(input);
      input.focus();
      const save = () => {
        const v = input.value.trim();
        if (!v) {
          setTypeMsg('名稱不可為空', true);
          return;
        }
        if (typeLabels.includes(v) && v !== label) {
          setTypeMsg('名稱已存在', true);
          return;
        }
        typeLabels[idx] = v;
        saveTypes(typeLabels);
        renderTypeManager();
        refreshTaskTypeSelects();
        setTypeMsg('已更新類型名稱並套用');
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') renderTypeManager();
      });
      input.addEventListener('blur', save);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-outline-danger';
    delBtn.textContent = '刪除';
    delBtn.addEventListener('click', () => {
      if (!confirm(`確定刪除類型「${label}」？`)) return;
      typeLabels.splice(idx, 1);
      if (typeLabels.length === 0) typeLabels = ['一般'];
      saveTypes(typeLabels);
      renderTypeManager();
      refreshTaskTypeSelects();
      setTypeMsg('已刪除類型並套用');
    });

    right.appendChild(upBtn);
    right.appendChild(downBtn);
    right.appendChild(editBtn);
    right.appendChild(delBtn);
    li.appendChild(left);
    li.appendChild(right);
    ul.appendChild(li);
  });
  listEl.appendChild(ul);
}

function wireTypeAdd() {
  const addBtn = document.getElementById('addTypeBtn');
  const input = document.getElementById('newTypeInput');
  const resetBtn = document.getElementById('resetTypesBtn');
  if (addBtn && input) {
    const add = () => {
      const name = input.value.trim();
      if (!name) return setTypeMsg('請輸入類型名稱', true);
      if (typeLabels.includes(name)) return setTypeMsg('名稱已存在', true);
      typeLabels.push(name);
      saveTypes(typeLabels);
      renderTypeManager();
      refreshTaskTypeSelects();
      input.value = '';
      setTypeMsg('已新增類型並套用');
    };
    addBtn.addEventListener('click', add);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') add();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('確定要重設為預設類型？')) return;
      const defaults = Object.keys(calc.hourlyRates || {});
      typeLabels = defaults.length ? defaults : ['一般'];
      saveTypes(typeLabels);
      renderTypeManager();
      refreshTaskTypeSelects();
      setTypeMsg('已重設為預設');
    });
  }
}

function refreshTaskTypeSelects() {
  const rows = tasksTbody.querySelectorAll('tr');
  rows.forEach((tr) => {
    const typeSel = tr.querySelector('td:first-child select');
    if (!typeSel) return;
    const current = typeSel.value;
    typeSel.innerHTML = typeLabels.map((k) => `<option value="${k}">${k}</option>`).join('');
    if (typeLabels.includes(current)) {
      typeSel.value = current;
    } else if (typeLabels.length) {
      typeSel.value = typeLabels[0];
    }
  });
}

// 複雜度/風險 倍率設定（持久化 + 自動套用）
const CM_KEY = 'pricepilot_complexity_v1';
const RM_KEY = 'pricepilot_risk_v1';
function loadMap(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...fallback };
}
function saveMap(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

let complexityMap = loadMap(CM_KEY, calc.complexityMultiplier);
let riskMap = loadMap(RM_KEY, calc.riskMultiplier);
// apply on startup
calc.complexityMultiplier = { ...complexityMap };
calc.riskMultiplier = { ...riskMap };

function renderMapList(containerId, obj, { step = '0.1' } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'table table-sm align-middle';
  const tbody = document.createElement('tbody');
  Object.entries(obj).forEach(([name, val]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="w-50"><input class="form-control form-control-sm" value="${name}" /></td>
      <td class="w-25"><input type="number" step="${step}" min="0" class="form-control form-control-sm" value="${val}" /></td>
      <td class="w-25 text-end"><button class="btn btn-sm btn-outline-danger">刪除</button></td>
    `;
    const [nameInput, valueInput] = tr.querySelectorAll('input');
    const delBtn = tr.querySelector('button');
    nameInput.addEventListener('change', () => {
      const newName = nameInput.value.trim();
      if (!newName || newName === name) return;
      if (Object.prototype.hasOwnProperty.call(obj, newName)) return; // duplicate, ignore
      const currentVal = obj[name];
      delete obj[name];
      obj[newName] = Number(valueInput.value || currentVal);
      calc.complexityMultiplier = { ...complexityMap };
      calc.riskMultiplier = { ...riskMap };
      saveMap(containerId === 'complexityList' ? CM_KEY : RM_KEY, obj);
      renderAllMaps();
      refreshCRSelects();
      recalc();
    });
    valueInput.addEventListener('input', () => {
      obj[name] = Number(valueInput.value || 0);
      calc.complexityMultiplier = { ...complexityMap };
      calc.riskMultiplier = { ...riskMap };
      saveMap(containerId === 'complexityList' ? CM_KEY : RM_KEY, obj);
      recalc();
    });
    delBtn.addEventListener('click', () => {
      if (!confirm(`刪除「${name}」？`)) return;
      delete obj[name];
      calc.complexityMultiplier = { ...complexityMap };
      calc.riskMultiplier = { ...riskMap };
      saveMap(containerId === 'complexityList' ? CM_KEY : RM_KEY, obj);
      renderAllMaps();
      refreshCRSelects();
      recalc();
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function refreshCRSelects() {
  const rows = tasksTbody.querySelectorAll('tr');
  rows.forEach((tr) => {
    const compSel = tr.querySelector('td:nth-child(3) select');
    const riskSel = tr.querySelector('td:nth-child(4) select');
    if (compSel) {
      const compCurrent = compSel.value;
      compSel.innerHTML = Object.keys(complexityMap)
        .map((k) => `<option value="${k}">${k}</option>`)
        .join('');
      if (Object.prototype.hasOwnProperty.call(complexityMap, compCurrent)) compSel.value = compCurrent;
    }
    if (riskSel) {
      const riskCurrent = riskSel.value;
      riskSel.innerHTML = Object.keys(riskMap)
        .map((k) => `<option value="${k}">${k}</option>`)
        .join('');
      if (Object.prototype.hasOwnProperty.call(riskMap, riskCurrent)) riskSel.value = riskCurrent;
    }
  });
}

function renderAllMaps() {
  renderMapList('complexityList', complexityMap, { step: '0.1' });
  renderMapList('riskList', riskMap, { step: '0.1' });
}

function wireMapAdders() {
  const cxName = document.getElementById('newComplexityName');
  const cxVal = document.getElementById('newComplexityValue');
  const cxBtn = document.getElementById('addComplexityBtn');
  const rkName = document.getElementById('newRiskName');
  const rkVal = document.getElementById('newRiskValue');
  const rkBtn = document.getElementById('addRiskBtn');
  const add = (kind) => {
    const isCx = kind === 'cx';
    const nameEl = isCx ? cxName : rkName;
    const valEl = isCx ? cxVal : rkVal;
    const map = isCx ? complexityMap : riskMap;
    const key = isCx ? CM_KEY : RM_KEY;
    const name = nameEl.value.trim();
    const value = Number(valEl.value || 0);
    if (!name) return;
    if (Object.prototype.hasOwnProperty.call(map, name)) return;
    map[name] = value;
    saveMap(key, map);
    calc.complexityMultiplier = { ...complexityMap };
    calc.riskMultiplier = { ...riskMap };
    renderAllMaps();
    refreshCRSelects();
    recalc();
    nameEl.value = '';
    valEl.value = '';
  };
  if (cxBtn) cxBtn.addEventListener('click', () => add('cx'));
  if (rkBtn) rkBtn.addEventListener('click', () => add('rk'));
}

const tasksTbody = document.querySelector('#tasksTable tbody');
const addTaskBtn = document.getElementById('addTask');
const projectNameEl = document.getElementById('projectName');
const clientNameEl = document.getElementById('clientName');
const hostingEl = document.getElementById('hosting');
const domainEl = document.getElementById('domain');
const maintenanceEl = document.getElementById('maintenance');
const formEl = document.getElementById('quote-form');

const resultsCard = document.getElementById('results');
const preTaxEl = document.getElementById('preTax');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const saveStatusEl = document.getElementById('saveStatus');
const exportBtn = document.getElementById('exportBtn');

const DRAFT_KEY = 'pricepilot_draft_v1';
let saveTimer = null;

function setSaveStatus(msg) {
  if (saveStatusEl) saveStatusEl.textContent = msg || '';
}

function addTaskRow(prefill) {
  const tr = document.createElement('tr');
  const options = (typeLabels && typeLabels.length ? typeLabels : ['一般']);
  tr.innerHTML = `
    <td>
      <select class="form-select form-select-sm">
        ${options.map((k) => `<option value="${k}">${k}</option>`).join('')}
      </select>
    </td>
    <td>
      <input type="number" min="0" step="0.5" class="form-control form-control-sm" value="1" required />
      <div class="invalid-feedback">工時需為非負數</div>
    </td>
    <td>
      <select class="form-select form-select-sm">
        ${Object.keys(calc.complexityMultiplier)
          .map((k) => `<option value="${k}">${k}</option>`)
          .join('')}
      </select>
    </td>
    <td>
      <select class="form-select form-select-sm">
        ${Object.keys(calc.riskMultiplier)
          .map((k) => `<option value="${k}">${k}</option>`)
          .join('')}
      </select>
    </td>
    <td><input type="text" class="form-control form-control-sm" placeholder="描述" /></td>
    <td><button type="button" class="btn btn-sm btn-outline-danger">刪除</button></td>
  `;
  tr.querySelector('button').addEventListener('click', () => {
    tr.remove();
    recalc();
    scheduleSave();
  });
  tr.querySelectorAll('input, select').forEach((el) => {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
    el.addEventListener('input', scheduleSave);
    el.addEventListener('change', scheduleSave);
  });
  tasksTbody.appendChild(tr);

  if (prefill) {
    const [typeSel, hoursInput, compSel, riskSel, descInput] = tr.querySelectorAll('select, input');
    if (prefill.type) typeSel.value = prefill.type;
    if (typeof prefill.hours !== 'undefined') hoursInput.value = prefill.hours;
    if (prefill.complexity) compSel.value = prefill.complexity;
    if (prefill.risk) riskSel.value = prefill.risk;
    if (prefill.description) descInput.value = prefill.description;
  } else {
    // set default selection to first option
    const typeSel = tr.querySelector('td:first-child select');
    if (typeSel && options.length) typeSel.value = options[0];
  }
}

addTaskBtn?.addEventListener('click', addTaskRow);
// add a default row
addTaskRow();
setSaveStatus('尚未儲存草稿');
renderTypeManager();
wireTypeAdd();
renderAllMaps();
wireMapAdders();
refreshCRSelects();

function collectTasks() {
  const rows = tasksTbody.querySelectorAll('tr');
  const tasks = [];
  rows.forEach((tr) => {
    const [typeSel, hoursInput, compSel, riskSel, descInput] = tr.querySelectorAll('select, input');
    tasks.push({
      type: typeSel.value,
      hours: Number(hoursInput.value || 0),
      complexity: compSel.value,
      risk: riskSel.value,
      description: descInput.value || '',
    });
  });
  return tasks;
}

function serializeForm() {
  return {
    projectName: projectNameEl.value.trim(),
    clientName: clientNameEl.value.trim(),
    tasks: collectTasks(),
    extras: {
      主機費用: Number(hostingEl.value || 0),
      網域費用: Number(domainEl.value || 0),
      維護費用: Number(maintenanceEl.value || 0),
    },
  };
}

function populateForm(data) {
  if (!data) return;
  projectNameEl.value = data.projectName || '';
  clientNameEl.value = data.clientName || '';
  hostingEl.value = data.extras?.主機費用 ?? 0;
  domainEl.value = data.extras?.網域費用 ?? 0;
  maintenanceEl.value = data.extras?.維護費用 ?? 0;

  // rebuild tasks
  tasksTbody.innerHTML = '';
  (data.tasks || []).forEach((t) => addTaskRow(t));
}

function saveDraft() {
  try {
    const payload = serializeForm();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    setSaveStatus(`草稿已儲存 ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    // ignore
  }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 500);
}

function setInvalid(el, invalid) {
  if (!el) return;
  el.classList.toggle('is-invalid', !!invalid);
}

// 時薪設定（基本時薪 / 加班倍率）與月薪推導
const SALARY_KEY = 'pricepilot_salary_v1';
function loadSalary() {
  try {
    const raw = localStorage.getItem(SALARY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { baseHourly: calc.baseHourlyRate, otMultiplier: calc.otMultiplier, monthly: '', days: 22 };
}
function saveSalary(obj) {
  localStorage.setItem(SALARY_KEY, JSON.stringify(obj));
}
const salary = loadSalary();
const monthlyInput = document.getElementById('monthlySalary');
const daysInput = document.getElementById('avgWorkDays');
const baseHourlyInput = document.getElementById('baseHourly');
const otMulInput = document.getElementById('otMultiplier');

function applySalaryToCalc() {
  const base = Number(baseHourlyInput.value || salary.baseHourly || 0);
  const otm = Number(otMulInput.value || salary.otMultiplier || 1);
  const effective = Math.round(base * otm * 100) / 100;
  // 將加班倍率算進時薪
  calc.baseHourlyRate = effective;
  calc.otMultiplier = 1;
  const previewHeader = document.getElementById('salaryHeaderPreview');
  if (previewHeader) previewHeader.textContent = `有效時薪：${effective}`;
  saveSalary({
    baseHourly: base,
    otMultiplier: otm,
    monthly: Number(monthlyInput.value || 0),
    days: Number(daysInput.value || 22),
  });
  recalc();
}

function deriveBaseHourly() {
  const monthly = Number(monthlyInput.value || 0);
  const days = Math.max(1, Number(daysInput.value || 22));
  if (monthly > 0) {
    const hourly = Math.round((monthly / days / 8) * 100) / 100;
    baseHourlyInput.value = String(hourly);
  }
  applySalaryToCalc();
}

// initialize salary UI
if (monthlyInput) monthlyInput.value = salary.monthly || '';
if (daysInput) daysInput.value = salary.days || 22;
if (baseHourlyInput) baseHourlyInput.value = salary.baseHourly ?? calc.baseHourlyRate;
if (otMulInput) otMulInput.value = salary.otMultiplier ?? calc.otMultiplier;
applySalaryToCalc();

monthlyInput?.addEventListener('input', deriveBaseHourly);
daysInput?.addEventListener('input', deriveBaseHourly);
baseHourlyInput?.addEventListener('input', applySalaryToCalc);
otMulInput?.addEventListener('input', applySalaryToCalc);

function validateForm() {
  let valid = true;

  if (!projectNameEl.value.trim()) {
    setInvalid(projectNameEl, true);
    valid = false;
  } else setInvalid(projectNameEl, false);

  if (!clientNameEl.value.trim()) {
    setInvalid(clientNameEl, true);
    valid = false;
  } else setInvalid(clientNameEl, false);

  [hostingEl, domainEl, maintenanceEl].forEach((el) => {
    const v = Number(el.value);
    const ok = Number.isFinite(v) && v >= 0;
    setInvalid(el, !ok);
    if (!ok) valid = false;
  });

  tasksTbody.querySelectorAll('tr').forEach((tr) => {
    const hoursInput = tr.querySelector('input[type="number"]');
    const v = Number(hoursInput.value);
    const ok = Number.isFinite(v) && v >= 0;
    setInvalid(hoursInput, !ok);
    if (!ok) valid = false;
  });

  formEl?.classList.add('was-validated');
  return { valid };
}

function showResults(quote) {
  preTaxEl.textContent = String(quote.稅前總計);
  taxEl.textContent = String(quote.營業稅);
  totalEl.textContent = String(quote.含稅總計);
  resultsCard.classList.remove('d-none');
}

function recalc() {
  const { valid } = validateForm();
  if (!valid) {
    resultsCard.classList.add('d-none');
    return;
  }
  const quote = calc.createQuote(
    projectNameEl.value.trim(),
    clientNameEl.value.trim(),
    collectTasks(),
    {
      主機費用: Number(hostingEl.value || 0),
      網域費用: Number(domainEl.value || 0),
      維護費用: Number(maintenanceEl.value || 0),
    }
  );
  showResults(quote);
}

document.getElementById('calcBtn')?.addEventListener('click', recalc);

function setLoading(btn, on) {
  if (!btn) return;
  if (on) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>匯出中…';
  } else {
    btn.disabled = false;
    if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
  }
}

document.getElementById('exportBtn')?.addEventListener('click', () => {
  const { valid } = validateForm();
  if (!valid) return;
  setLoading(exportBtn, true);
  const quote = calc.createQuote(
    projectNameEl.value.trim(),
    clientNameEl.value.trim(),
    collectTasks(),
    {
      主機費用: Number(hostingEl.value || 0),
      網域費用: Number(domainEl.value || 0),
      維護費用: Number(maintenanceEl.value || 0),
    }
  );
  try {
    exportQuoteToXlsx(quote);
  } finally {
    setTimeout(() => setLoading(exportBtn, false), 300);
  }
});

// live recalculation for top-level fields
[projectNameEl, clientNameEl, hostingEl, domainEl, maintenanceEl].forEach((el) => {
  el?.addEventListener('input', recalc);
  el?.addEventListener('change', recalc);
});

// initial compute
recalc();

// load draft if available
try {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    populateForm(data);
    setSaveStatus('已載入草稿');
    recalc();
  }
} catch (e) {
  // ignore invalid JSON
}
