import React, { useState, useCallback, useRef } from 'react';

const fornitori = [
  { 
    id: 'italbox', 
    name: 'ITALBOX', 
    transform: (text) => {
      return text.replace(/([A-Za-z]+)(\d+)([A-Za-z]+)/g, '$1/$2/$3');
    }
  },
  { 
    id: 'sifa', 
    name: 'SIFA', 
    transform: (text) => {
      return text.replace(/\s+/g, '/');
    }
  },
  {
    id: 'ondulati_santerno',
    name: 'ONDULATI SANTERNO',
    transform: (text) => {
      const parts = text.split('/');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
      return text;
    }
  },
  {
    id: 'progest',
    name: 'PROGEST',
    transform: (text) => {
      return text.replace(/\\/g, '/');
    }
  },
  {
    id: 'ondulati_del_savio',
    name: 'ONDULATI DEL SAVIO',
    transform: (text) => {
      return text.replace(/\\/g, '/');
    }
  }
];

const TextTransformer = () => {
  const [input, setInput] = useState('');
  const [numericInput, setNumericInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [selectedFornitore, setSelectedFornitore] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [transformedCsvData, setTransformedCsvData] = useState([]);
  const [csvContent, setCsvContent] = useState('');
  const fileInputRef = useRef(null);

  const transformData = (fornitore, text, price) => {
    const transformedText = fornitore.transform(text);
    return `${transformedText};${price}`;
  };

  const handleSingleTransform = useCallback(() => {
    if (!selectedFornitore) {
      setError('Per favore, seleziona un fornitore.');
      return;
    }
    const fornitore = fornitori.find(f => f.id === selectedFornitore);
    if (!fornitore) {
      setError('Fornitore selezionato non valido.');
      return;
    }
    if (!input || !numericInput) {
      setError('Per favore, inserisci sia il testo che il valore numerico.');
      return;
    }

    const transformedText = transformData(fornitore, input, numericInput);
    setOutput(transformedText);
    setTransformedCsvData([transformedText]);
    setError('');
    setCsvContent('');
  }, [input, numericInput, selectedFornitore]);

  const handleCsvTransform = useCallback(() => {
    if (!selectedFornitore) {
      setError('Per favore, seleziona un fornitore.');
      return;
    }
    const fornitore = fornitori.find(f => f.id === selectedFornitore);
    if (!fornitore) {
      setError('Fornitore selezionato non valido.');
      return;
    }
    if (csvData.length === 0) {
      setError('Per favore, carica un file CSV prima di trasformare.');
      return;
    }

    const transformed = csvData.map(row => {
      const [text, price] = row;
      return transformData(fornitore, text, price);
    });
    setTransformedCsvData(transformed);
    setOutput(`Trasformati ${transformed.length} righe. Clicca su "Scarica CSV Trasformato" per scaricare i risultati.`);
    setError('');
    setCsvContent('');
  }, [selectedFornitore, csvData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const parsedData = lines
          .map(line => line.split(';').map(item => item.trim()))
          .filter(row => row.length === 2 && row[0] && row[1]);
        setCsvData(parsedData);
        setInput('');
        setNumericInput('');
        setOutput(`Caricato CSV con ${parsedData.length} righe valide.`);
      };
      reader.readAsText(file);
    }
  };

  const downloadCsv = () => {
    if (transformedCsvData.length === 0) {
      setError('Nessun dato da scaricare. Trasforma prima i dati.');
      return;
    }
    
    const content = "Testo Trasformato\n" + transformedCsvData.join("\n");
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dati_trasformati.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showCsvContent = () => {
    if (transformedCsvData.length === 0) {
      setError('Nessun dato da visualizzare. Trasforma prima i dati.');
      return;
    }
    
    const content = "Testo Trasformato\n" + transformedCsvData.join("\n");
    
    setCsvContent(content);
  };

  const handleClean = () => {
    setInput('');
    setNumericInput('');
    setOutput('');
    setError('');
    setSelectedFornitore('');
    setCsvData([]);
    setTransformedCsvData([]);
    setCsvContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">TRASFORMAZIONE FORMATO NOME COMPOSIZIONI</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-2 font-bold" htmlFor="fornitore">Seleziona Fornitore:</label>
        <select
          id="fornitore"
          className="w-full p-2 border rounded"
          value={selectedFornitore}
          onChange={(e) => setSelectedFornitore(e.target.value)}
        >
          <option value="">Seleziona un fornitore</option>
          {fornitori.map(fornitore => (
            <option key={fornitore.id} value={fornitore.id}>{fornitore.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-bold" htmlFor="input">Testo da trasformare:</label>
        <input
          id="input"
          type="text"
          className="w-full p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Es. KBFFFK22222EB, B/KFT/222, o KMT\242\B"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-bold" htmlFor="numericInput">Campo numerico:</label>
        <input
          id="numericInput"
          type="text"
          className="w-full p-2 border rounded"
          value={numericInput}
          onChange={(e) => setNumericInput(e.target.value)}
          placeholder="Inserisci il valore numerico"
        />
      </div>

      <div className="mb-4">
        <button 
          onClick={handleSingleTransform} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Trasforma Singolo
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-bold" htmlFor="csvFile">Carica file CSV:</label>
        <input
          id="csvFile"
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <button 
          onClick={handleCsvTransform} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Trasforma CSV
        </button>
        <button 
          onClick={downloadCsv} 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Scarica CSV Trasformato
        </button>
        <button 
          onClick={showCsvContent} 
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
        >
          Visualizza CSV
        </button>
        <button 
          onClick={handleClean} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Pulisci
        </button>
      </div>

      {output && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong>Risultato:</strong>
          <p>{output}</p>
        </div>
      )}

      {csvContent && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4 overflow-auto">
          <strong>Contenuto CSV Trasformato:</strong>
          <pre>{csvContent}</pre>
        </div>
      )}
      
      <footer className="text-center mt-6 text-gray-500 font-bold">
        CODED BY: LEONARDO PUZO
      </footer>
    </div>
  );
};

export default TextTransformer;