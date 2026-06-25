import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdCloudUpload, MdCheckCircle } from 'react-icons/md';

const QrSelfService = () => {
  const { patientId } = useParams();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <MdCheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
        <p className="text-gray-600 text-center max-w-md">
          Your details and documents have been securely submitted to the doctor. You can now wait for your turn.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Patient Check-In</h1>
          <p className="text-green-50">Please fill out your details before seeing the doctor.</p>
        </div>

        <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Current Symptoms</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What are you experiencing today?</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
                rows="3"
                placeholder="E.g., fever, headache, body ache..."
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Document Upload</h2>
            <p className="text-sm text-gray-500">Upload any recent blood test reports, X-rays, or previous prescriptions.</p>
            
            <div className="border-2 border-dashed border-green-200 rounded-2xl p-8 text-center bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer">
              <MdCloudUpload className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-600 hover:shadow-xl transition-all transform hover:-translate-y-0.5">
            Submit Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default QrSelfService;
