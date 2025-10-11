"use client"

import React from "react"
import { FileDown, Loader2 } from "lucide-react"

interface StatusDisplayProps {
  type: string
  data: string
}

export default function StatusDisplay({ type, data }: StatusDisplayProps) {
  const [downloading, setDownloading] = React.useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(data)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const blob = await response.blob()
      const contentDisposition = response.headers.get("content-disposition") || ""
      const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)
      const headerFile = match ? decodeURIComponent(match[1].replace(/"/g, "")) : null

      const urlFromProp = (() => {
        try { return new URL(data) } catch { return null }
      })()
      const urlFile = urlFromProp?.pathname?.split("/").pop() || null

      let filename = headerFile || urlFile || "download"
      if (!/\.[a-zA-Z0-9]+$/.test(filename)) {
        const inferred = blob.type.includes("pdf")
          ? "pdf"
          : blob.type.includes("png")
            ? "png"
            : blob.type.includes("jpeg")
              ? "jpg"
              : blob.type.includes("json")
                ? "json"
                : "bin"
        filename = `${filename}.${inferred}`
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download the file. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const isReady = type === "ready"

  return (
    <div
      className="w-full max-w-md mx-auto mt-10 p-6 rounded-2xl border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300 bg-card text-center shadow-sm"
      aria-live="polite"
    >
      {isReady ? (
        <div className="space-y-5">
          <FileDown className="mx-auto size-12 text-primary" aria-hidden="true" />
          <p className="text-lg font-medium text-foreground text-balance">Your file is ready to download</p>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all 
              ${downloading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"}`}
          >
            {downloading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Preparing download…</span>
              </>
            ) : (
              <>
                <FileDown className="size-4" aria-hidden="true" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4" role="status" aria-busy="true">
          <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground text-pretty">{data}</p>
          <span className="sr-only">Loading</span>
        </div>
      )}
    </div>
  )
}
