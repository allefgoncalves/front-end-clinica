export function downloadCsv(filename, rows) {
  if (typeof document === 'undefined') return;
  const headers = Object.keys(rows[0] || {});
  const csv = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const text = String(value).replaceAll('"', '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}
