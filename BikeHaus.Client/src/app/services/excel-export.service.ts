import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  /**
   * Export data to Excel file with proper formatting
   * @param data Array of objects to export
   * @param filename Name of the file (without extension)
   * @param columns Column configuration: { key: string, header: string }[]
   */
  exportToExcel<T>(
    data: T[],
    filename: string,
    columns: { key: keyof T | string; header: string }[],
  ): void {
    if (!data || data.length === 0) {
      alert('Keine Daten zum Exportieren vorhanden');
      return;
    }

    // Prepare data array with headers
    const headers = columns.map((col) => col.header);
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = this.getNestedValue(item, col.key as string);
        return this.formatValue(value);
      }),
    );

    // Create worksheet data
    const wsData = [headers, ...rows];

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

    // Calculate column widths based on content
    const colWidths = columns.map((col, idx) => {
      // Start with header length
      let maxWidth = col.header.length;

      // Check each row for this column
      rows.forEach((row) => {
        const cellValue = row[idx];
        const cellLength = cellValue ? String(cellValue).length : 0;
        if (cellLength > maxWidth) {
          maxWidth = cellLength;
        }
      });

      // Add some padding and cap at reasonable max
      return { wch: Math.min(maxWidth + 3, 50) };
    });

    ws['!cols'] = colWidths;

    // Style header row (bold) - Note: xlsx library has limited styling support
    // The column widths are the main improvement

    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daten');

    // Generate file and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${this.getDateString()}.xlsx`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  private formatValue(value: any): string {
    if (value == null) return '';
    if (value instanceof Date) {
      return this.formatDate(value);
    }
    if (typeof value === 'number') {
      return value.toString().replace('.', ','); // German decimal format
    }
    if (typeof value === 'boolean') {
      return value ? 'Ja' : 'Nein';
    }
    return String(value);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private getDateString(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${year}${month}${day}`;
  }
}
