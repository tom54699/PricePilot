import { PriceCalculator } from './calculator.js';
import { exportQuoteToXlsx } from './export.js';

const calc = new PriceCalculator();

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
  tr.innerHTML = `
    <td>
      <select class="form-select form-select-sm">
        ${Object.keys(calc.hourlyRates)
          .map((k) => `<option value="${k}">${k}</option>`)
          .join('')}
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
  }
}

addTaskBtn?.addEventListener('click', addTaskRow);
// add a default row
addTaskRow();
setSaveStatus('尚未儲存草稿');

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
