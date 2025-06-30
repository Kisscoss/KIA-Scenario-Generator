import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to wait for all images within an element to load
const waitForImagesToLoad = (element: HTMLElement): Promise<void[]> => {
  const images = Array.from(element.getElementsByTagName('img'));
  const promises = images.map(img => {
    return new Promise<void>((resolve, reject) => {
      // If the image is already loaded (e.g., from cache), resolve immediately
      if (img.complete && img.naturalHeight > 0) {
        resolve();
      } else {
        img.onload = () => resolve();
        // Reject on error to fail the PDF generation
        img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
      }
    });
  });
  return Promise.all(promises);
};


export const downloadPdf = async (elementId: string, fileName: string) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    throw new Error("Printable element not found in the DOM.");
  }

  // Make the element temporarily visible for an accurate capture
  const originalVisibility = input.style.visibility;
  input.style.visibility = 'visible';

  try {
    // Wait for all images inside the printable area to finish loading
    await waitForImagesToLoad(input);

    const canvas = await html2canvas(input, {
      scale: 2, // Use a higher scale for better resolution
      useCORS: true, // Needed for external images, good practice for base64
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasAspectRatio = canvas.width / canvas.height;
    const imgHeightOnPdf = pdfWidth / canvasAspectRatio;

    let heightLeft = imgHeightOnPdf;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf);
    heightLeft -= pdfHeight;

    // Add subsequent pages if the content overflows
    while (heightLeft > 0) {
      position -= pdfHeight; // Decrement the position by a full page height
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  } catch (e) {
    console.error("Error during PDF generation:", e);
    throw new Error("Failed to generate PDF. An image may have failed to load.");
  } finally {
    // IMPORTANT: Ensure the original visibility is restored regardless of success or failure
    input.style.visibility = originalVisibility;
  }
};
