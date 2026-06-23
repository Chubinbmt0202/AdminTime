import * as XLSX from 'xlsx';

/**
 * Export an array of objects to an Excel file
 * @param data Array of objects containing the row data
 * @param fileName Name of the exported file (without extension)
 */
export const exportToExcel = (data: any[], fileName: string) => {
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
