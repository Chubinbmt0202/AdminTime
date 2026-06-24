import * as XLSX from 'xlsx';

/**
 * Export an array of objects to an Excel file
 * @param data Array of objects containing the row data
 * @param fileName Name of the exported file (without extension)
 */
export const xuatRaExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns (basic implementation)
  const colWidths = Object.keys(data[0]).map((key) => {
    return {
      wch: Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      ) + 2 // Add some padding
    };
  });
  worksheet['!cols'] = colWidths;

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Export multiple sheets to a single Excel file
 * @param sheets Array of sheet objects containing the sheet name and its row data array
 * @param fileName Name of the exported file (without extension)
 */
export const xuatBaoCaoNhieuSheet = (
  sheets: { name: string; data: any[] }[],
  fileName: string
) => {
  if (!sheets || sheets.length === 0) {
    console.warn('No sheets to export');
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    let worksheet;
    if (!data || data.length === 0) {
      // Empty sheet placeholder
      worksheet = XLSX.utils.json_to_sheet([{ 'Thông tin': 'Không có dữ liệu' }]);
    } else {
      worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns (basic implementation)
      const colWidths = Object.keys(data[0]).map((key) => {
        return {
          wch: Math.max(
            key.length,
            ...data.map((row) => (row[key] ? row[key].toString().length : 0))
          ) + 2 // Add some padding
        };
      });
      worksheet['!cols'] = colWidths;
    }

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

