import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

const InvoiceExtractor = () => {
  const [invoiceImage, setInvoiceImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);



  const handleImageUpload = (event) => {
    setInvoiceImage(event.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      const genAI = new GoogleGenerativeAI(gemniapikey );

      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      const invoiceImagePart = await fileToGenerativePart(invoiceImage, 'image/jpeg');

      const prompt = `
        ${inputPrompt}
        You are an expert in understanding invoices.
        You will receive input images as invoices &
        you will have to answer questions based on the input image
      `;

      const result = await model.generateContent([prompt, invoiceImagePart]);
      const response = result.response;
      const text = response.text();

      setExtractedText(text);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fileToGenerativePart = (file, mimeType) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1],
            mimeType,
          },
        });
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className='app'>
      <div className='container'>
        <div className='left-column'>
          <h1>Invoice Extractor</h1>

          <div className='inputprompt'>
            <label htmlFor="input-prompt">Input Prompt:</label>
            <input type="text" id="input-prompt" value={inputPrompt} onChange={(e) => setInputPrompt(e.target.value)} />
          </div>

          <div className='extractedarea'>
            <label htmlFor="extracted-text">Extracted Text:</label>
            <p id="extracted-text">{extractedText} </p>
          </div>

          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Extracting...' : 'Tell me about the image'}
          </button>
        </div>

        <div className='right-column'>
          <div className='upload'>
            <label htmlFor="invoice-image">Upload Invoice Image:</label>
            <input type="file" id="invoice-image" accept="image/*" onChange={handleImageUpload} />
          </div>

          {invoiceImage && (
            <div className='imagearea'>
              <img src={URL.createObjectURL(invoiceImage)} alt="Uploaded invoice image" />
            </div>
          )}

          {isLoading && <p>Extracting invoice...</p>}
          {error && <p>Error: {error.message}</p>}
        </div>
      </div>
    </div>
  );

};

export default InvoiceExtractor;
