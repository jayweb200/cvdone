import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver'; // For DOCX download
import { buildDocx } from './lib/docx-builder'; // DOCX generation logic
import FormWrapper from './components/form/FormWrapper';
import ResumePreview from './components/preview/ResumePreview';
import PdfEditor from './components/pdf-editor/PdfEditor';
import AiAutofillPdf from './components/ai-autofill/AiAutofillPdf'; // Import AiAutofillPdf
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

  const handleAutofillData = (aiParsedData) => {
    if (!aiParsedData) return;

    console.log("Received AI Parsed Data for autofill:", aiParsedData);

    // Simple merge: AI data overwrites existing data for the keys it provides.
    // A more sophisticated merge would involve deeper checks or user prompts.
    // Also, ensure IDs for list items (experience, education) are generated if missing.
    // For now, assume AI provides data in a structure that can be directly merged for some keys.

    const updatedData = { ...resumeData };

    if (aiParsedData.personalInfo) {
      updatedData.personalInfo = { ...resumeData.personalInfo, ...aiParsedData.personalInfo };
    }
    if (aiParsedData.summary) {
      updatedData.summary = aiParsedData.summary; // Assuming summary is a direct string
    }
    if (aiParsedData.experience && Array.isArray(aiParsedData.experience)) {
      // Simple replacement for now. Add `id` if missing.
      updatedData.experience = aiParsedData.experience.map(exp => ({ ...exp, id: exp.id || generateId() }));
    }
    if (aiParsedData.education && Array.isArray(aiParsedData.education)) {
      updatedData.education = aiParsedData.education.map(edu => ({ ...edu, id: edu.id || generateId() }));
    }
    if (aiParsedData.skills && Array.isArray(aiParsedData.skills)) {
      updatedData.skills = [...new Set([...(resumeData.skills || []), ...aiParsedData.skills])]; // Merge and deduplicate skills
    }

    // Handle sectionsOrder if provided by AI, otherwise keep existing or default
    if (aiParsedData.sectionsOrder && Array.isArray(aiParsedData.sectionsOrder)) {
        // Basic validation of section keys if needed
        const validSections = ['personalInfo', 'summary', 'experience', 'education', 'skills']; // Add any other valid sections
        const filteredOrder = aiParsedData.sectionsOrder.filter(key => validSections.includes(key));
        if (filteredOrder.length > 0) {
            updatedData.sectionsOrder = filteredOrder;
        }
    }


    setResumeData(updatedData);
    alert("Resume data has been partially auto-filled based on the PDF content. Please review carefully.");
  };

  // Helper function (can be moved to utils if not already there)
  const generateId = () => Math.random().toString(36).substr(2, 9);


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

        {/* PDF Tools Section */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700">PDF Utilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <PdfEditor />
            </div>
            <div>
              <AiAutofillPdf onAutofillDataReceived={handleAutofillData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
