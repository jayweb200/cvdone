import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { fetchAISuggestion } from '../../lib/gemini'; // For AI parsing

// Configure pdf.js worker (ideally, this should be hosted locally)
const PDFJS_WORKER_SRC = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const AiAutofillPdf = ({ onAutofillDataReceived }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setExtractedText(''); // Clear previous results
      setStatus('File selected. Ready to extract.');
    } else {
      setSelectedFile(null);
      alert('Please select a PDF file.');
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExtractData = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    setStatus('Initializing...');
    setProgress(0);
    setExtractedText('');
    let fullText = '';

    try {
      setStatus('Loading PDF...');
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDocument.numPages;
      setStatus(`Converting ${numPages} PDF page(s) to images...`);

      // For Tesseract.js v4+, worker and lang paths default to CDN (jsDelivr)
      // For production, host these locally:
      // const workerPath = plugin_dir_url + 'assets/js/tesseract.worker.min.js';
      // const langPath = plugin_dir_url + 'assets/traineddata/';
      // const corePath = plugin_dir_url + 'assets/js/tesseract-core.wasm.js'; // if using wasm

      // Using default CDN paths for worker/language data for simplicity in this subtask
      const worker = await Tesseract.createWorker({
        // workerPath, langPath, corePath, // Uncomment and set if hosting locally
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
          console.log('Tesseract:', m);
        },
      });

      setStatus('Loading English language data for OCR...');
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      setStatus('Performing OCR...');

      for (let i = 1; i <= numPages; i++) {
        setStatus(`Processing page ${i} of ${numPages}...`);
        setProgress(0); // Reset progress for each page's OCR
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Scale can be adjusted

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const imageDataUrl = canvas.toDataURL('image/png');

        const { data: { text } } = await worker.recognize(imageDataUrl);
        fullText += text + '\n\n'; // Add text from page
        setExtractedText(prevText => prevText + text + '\n\n'); // Show text as it's extracted
      }

      await worker.terminate();
      await worker.terminate();
      setStatus('OCR complete. Now parsing with AI...');

      // Construct prompt for AI parsing
      const parsingPrompt = `
Parse the following resume text and return a structured JSON object.
The JSON object should match this structure:
{
  "personalInfo": { "name": "string", "email": "string", "phone": "string", "address": "string", "profileImage": null },
  "summary": "string",
  "experience": [{ "id": "string", "jobTitle": "string", "company": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD or Present", "responsibilities": "string (newline separated)" }],
  "education": [{ "id": "string", "degree": "string", "institution": "string", "graduationDate": "YYYY-MM-DD", "details": "string" }],
  "skills": ["string"],
  "sectionsOrder": ["personalInfo", "summary", "experience", "education", "skills"]
}
Ensure dates are in YYYY-MM-DD format where possible. If specific fields are not found, omit them or use null/empty values as appropriate per the structure.
Responsibilities should be a single string with bullet points separated by newlines.

Resume text to parse:
---
${fullText}
---
Return only the JSON object.
`;
      const aiResponseString = await fetchAISuggestion(parsingPrompt);
      setStatus('AI parsing complete. Attempting to apply data...');

      try {
        const parsedJson = JSON.parse(aiResponseString);
        if (onAutofillDataReceived) {
          onAutofillDataReceived(parsedJson);
        }
        setStatus('Resume data applied successfully!');
      } catch (jsonError) {
        console.error('Failed to parse AI JSON response:', jsonError, "\nAI Response was:\n", aiResponseString);
        setStatus(`Error: Failed to understand AI response. Raw AI output: ${aiResponseString}`);
        setExtractedText(`Raw AI Output (failed to parse as JSON):\n${aiResponseString}\n\nOriginal OCR Text:\n${fullText}`); // Show AI output for debugging
      }

    } catch (error) {
      console.error('Error during OCR process:', error);
      setStatus(`Error: ${error.message || 'Unknown error during OCR.'}`);
    } finally {
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      setSelectedFile(null);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-4">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">AI Resume Autofill (from PDF)</h3>
      <div className="mb-4">
        <label htmlFor="pdf-autofill-upload" className="block text-sm font-medium text-gray-700 mb-1">
          Upload Resume PDF:
        </label>
        <Input
          type="file"
          id="pdf-autofill-upload"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="w-full max-w-md mb-2"
        />
        <Button onClick={handleExtractData} disabled={!selectedFile || status.startsWith('Initializing') || status.startsWith('Loading') || status.startsWith('Converting') || status.startsWith('Processing') || status.startsWith('Performing OCR')}>
          {status.startsWith('Processing') || status.startsWith('Performing OCR') ? `Processing... (${progress}%)` : 'Extract Resume Data with AI'}
        </Button>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700">Status: <span className="font-normal text-gray-600">{status}</span></p>
        {progress > 0 && status.startsWith('Performing OCR') && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      {extractedText && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50 max-h-96 overflow-y-auto">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Extracted Text:</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{extractedText}</pre>
        </div>
      )}
    </div>
  );
};

export default AiAutofillPdf;
