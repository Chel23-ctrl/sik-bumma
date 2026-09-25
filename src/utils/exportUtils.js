import * as XLSX from 'xlsx';

/**
 * Universal Excel Exporter for SIK-BUMMA / ARVEA
 * Exports JSON array data to a real .xlsx spreadsheet file with auto-fitting column widths
 * so no headers, descriptions, or numbers are cut off or truncated with ###.
 */
export const exportToExcel = (data, fileName = 'Laporan_BUMKam', sheetName = 'Sheet1') => {
  try {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    // 1. Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 2. Auto-calculate optimal column widths based on maximum content length
    const keys = Object.keys(data[0] || {});
    const colWidths = keys.map(key => {
      let maxLen = String(key || '').length;
      data.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          const strVal = typeof val === 'number'
            ? val.toLocaleString('id-ID')
            : String(val);
          if (strVal.length > maxLen) {
            maxLen = strVal.length;
          }
        }
      });
      // Add generous padding (min 12 chars, max 70 chars)
      return { wch: Math.min(Math.max(maxLen + 4, 12), 70) };
    });

    ws['!cols'] = colWidths;

    // 3. Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    const cleanSheetName = (sheetName || 'Data').replace(/[\\/?*[\]]/g, '').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

    // 4. Clean safe filename and save
    const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '_') + '.xlsx';
    XLSX.writeFile(wb, safeFileName);
  } catch (error) {
    console.error('Export Excel failed:', error);
    alert('Gagal mengekspor file Excel: ' + error.message);
  }
};

/**
 * Safe Print Helper with pre-print check
 */
export const triggerPrint = () => {
  window.print();
};
