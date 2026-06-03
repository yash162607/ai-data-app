import { Upload, Loader2, FileText, ExternalLink } from 'lucide-react'
import { useState, useRef } from 'react'

export default function UploadSection({ onProcessData, isProcessing }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [projectName, setProjectName] = useState('')
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      var file = e.target.files[0]
      setSelectedFile(file)
      var nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setProjectName(nameWithoutExt)
    }
  }

  function handleStart() {
    if (selectedFile && projectName.trim()) {
      onProcessData(selectedFile, projectName.trim())
    }
  }

  function chooseFile() {
    fileInputRef.current && fileInputRef.current.click()
  }

  return (
    <section id="upload-section" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-700">Analyzing your file...</p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-sm text-gray-500 mb-4">{selectedFile.name}</p>
              
              <input
                type="text"
                value={projectName}
                onChange={function(e) { setProjectName(e.target.value) }}
                className="w-full max-w-md mb-4 px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Project name"
              />
              
              <button 
                onClick={handleStart}
                className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold"
              >
                <ExternalLink className="w-5 h-5 inline mr-2" />
                Start Analysis
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">Upload Your File</h3>
              <p className="text-gray-600 mb-4">CSV or Text file with data</p>
              <button 
                onClick={chooseFile}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.txt"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}