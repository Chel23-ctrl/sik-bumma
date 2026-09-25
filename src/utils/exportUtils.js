import * as XLSX from 'xlsx';

/**
 * Universal Excel Exporter for SIK-BUMMA / ARVEA
 * Exports JSON array data to a real .xlsx spreadsheet file
 */
export const exportToExcel = (data, fileName = 'Laporan_BUMKam', sheetName = 'Sheet1') => {
  try {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Excel limits sheet name to 31 chars

    const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '_') + '.xlsx';
    XLSX.writeFile(wb, safeFileName);
  } catch (error) {
    console.error('Export Excel failed:', error);
    alert('Gagal mengekspor file Excel: ' + error.message);
  }
};

/**
 * Safe Print Helper
 */
export const triggerPrint = () => {
  window.print();
};
