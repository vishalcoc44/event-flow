/**
 * Exports data to a CSV file and triggers a download
 */
export const exportToCsv = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  const csvContent = [
    keys.join(separator),
    ...rows.map(row => 
      keys.map(key => {
        const cell = (row as any)[key] === null || (row as any)[key] === undefined ? '' : (row as any)[key];
        const cellString = String(cell).replace(/"/g, '""');
        if (cellString.search(/("|,|\n)/g) >= 0) {
          return `"${cellString}"`;
        }
        return cellString;
      }).join(separator)
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
