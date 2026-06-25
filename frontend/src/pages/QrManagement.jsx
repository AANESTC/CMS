import React from 'react';
import { MdQrCode2, MdDownload, MdMessage, MdRefresh } from 'react-icons/md';

const QrManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Management</h1>
          <p className="text-gray-500 mt-1">Manage, download, or resend patient QR codes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <input
            type="text"
            placeholder="Search patient by PID or Name..."
            className="px-4 py-2 w-80 border border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                <th className="p-4 font-semibold">QR Code</th>
                <th className="p-4 font-semibold">Patient</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <MdQrCode2 className="w-10 h-10 text-gray-600" />
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800 text-sm">John Doe {i}</p>
                    <p className="text-xs text-gray-500">PID-104{i}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-500 block mb-1">Generated: Oct 20, 2023</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${i === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {i === 1 ? 'Scanned recently' : 'Not yet used'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Download PNG">
                      <MdDownload className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors" title="Resend WhatsApp">
                      <MdMessage className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors" title="Regenerate QR">
                      <MdRefresh className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default QrManagement;
