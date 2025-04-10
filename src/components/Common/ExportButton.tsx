import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers: string[];
  buttonText?: string;
  format?: "csv" | "pdf";
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  pdfTitle?: string;
  pdfSubtitle?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  headers,
  buttonText = "Export",
  format = "csv",
  onError,
  onSuccess,
  pdfTitle,
  pdfSubtitle,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (format === "pdf") {
        const doc = exportToPDF(
          data,
          headers,
          pdfTitle || "Export",
          pdfSubtitle
        );
        doc.save(`${filename}.pdf`);
      } else {
        await exportToCSV(data, filename, headers);
      }

      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className={`btn btn-secondary ${isExporting ? "btn-loading" : ""}`}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <LoadingSpinner size="small" />
          Exporting...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default ExportButton;
