import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FeePayment } from "../types/fees";
import { formatCurrency, getPaymentModeLabel } from "./feeUtils";
import type { StudentPayment } from "../components/student/PaymentStatusCard";

// Update type definition to match actual jsPDF with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: any;
  }
}

const initializeJsPDF = () => {
  return new jsPDF();
};

const formatPdfCurrency = (amount: number): string => {
  const numberFormat = new Intl.NumberFormat("en-IN").format(amount);
  return `Rs. ${numberFormat}`;
};

export const generateFeeReceipt = (
  payment: FeePayment | StudentPayment,
  schoolInfo: {
    name: string;
    address: string;
    logo?: string;
  }
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add school logo if provided
  if (schoolInfo.logo) {
    doc.addImage(schoolInfo.logo, "PNG", 10, 10, 30, 30);
  }

  // School information
  doc.setFontSize(20);
  doc.text(schoolInfo.name, pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(schoolInfo.address, pageWidth / 2, 30, { align: "center" });

  // Receipt title
  doc.setFontSize(16);
  doc.text("FEE RECEIPT", pageWidth / 2, 45, { align: "center" });

  // Receipt details
  doc.setFontSize(12);
  const startY = 60;
  const lineHeight = 10;
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;

  // Left column
  doc.text('Receipt No:', leftMargin, startY);
  doc.text('Date:', leftMargin, startY + lineHeight);
  doc.text('Student Name:', leftMargin, startY + lineHeight * 2);
  doc.text('Class:', leftMargin, startY + lineHeight * 3);
  doc.text('Amount Paid:', leftMargin, startY + lineHeight * 4);
  doc.text('Payment Mode:', leftMargin, startY + lineHeight * 5);
  doc.text('Status:', leftMargin, startY + lineHeight * 6);

  // Right column
  doc.text(payment.receipt_number, rightMargin, startY, { align: 'right' });
  doc.text(new Date(payment.payment_date).toLocaleDateString(), rightMargin, startY + lineHeight, { align: 'right' });
  doc.text('student' in payment ? payment.student.user.name : payment.student_name, rightMargin, startY + lineHeight * 2, { align: 'right' });
  doc.text('student' in payment ? payment.student.class_id : payment.class_id, rightMargin, startY + lineHeight * 3, { align: 'right' });
  doc.text(formatCurrency(payment.amount_paid), rightMargin, startY + lineHeight * 4, { align: 'right' });
  doc.text(getPaymentModeLabel(payment.payment_mode), rightMargin, startY + lineHeight * 5, { align: 'right' });
  doc.text('payment_status' in payment ? payment.payment_status : payment.status, rightMargin, startY + lineHeight * 6, { align: 'right' });

  // Add paid watermark for paid receipts
  doc.setFontSize(60);
  doc.setTextColor(230, 230, 230);
  doc.text("PAID", pageWidth / 2, 140, {
    align: "center",
    angle: 45,
  });
  doc.setTextColor(0, 0, 0);

  // Add footer
  doc.setFontSize(10);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageWidth / 2,
    280,
    { align: "center" }
  );

  return doc;
};

export const downloadReceipt = (
  payment: FeePayment | StudentPayment,
  schoolInfo: {
    name: string;
    address: string;
    logo?: string;
  }
) => {
  const doc = generateFeeReceipt(payment, schoolInfo);
  doc.save(`Receipt-${payment.receipt_number}.pdf`);
};

export const generateSalaryReceipt = (
  payment: SalaryPayment,
  schoolInfo: {
    name: string;
    address: string;
    logo?: string;
  }
) => {
  const doc = initializeJsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add school logo if provided
  if (schoolInfo.logo) {
    doc.addImage(schoolInfo.logo, "PNG", 10, 10, 30, 30);
  }

  // School information
  doc.setFontSize(20);
  doc.text(schoolInfo.name, pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(schoolInfo.address, pageWidth / 2, 30, { align: "center" });

  // Receipt title
  doc.setFontSize(16);
  doc.text("SALARY RECEIPT", pageWidth / 2, 45, { align: "center" });

  // Receipt details
  doc.setFontSize(12);
  let currentY = 60;
  const lineHeight = 10;
  const leftMargin = 20;
  const col2X = pageWidth / 2 + 10;

  const formattedPaymentDate = new Date(
    payment.payment_date
  ).toLocaleDateString();
  const formattedMonth = payment.month;

  // Add receipt details in two columns
  const details = [
    ["Month:", formattedMonth],
    ["Payment Date:", formattedPaymentDate],
    ["Teacher Name:", payment.teacherInfo.name || ""],
    ["Amount:", formatPdfCurrency(payment.amount)],
    ["Payment Mode:", getPaymentModeLabel(payment.payment_mode)],
    ["Status:", payment.payment_status],
    ["Salary Type:", payment.teacher_salary.salary_type],
  ];

  if (payment.transaction_id) {
    details.push(["Transaction ID:", payment.transaction_id]);
  }

  details.forEach(([label, value]) => {
    doc.text(label, leftMargin, currentY);
    doc.text(String(value), col2X, currentY);
    currentY += lineHeight;
  });

  // Create the commission details table
  if (
    payment.commission_details?.classDetails &&
    Array.isArray(payment.commission_details.classDetails) &&
    payment.commission_details.classDetails.length > 0
  ) {
    currentY += lineHeight * 2;
    doc.setFontSize(14);
    doc.text("Commission Details", leftMargin, currentY);
    currentY += lineHeight;
    doc.setFontSize(12);

    try {
      payment.commission_details.classDetails.forEach((detail) => {
        // Class summary table
        doc.autoTable({
          theme: "grid",
          startY: currentY,
          head: [["Class", "Students", "Rate", "Commission"]],
          body: [
            [
              detail.classId,
              detail.studentCount,
              formatPdfCurrency(detail.commissionRate),
              formatPdfCurrency(detail.totalCommission),
            ],
          ],
          styles: {
            fontSize: 10,
            cellPadding: 2,
          },
          margin: { left: leftMargin },
        });

        currentY = doc.lastAutoTable.finalY + lineHeight;

        // Student details table
        const students = detail.students || [];
        if (students.length > 0) {
          doc.autoTable({
            theme: "grid",
            startY: currentY,
            head: [["Student Name", "Subjects", "Commission"]],
            body: students.map((student) => [
              student.name,
              student.subjectCount,
              formatPdfCurrency(student.commission),
            ]),
            styles: {
              fontSize: 10,
              cellPadding: 2,
            },
            margin: { left: leftMargin + 10 },
          });

          currentY = doc.lastAutoTable.finalY + lineHeight;
        }
      });
    } catch (error) {
      console.error("Error generating commission table:", error);
      // Use simple text fallback
      payment.commission_details.classDetails.forEach((detail) => {
        doc.text(`Class: ${detail.classId}`, leftMargin, currentY);
        doc.text(`Students: ${detail.studentCount}`, leftMargin + 60, currentY);
        doc.text(
          `Commission: ${formatPdfCurrency(detail.totalCommission)}`,
          leftMargin + 120,
          currentY
        );
        currentY += lineHeight;

        const students = detail.students || [];
        if (students.length > 0) {
          currentY += lineHeight / 2;
          students.forEach((student) => {
            doc.text(`- ${student.name}`, leftMargin + 10, currentY);
            doc.text(
              `${student.subjectCount} subjects`,
              leftMargin + 80,
              currentY
            );
            doc.text(
              formatPdfCurrency(student.commission),
              leftMargin + 120,
              currentY
            );
            currentY += lineHeight;
          });
          currentY += lineHeight / 2;
        }
      });
    }

    if (typeof payment.commission_details.totalCommission === "number") {
      currentY += lineHeight;
      doc.text(
        `Total Commission: ${formatPdfCurrency(
          payment.commission_details.totalCommission
        )}`,
        leftMargin,
        currentY
      );
      currentY += lineHeight * 2;
    }
  }

  // Add watermark
  doc.setFontSize(40);
  doc.setTextColor(230, 230, 230);
  doc.text("PAID", pageWidth / 2, 140, {
    align: "center",
    angle: 45,
  });
  doc.setTextColor(0, 0, 0);

  // Add footer
  doc.setFontSize(10);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageWidth / 2,
    280,
    { align: "center" }
  );

  return doc;
};

export const downloadSalaryReceipt = (
  payment: SalaryPayment,
  schoolInfo: {
    name: string;
    address: string;
    logo?: string;
  }
) => {
  const doc = generateSalaryReceipt(payment, schoolInfo);
  // Format the filename to be more consistent
  const formattedMonth = payment.month.replace(/[\s,]/g, "-");
  const teacherName = payment.teacherInfo.name?.replace(/\s+/g, "-") || "Unknown";
  doc.save(`Salary-Receipt-${teacherName}-${formattedMonth}.pdf`);
};

interface GeneratePDFOptions {
  studentName: string;
  payment: FeePayment;
  schoolInfo: {
    name: string;
    address: string;
    contact: string;
  };
}

export const generatePDF = ({
  studentName,
  payment,
  schoolInfo,
}: GeneratePDFOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // School Header
  doc.setFontSize(20);
  doc.text(schoolInfo.name, pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(schoolInfo.address, pageWidth / 2, 30, { align: 'center' });
  doc.text(schoolInfo.contact, pageWidth / 2, 40, { align: 'center' });

  // Receipt Title
  doc.setFontSize(16);
  doc.text('FEE RECEIPT', pageWidth / 2, 60, { align: 'center' });

  // Receipt Details
  doc.setFontSize(12);
  const startY = 80;
  const leftMargin = 20;
  const rightMargin = pageWidth - 20;
  const lineHeight = 10;

  // Left column
  doc.text('Receipt No:', leftMargin, startY);
  doc.text('Student Name:', leftMargin, startY + lineHeight);
  doc.text('Class:', leftMargin, startY + lineHeight * 2);
  doc.text('Payment Date:', leftMargin, startY + lineHeight * 3);

  // Right column - values
  doc.text(payment.receipt_number || '-', rightMargin, startY, { align: 'right' });
  doc.text(studentName, rightMargin, startY + lineHeight, { align: 'right' });
  doc.text(payment.student.class_id, rightMargin, startY + lineHeight * 2, { align: 'right' });
  doc.text(
    new Date(payment.payment_date).toLocaleDateString(),
    rightMargin,
    startY + lineHeight * 3,
    { align: 'right' }
  );

  // Payment Details Table
  const tableData = [
    ['Description', 'Amount'],
    ['Fee Amount', `₹${payment.amount_paid.toFixed(2)}`],
  ];

  if (payment.discount_amount) {
    tableData.push(['Discount', `₹${payment.discount_amount.toFixed(2)}`]);
    tableData.push([
      'Total Amount',
      `₹${(payment.amount_paid + payment.discount_amount).toFixed(2)}`,
    ]);
  }

  (doc as any).autoTable({
    startY: startY + lineHeight * 5,
    head: [['Item', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 12, cellPadding: 5 },
    margin: { left: leftMargin, right: leftMargin },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text('Payment Mode:', leftMargin, finalY);
  doc.text(payment.payment_mode, rightMargin, finalY, { align: 'right' });

  if (payment.transaction_id) {
    doc.text('Transaction ID:', leftMargin, finalY + lineHeight);
    doc.text(payment.transaction_id, rightMargin, finalY + lineHeight, {
      align: 'right',
    });
  }

  // Status and Notes
  doc.text('Status:', leftMargin, finalY + lineHeight * 2);
  doc.text(payment.payment_status, rightMargin, finalY + lineHeight * 2, {
    align: 'right',
  });

  if (payment.discount_reason) {
    doc.text('Note:', leftMargin, finalY + lineHeight * 3);
    doc.text(payment.discount_reason, rightMargin, finalY + lineHeight * 3, {
      align: 'right',
    });
  }

  // Save the PDF
  doc.save(`fee_receipt_${payment.receipt_number}.pdf`);
};

interface SalaryDetail {
  classId: string;
  studentCount: number;
  commissionRate: number;
  totalCommission: number;
  students?: Array<{
    name: string;
    subjectCount: number;
    commission: number;
  }>;
}

interface CommissionDetails {
  classDetails: SalaryDetail[];
  totalCommission: number;
}

interface Teacher {
  name: string;
}

interface TeacherSalary {
  salary_type: string;
}

interface SalaryPayment {
  payment_date: string;
  month: string;
  amount: number;
  payment_mode: string;
  transaction_id?: string;
  payment_status: string;
  teacherInfo: Teacher;
  teacher_salary: TeacherSalary;
  commission_details?: CommissionDetails;
}
