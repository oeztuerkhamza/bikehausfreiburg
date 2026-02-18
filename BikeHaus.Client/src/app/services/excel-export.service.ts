import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  /**
   * Export data to CSV file (Excel compatible)
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

    // Build CSV content with BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const separator = ';'; // Use semicolon for better Excel compatibility in German locale

    // Headers
    const headers = columns
      .map((col) => this.escapeCSV(col.header))
      .join(separator);

    // Rows
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const value = this.getNestedValue(item, col.key as string);
          return this.escapeCSV(this.formatValue(value));
        })
        .join(separator),
    );

    const csvContent = BOM + headers + '\n' + rows.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${this.getDateString()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private escapeCSV(value: string): string {
    if (value == null) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains separator, quote, or newline
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
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
