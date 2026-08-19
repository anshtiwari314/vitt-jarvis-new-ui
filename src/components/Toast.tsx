import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  type?: "success" | "error"
  onClose: () => void
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // show animation
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false) // trigger fade out
      setTimeout(onClose, 300) // wait fade duration then remove
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "14px 20px",
        borderRadius: "12px",
        backgroundColor: type === "success" ? "#2e7d32" : "#d32f2f",
        color: "white",
        fontWeight: 500,
        fontSize: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        transformOrigin: "center",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(20px)",
      }}
    >
      {message}
    </div>
  )
}
