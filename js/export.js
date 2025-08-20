/* global XLSX */
// Excel export using SheetJS. Expects a `quote` object from calculator.createQuote

export function exportQuoteToXlsx(quote, filename) {
  if (typeof XLSX === 'undefined') throw new Error('SheetJS (XLSX) not available');

  const wb = XLSX.utils.book_new();

  // Summary sheet (摘要)
  const summaryRows = [];
  summaryRows.push(['專案名稱', quote?.專案名稱 || '']);
  summaryRows.push(['客戶名稱', quote?.客戶名稱 || '']);
  summaryRows.push(['報價日期', quote?.報價日期 || '']);
  summaryRows.push([]);
  summaryRows.push(['開發小計', quote?.開發小計 || 0]);
  const extras = quote?.額外費用 || {};
  summaryRows.push(['額外費用小計', extras?.額外費用小計 || 0]);
  for (const [k, v] of Object.entries(extras)) {
    if (k === '額外費用小計') continue;
    summaryRows.push([k, v]);
  }
  summaryRows.push([]);
  summaryRows.push(['稅前總計', quote?.稅前總計 || 0]);
  summaryRows.push(['營業稅', quote?.營業稅 || 0]);
  summaryRows.push(['含稅總計', quote?.含稅總計 || 0]);
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, '摘要');

  // Details sheet (詳細項目)
  const detailRows = [
    ['任務類型', '工時', '複雜度', '風險等級', '基礎時薪', '調整後時薪', '小計', '描述'],
  ];
  for (const it of quote?.報價項目 || []) {
    detailRows.push([
      it.任務類型 || '',
      it.工時 || 0,
      it.複雜度 || '',
      it.風險等級 || '',
      it.基礎時薪 || 0,
      it.調整後時薪 || 0,
      it.小計 || 0,
      it.描述 || '',
    ]);
  }
  const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, wsDetail, '詳細項目');

  const out = filename || `quote_${quote?.專案名稱 || 'project'}_${quote?.報價日期 || ''}.xlsx`;
  XLSX.writeFile(wb, out);
  return out;
}

if (typeof window !== 'undefined') window.exportQuoteToXlsx = exportQuoteToXlsx;

