import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exports JSON array data to a downloadable CSV spreadsheet file.
 */
export function exportToCSV(data, filename = "report") {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  // Extract column headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows = [
    headers.join(","), // header row
    ...data.map(row => 
      headers.map(fieldName => {
        let val = row[fieldName];
        if (val === null || val === undefined) val = "";
        
        // Escape quotes and commas
        let stringVal = typeof val === "object" ? JSON.stringify(val) : String(val);
        stringVal = stringVal.replace(/"/g, '""');
        if (stringVal.search(/("|,|\n)/g) >= 0) {
          stringVal = `"${stringVal}"`;
        }
        return stringVal;
      }).join(",")
    )
  ];

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Captures a DOM element and downloads it as a styled PDF document.
 */
export async function exportElementToPDF(elementId, filename = "document") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution scale
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Page dimensions calculation (standard A4)
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multi-page documents
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
}
