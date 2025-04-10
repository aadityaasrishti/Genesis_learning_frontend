import jsPDF from "jspdf";
import "jspdf-autotable";
import { saveAs } from "file-saver";

export const exportToCSV = async (
  data: any[],
  filename: string,
  headers: string[]
): Promise<void> => {
  // Convert data to CSV format
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
};

export const exportToPDF = (
  data: any[],
  headers: string[],
  title: string,
  subtitle?: string
): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add title
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 15, { align: "center" });

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, pageWidth / 2, 25, { align: "center" });
  }

  // Convert data to format expected by autoTable
  const tableHeaders = [headers];
  const tableData = data.map((item) =>
    headers.map((header) => item[header] || "")
  );

  // Add table with configured options
  (doc as any).autoTable({
    head: tableHeaders,
    body: tableData,
    startY: subtitle ? 35 : 25,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [49, 130, 206],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    columnStyles: {
      // Add specific column styles if needed
      0: { cellWidth: 25 }, // Receipt No
      1: { cellWidth: 30 }, // Student Name
      2: { cellWidth: 20 }, // Class
    },
    margin: { top: 35 },
    didDrawPage: (data: any) => {
      // Add header on each page if needed
      doc.setFontSize(8);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        data.settings.margin.left,
        10
      );
    },
  });

  return doc;
};
