import React from "react"

interface StatusDisplayProps {
  type: string
  data: string
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, data }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(data)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "document.pdf" 
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download PDF. Please try again.")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow-md bg-white text-center space-y-5">
      {type === "ready" ? (
        <>
          <div className="text-5xl text-green-600 mb-2">📄</div>
          <p className="text-lg font-medium text-gray-800">
            Your PDF is ready to download!
          </p>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl transition-colors duration-200"
          >
            Download PDF
          </button>
        </>
      ) : (
        <>
          <div className="text-4xl animate-spin inline-block">⏳</div>
          <p className="text-gray-600 text-base">{data}</p>
        </>
      )}
    </div>
  )
}

export default StatusDisplay
