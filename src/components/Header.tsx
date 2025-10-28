/**
 * @file Header component for the SovereigntyOS AI Lab.
 * It displays the application title and provides import/export functionality.
 */
import React from 'react';

interface HeaderProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

/**
 * A functional React component for the application header.
 * @param {HeaderProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered header.
 */
export function Header({ onExport, onImport }: HeaderProps): React.ReactElement {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          SovereigntyOS
        </span>
        <span className="ml-2 text-lg text-gray-400">AI Lab</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onExport}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 border border-gray-600 rounded-lg shadow transition-transform transform hover:scale-105"
        >
          Export Data
        </button>
        <button
          onClick={handleImportClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
        >
          Import Data
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />
      </div>
    </header>
  );
}