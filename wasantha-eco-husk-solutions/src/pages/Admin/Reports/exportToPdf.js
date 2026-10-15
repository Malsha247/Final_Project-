
import html2canvas from "html2canvas";
import jsPDF from "jspdf";



export default async function exportToPdf(element, filename = "report.pdf") {
  if (!element) return alert("Nothing to export");
  try {
    
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

   
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 20;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let position = 10;
    if (imgHeight <= pageHeight - 20) {
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    } else {

      let heightLeft = imgHeight;
      let canvasPageHeight = pageHeight - 20;
      let y = 0;
      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        heightLeft -= canvasPageHeight;
        if (heightLeft > 0) pdf.addPage();
        y += canvasPageHeight;
      }
    }

    pdf.save(filename);
  } catch (err) {
    console.error("Export to PDF failed:", err);
    alert("Export to PDF failed: " + err.message);
  }
}
