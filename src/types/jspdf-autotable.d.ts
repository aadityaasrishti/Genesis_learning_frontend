import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      head?: any[][];
      body: any[][];
      startY?: number;
      theme?: string;
      styles?: any;
      headStyles?: any;
      margin?: any;
      columnStyles?: any;
    }) => {
      finalY: number;
    };
    lastAutoTable: {
      finalY: number;
    };
  }
}
