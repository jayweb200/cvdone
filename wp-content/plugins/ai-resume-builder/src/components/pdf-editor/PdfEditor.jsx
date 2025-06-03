import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Button } from '../ui/Button'; // Assuming common Button component
import { Input } from '../ui/Input';   // Assuming common Input component

const PdfEditor = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [inputText, setInputText] = useState('Hello, pdf-lib!');
  const [isLoading, setIsLoading] = useState(false);
  const [modifiedPdfUri, setModifiedPdfUri] = useState(null); // For iframe preview
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      return;
    }
    setIsLoading(true);
    setPdfName(file.name);
    setModifiedPdfUri(null); // Clear previous preview
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadedPdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(loadedPdfDoc);
      // Initially render the loaded PDF in iframe (optional)
      const pdfBytes = await loadedPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setModifiedPdfUri(url);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert('Failed to load PDF. See console for details.');
      setPdfDoc(null);
      setPdfName('');
    } finally {
      setIsLoading(false);
      if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleAddText = async () => {
    if (!pdfDoc) {
      alert('Please load a PDF first.');
      return;
    }
    setIsLoading(true);
    try {
      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        alert('PDF has no pages.');
        setIsLoading(false);
        return;
      }
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Embed a standard font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      firstPage.drawText(inputText, {
        x: 50,
        y: height - 100, // Adjust y from top
        size: 24,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.8), // Blue color
      });

      // Update iframe preview
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (modifiedPdfUri) URL.revokeObjectURL(modifiedPdfUri); // Revoke old URL
      const url = URL.createObjectURL(blob);
      setModifiedPdfUri(url);

    } catch (error) {
      console.error('Failed to add text to PDF:', error);
      alert('Failed to add text. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfDoc) {
      alert('No PDF loaded or modified to download.');
      return;
    }
    setIsLoading(true);
    try {
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `modified-${pdfName || 'resume'}.pdf`);
    } catch (error) {
      console.error('Failed to save PDF:', error);
      alert('Failed to save PDF. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-8">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">PDF Editor Tools</h3>

      <div className="mb-6">
        <label htmlFor="pdf-upload" className="block text-sm font-medium text-gray-700 mb-1">
          Upload PDF:
        </label>
        <Input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="w-full max-w-md"
          disabled={isLoading}
        />
        {pdfName && !isLoading && <p className="text-sm text-gray-600 mt-2">Loaded: {pdfName}</p>}
      </div>

      {pdfDoc && !isLoading && (
        <div className="space-y-6">
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="pdf-text-input" className="block text-sm font-medium text-gray-700 mb-1">
                Text to Add:
              </label>
              <Input
                type="text"
                id="pdf-text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full"
                placeholder="Enter text to add to PDF"
              />
            </div>
            <Button onClick={handleAddText} disabled={isLoading || !pdfDoc} variant="outline">
              Add Text to First Page
            </Button>
          </div>

          <div>
            <Button onClick={handleDownload} disabled={isLoading || !pdfDoc}>
              Download Modified PDF
            </Button>
          </div>

          {/* PDF Preview Iframe */}
          {modifiedPdfUri && (
            <div className="mt-6 border rounded-lg shadow-inner">
              <h4 className="text-lg font-semibold p-3 bg-gray-50 border-b text-gray-700">Preview</h4>
              <iframe src={modifiedPdfUri} style={{ width: '100%', height: '500px' }} title="Modified PDF Preview"></iframe>
            </div>
          )}
        </div>
      )}
      {isLoading && <p className="text-blue-600">Processing PDF...</p>}
    </div>
  );
};

export default PdfEditor;
