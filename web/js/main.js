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

const resultsCard = document.getElementById('results');
const preTaxEl = document.getElementById('preTax');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');

function addTaskRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>
      <select class="form-select form-select-sm">
        ${Object.keys(calc.hourlyRates)
          .map((k) => `<option value="${k}">${k}</option>`) 
          .join('')}
      </select>
    </td>
    <td><input type="number" min="0" step="0.5" class="form-control form-control-sm" value="1" /></td>
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
  tr.querySelector('button').addEventListener('click', () => tr.remove());
  tasksTbody.appendChild(tr);
}

addTaskBtn?.addEventListener('click', addTaskRow);
// add a default row
addTaskRow();

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

function showResults(quote) {
  preTaxEl.textContent = String(quote.稅前總計);
  taxEl.textContent = String(quote.營業稅);
  totalEl.textContent = String(quote.含稅總計);
  resultsCard.classList.remove('d-none');
}

document.getElementById('calcBtn')?.addEventListener('click', () => {
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
});

document.getElementById('exportBtn')?.addEventListener('click', () => {
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
  exportQuoteToXlsx(quote);
});

