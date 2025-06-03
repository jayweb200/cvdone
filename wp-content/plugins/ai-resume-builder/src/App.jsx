import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver'; // For DOCX download
import { buildDocx } from './lib/docx-builder'; // DOCX generation logic
import FormWrapper from './components/form/FormWrapper';
import ResumePreview from './components/preview/ResumePreview';
import { defaultResumeData } from './components/utility/DefaultResumeData'; // Ensure this path is correct

function App() {
  // Access templates passed from WordPress
  // Ensure aiResumeBuilder and aiResumeBuilder.templates exist
  const availableTemplates = window.aiResumeBuilder?.templates || [];

  const EXPIRY_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const LOCAL_STORAGE_KEY = 'aiResumeDataWithExpiry';

  const [resumeData, setResumeData] = useState(() => {
    const savedItem = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedItem) {
      try {
        const item = JSON.parse(savedItem);
        if (item && item.timestamp && item.data) {
          const isExpired = (new Date().getTime() - item.timestamp) > EXPIRY_DURATION_MS;
          if (!isExpired) {
            return item.data; // Return valid, non-expired data
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean up expired data
            console.log("AI Resume Builder: Previous session data has expired.");
          }
        } else {
           localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean up invalid data
        }
      } catch (e) {
        console.error("Error parsing saved resume data:", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clean up corrupted data
      }
    }
    // Fallback to defaultResumeData if nothing valid in localStorage or if it expired
    // Or load first template if desired, as in previous logic
    if (availableTemplates.length > 0 && availableTemplates[0].data) {
      // return availableTemplates[0].data; // Option: load first template by default
    }
    return defaultResumeData;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const previewRef = useRef(null); // Ref for the preview element
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingDOCX, setIsDownloadingDOCX] = useState(false);


  // Save to localStorage whenever resumeData changes
  useEffect(() => {
    const itemToSave = {
      timestamp: new Date().getTime(),
      data: resumeData,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itemToSave));
  }, [resumeData]);

  const handleResumeDataChange = (newData) => {
    setResumeData(newData);
    // If data is changed, it's no longer purely from a selected template
    setSelectedTemplateId('');
  };

  const loadTemplate = (templateId) => {
    if (!templateId) {
      // Option to load default data or do nothing
      setResumeData(defaultResumeData);
      setSelectedTemplateId('');
      return;
    }
    const template = availableTemplates.find(t => t.id.toString() === templateId);
    if (template && template.data) {
      // Consider deep merging or providing options if partial template data is expected
      // For now, direct replacement
      setResumeData(template.data);
      setSelectedTemplateId(templateId);
    } else if (template && !template.data) {
      console.warn(`Template "${template.title}" (ID: ${templateId}) has invalid or empty data.`);
      // Optionally, inform the user
      alert(`Could not load template "${template.title}" as its data is missing or invalid.`);
      setResumeData(defaultResumeData); // Fallback to default
      setSelectedTemplateId('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) {
      console.error("Preview element not found for PDF export.");
      return;
    }
    setIsDownloadingPDF(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // If there are external images (though unlikely in this context)
        logging: false, // Disable logging to console for cleaner output
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98); // Use JPEG for smaller file size, 0.98 quality

      // A4 page dimensions in mm: 210 x 297
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Calculate image dimensions to fit A4 page while maintaining aspect ratio
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;

      let imgScaledWidth, imgScaledHeight;
      if (canvasAspectRatio > (pdfWidth / pdfHeight)) { // Image is wider than page
        imgScaledWidth = pdfWidth;
        imgScaledHeight = pdfWidth / canvasAspectRatio;
      } else { // Image is taller than page or same aspect ratio
        imgScaledHeight = pdfHeight;
        imgScaledWidth = pdfHeight * canvasAspectRatio;
      }

      // Center the image on the page (optional)
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      const yOffset = (pdfHeight - imgScaledHeight) / 2;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      pdf.save('ai-resume.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check the console for errors.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadDOCX = async () => {
    setIsDownloadingDOCX(true);
    try {
      const blob = await buildDocx(resumeData);
      saveAs(blob, 'ai-resume.docx');
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("Failed to generate DOCX. Please check the console for errors.");
    } finally {
      setIsDownloadingDOCX(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-0 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="py-6 text-center">
          {/* The H1 from ai-resume-builder.php provides the main page title */}
        </header>

        <div className="mb-8 p-4 bg-white shadow rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex-grow">
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">
              Load Template:
            </label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={(e) => loadTemplate(e.target.value)}
              className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">— Select a Template (or start fresh) —</option>
              {availableTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
            {selectedTemplateId && <p className="text-xs text-gray-500 mt-1">Loaded: {availableTemplates.find(t=>t.id.toString() === selectedTemplateId)?.title}</p>}
          </div>
          <div className="flex gap-2 flex-wrap"> {/* Container for buttons */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF || isDownloadingDOCX}
              className="mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={handleDownloadDOCX}
              disabled={isDownloadingDOCX || isDownloadingPDF}
              className="mt-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isDownloadingDOCX ? 'Generating DOCX...' : 'Download DOCX'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 w-full text-center md:text-left">
            Your work is automatically saved in your browser for 2 hours.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 lg:w-2/5">
            <FormWrapper resumeData={resumeData} onResumeDataChange={handleResumeDataChange} />
          </div>
          <div className="md:w-1/2 lg:w-3/5">
            {/* Assign ref to the direct parent of ResumePreview that we want to capture */}
            <div ref={previewRef} className="sticky top-8 bg-white">
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        </div>

        <footer className="text-center py-8 mt-12 text-gray-600">
          <p>&copy; {new Date().getFullYear()} AI Resume Builder Plugin. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
