import { useEffect, useState, createContext, useContext, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudUploadAlt, faUser, faChartLine, faUserTie, faEdit, faCopy } from "@fortawesome/free-solid-svg-icons"
import { PostReq } from "../functions/requests"
import { useAuth } from "../context/AuthContext"
import { config as AppConfig } from "../configuration.js"
const MAIN_ROUTER_URL = "https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis/main_router"

const DataContext = createContext(null)

const useData = () => useContext(DataContext)

const Form = ({ submitForm, loading, error }) => {
  const [fields, setFields] = useState([])
  const [formState, setFormState] = useState({})

  useEffect(() => {
    const fetchDynamicFields = async () => {
      try {
        const agentData = JSON.parse(localStorage.getItem("agent_name"))
        const agent_name = agentData?.agent_name || ""
        const res = await fetch(MAIN_ROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trigger_func: "req_lms_field_names",
            params: { agent_name, type: "HI" },
          }),
        })

        const data = await res.json()
        console.log("Fetched field data:", data)
        if (data?.field_data) {
          setFields(data.field_data)

          const initialState = {}
          data.field_data.forEach((f) => {
            initialState[f.cell_name] = Array.isArray(f.cell_value) ? f.cell_value[0] : f.cell_value || ""
          })
          setFormState(initialState)
        }
      } catch (err) {
        console.error("Error fetching field data:", err)
      }
    }

    fetchDynamicFields()
  }, [])

  const handleChange = (e, name) => {
    const { value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitForm(formState)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex-1">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Lead</h3>

      {fields.length === 0 ? (
        <p className="text-gray-500 text-sm">Loading form fields...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {fields.map((field, index) => (
            <div key={index}>
              <label className="block text-slate-500 mb-1">{field.cell_name}</label>

              {field.type === "user-input" ? (
                <input
                  type="text"
                  name={field.cell_name}
                  value={formState[field.cell_name] || ""}
                  onChange={(e) => handleChange(e, field.cell_name)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                />
              ) : field.type === "drop-down" ? (
                <select
                  name={field.cell_name}
                  value={formState[field.cell_name] || ""}
                  onChange={(e) => handleChange(e, field.cell_name)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                >
                  {field.cell_value.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Add Lead"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </form>
      )}
    </div>
  )
}

const UploadComp = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex-1">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Upload Leads (CSV/Excel)</h3>
      <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center text-slate-500">
        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl mb-3 text-slate-400" />
        <p className="text-sm mb-2">Drag & drop your file here, or</p>
        <input type="file" id="file-upload" className="hidden" />
        <label
          htmlFor="file-upload"
          className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-200 transition-colors duration-200"
        >
          Browse Files
        </label>
      </div>
      <p className="text-xs text-slate-400 mt-3">Supported formats: .csv, .xlsx</p>
    </div>
  )
}

export function Table({ setFormState, initialFormState }) {
  const { formData, base_url, getFormData } = useData()
  const leads = formData || []
  const hiLeads = Array.isArray(leads) ? leads.filter((l) => String(l?.lead_type || "").toUpperCase() === "HI") : []

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [copyFeedback, setCopyFeedback] = useState({})

  const [insightLoading, setInsightLoading] = useState({})
  const [insightError, setInsightError] = useState({})
  const [insightMsg, setInsightMsg] = useState({})

  const pollingTimers = useRef<Record<string, number>>({})

  useEffect(() => {
    return () => {
      Object.values(pollingTimers.current).forEach((id) => {
        if (id) window.clearInterval(id)
      })
      pollingTimers.current = {}
    }
  }, [])

  const stopPolling = (uniqueLeadId: string) => {
    const id = pollingTimers.current[uniqueLeadId]
    if (id) {
      window.clearInterval(id)
      delete pollingTimers.current[uniqueLeadId]
    }
  }

  const startPolling = (sessionId: string, uniqueLeadId: string) => {
    if (pollingTimers.current[uniqueLeadId]) return

    setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: true }))
    setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
    setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Checking dashboard status..." }))

    const timerId = window.setInterval(async () => {
      try {
        const pollResp = await PostReq(MAIN_ROUTER_URL, {
          trigger_func: "ins_postfacto_status_check",
          params: { session_id: sessionId },
        })
        const status = pollResp?.status

        if (status === "done") {
          stopPolling(uniqueLeadId)
          setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Dashboard is ready" }))
          setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))

          window.open(`https://postfacto-health.netlify.app/#/${sessionId}`, "_blank", "noopener,noreferrer")

          if (typeof getFormData === "function" && base_url) {
            getFormData(`${base_url}/recent_uploads`)
          }
        } else if (status === "pending") {
          setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Preparing dashboard…" }))
        }
      } catch (_e) {
        setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "Status check failed, retrying..." }))
        setTimeout(() => {
          setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
        }, 1500)
      }
    }, 3000)

    pollingTimers.current[uniqueLeadId] = timerId
  }

  function enableEdit(lead) {
    const { name, mob, email, priority, source, lead_id, link_params, pref_language } = lead
    const [fname, ...restName] = name.split(" ")

    console.log("enable edit", lead)
    setFormState({
      ...initialFormState,
      lead_id: link_params.split("&")[0],
      link_params,
      fname,
      lname: restName.join(" "),
      mob,
      email,
      priority,
      leadSourceFrom: source,
      pref_language,
    })
  }

  const generateInsight = async (lead) => {
    const uniqueLeadId = lead.id || lead.lead_id || `lead-${lead.name}-${lead.mob}`

    if (lead.postfacto_status === "done") {
      const linkParams = lead.link_params || ""
      const cidMatch = linkParams.match(/cid_\w+/)
      const idOf = cidMatch ? cidMatch[0] : "cid_8459"
      window.open(`https://postfacto-health.netlify.app/#/${idOf}`, "_blank", "noopener,noreferrer")
      return
    }

    if (lead.postfacto_status === "N/A") {
      return
    }

    setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: true }))
    setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
    setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "" }))

    try {
      const linkParams = lead.link_params || ""
      const cidMatch = linkParams.match(/cid_\w+/)
      const sessionId = cidMatch ? cidMatch[0] : "cid_8459"

      const response = await PostReq(MAIN_ROUTER_URL, {
        trigger_func: "trigger_metrics_HI",
        params: { session_id: sessionId },
      })

      const rawMsg = response?.msg || ""
      const msg = rawMsg.toLowerCase()

      if (rawMsg) {
        setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: rawMsg }))
        setToast({ message: rawMsg, type: "success" })
      } else {
        setToast({ message: "Failed to generate insight", type: "error" })
      }

      if (msg === "process started") {
        startPolling(sessionId, uniqueLeadId)
        return
      }
      if (msg === "session not done") {
        setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))
        return
      }

      if (response?.status === "done") {
        setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Dashboard is ready" }))
        setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))
        window.open(`https://postfacto-health.netlify.app/#/${sessionId}`, "_blank", "noopener,noreferrer")
        if (typeof getFormData === "function" && base_url) {
          getFormData(`${base_url}/recent_uploads`)
        }
      }
    } catch (error) {
      setInsightError((prev) => ({
        ...prev,
        [uniqueLeadId]: "Failed to generate insight",
      }))
      setTimeout(() => {
        setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
      }, 3000)
    } finally {
      if (!pollingTimers.current[uniqueLeadId]) {
        await new Promise((r) => setTimeout(r, 1500))
        setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))
      }
    }
  }

  const getInsightButtonText = (lead, isLoading) => {
    if (isLoading) return "Generating..."

    switch (lead.postfacto_status) {
      case "done":
        return "Insight Link"
      case "pending":
        return "Generate Insights"
      case "N/A":
        return "N/A"
      default:
        return "Generate Insights"
    }
  }

  const getInsightButtonStyle = (lead, isLoading) => {
    const baseClasses =
      "px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

    if (lead.postfacto_status === "N/A") {
      return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`
    }

    if (lead.postfacto_status === "done") {
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white focus:ring-blue-500`
    }

    return `${baseClasses} bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white focus:ring-green-500`
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxButtons = 5
    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    const showLeftEllipsis = currentPage > 3
    const showRightEllipsis = currentPage < totalPages - 2

    pages.push(1)
    if (showLeftEllipsis) pages.push("...")

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (showRightEllipsis) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  const totalItems = hiLeads.length
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const startItem = totalItems === 0 ? 0 : indexOfFirstItem + 1
  const endItem = Math.min(indexOfLastItem, totalItems)
  const currentLeads = hiLeads.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(hiLeads.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1)
  }, [totalPages])

  const copyToClipboard = (textToCopy, leadId) => {
    const textarea = document.createElement("textarea")
    textarea.value = textToCopy
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      const successful = document.execCommand("copy")
      if (successful) {
        setCopyFeedback((prev) => ({ ...prev, [leadId]: "Copied!" }))
        setTimeout(() => {
          setCopyFeedback((prev) => ({ ...prev, [leadId]: "" }))
        }, 2000)
      } else {
        setCopyFeedback((prev) => ({ ...prev, [leadId]: "Failed to copy." }))
        setTimeout(() => {
          setCopyFeedback((prev) => ({ ...prev, [leadId]: "" }))
        }, 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
      setCopyFeedback((prev) => ({ ...prev, [leadId]: "Failed to copy." }))
      setTimeout(() => {
        setCopyFeedback((prev) => ({ ...prev, [leadId]: "" }))
      }, 2000)
    } finally {
      document.body.removeChild(textarea)
    }
  }

  return (
    <div className="bg-white p-2 md:p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-slate-700 mb-4 px-2 md:px-0">Recent Uploaded Leads</h3>
      {hiLeads.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No HI leads found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Customer Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Mobile
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Preffered Language
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Link
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Edit
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Insights
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Plan Summary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentLeads.map((lead, index) => {
                  console.log("lead_links", lead.link_params)
                  const linkToCopy = lead.link_params
                    ? `${window.location.protocol}//${window.location.host}/#/mainpage/?${lead.link_params}&${lead.pref_language.toLowerCase()}`
                    : "#"

                  const uniqueLeadId = lead.id || lead.lead_id || `lead-${lead.name}-${lead.mob}`
                  return (
                    <tr key={uniqueLeadId}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-slate-900">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">{lead.mob}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">{lead.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">
                        {lead.pref_language}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">
                        {lead.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500 capitalize">
                        {lead.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500 capitalize">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500 flex items-center space-x-2">
                        <a href={linkToCopy} className="text-blue-600 hover:underline" rel="noopener noreferrer">
                          Link
                        </a>
                        <button
                          onClick={() => copyToClipboard(linkToCopy, uniqueLeadId)}
                          className="text-sky-600 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                          title="Copy Link"
                        >
                          <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                        </button>
                        {copyFeedback[uniqueLeadId] && (
                          <span className="text-xs text-green-600 font-semibold">{copyFeedback[uniqueLeadId]}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">
                        <button
                          onClick={() => enableEdit(lead)}
                          className="text-sky-600 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                          title="Edit Lead"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">
                        <div className="flex flex-col items-start space-y-1">
                          <button
                            onClick={() => generateInsight(lead)}
                            disabled={insightLoading[uniqueLeadId] || lead.postfacto_status === "N/A"}
                            className={getInsightButtonStyle(lead, insightLoading[uniqueLeadId])}
                            title={
                              lead.postfacto_status === "done"
                                ? "Open Insight Link"
                                : lead.postfacto_status === "N/A"
                                  ? "No insights available"
                                  : "Generate Insight"
                            }
                            aria-busy={!!insightLoading[uniqueLeadId]}
                          >
                            <span className="inline-flex items-center gap-2">
                              {insightLoading[uniqueLeadId] && (
                                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" aria-hidden="true">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  />
                                </svg>
                              )}
                              {getInsightButtonText(lead, insightLoading[uniqueLeadId])}
                            </span>
                          </button>
                          {insightMsg[uniqueLeadId] && (
                            <span className="text-xs text-slate-600" aria-live="polite">
                              {insightMsg[uniqueLeadId]}
                            </span>
                          )}
                          {insightError[uniqueLeadId] && (
                            <span className="text-xs text-red-600 font-medium">{insightError[uniqueLeadId]}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm text-slate-500">
                        {lead.plan_summary !== "N/A" ? (
                          <a
                            href={lead.plan_summary}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Summary
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-slate-600 text-center md:text-left">
              {totalItems > 0 ? (
                <>
                  Showing <span className="font-medium text-slate-800">{startItem}</span>–
                  <span className="font-medium text-slate-800">{endItem}</span> of{" "}
                  <span className="font-medium text-slate-800">{totalItems}</span>
                </>
              ) : (
                <>No results</>
              )}
            </div>

            {totalPages > 1 && (
              <nav
                className="flex flex-wrap items-center justify-center gap-1"
                role="navigation"
                aria-label="Pagination"
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft" && currentPage > 1) paginate(currentPage - 1)
                  if (e.key === "ArrowRight" && currentPage < totalPages) paginate(currentPage + 1)
                }}
              >
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className="hidden md:inline-block px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Previous
                </button>

                {getPageNumbers().map((p, idx) =>
                  typeof p === "number" ? (
                    <button
                      key={`${p}-${idx}`}
                      type="button"
                      onClick={() => paginate(p)}
                      aria-current={currentPage === p ? "page" : undefined}
                      className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPage === p ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} aria-hidden="true" className="px-2 text-slate-400 select-none">
                      …
                    </span>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden md:inline-block px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Last
                </button>
              </nav>
            )}

            <div className="flex items-center justify-center gap-2">
              <label htmlFor="rows-per-page" className="text-sm text-slate-600">
                Rows per page
              </label>
              <select
                id="rows-per-page"
                className="px-2 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={itemsPerPage}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  setItemsPerPage(next)
                  setCurrentPage(1)
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function Sidebar({ links }) {
  return (
    <div className="hidden md:block fixed h-full bg-white text-slate-800 w-64 p-6 shadow-lg rounded-r-lg border-r border-slate-100">
      <div className="mb-10 pt-2">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-wide">Lead Management</h2>
        <p className="text-sm text-slate-500 mt-1">Panel</p>
      </div>
    </div>
  )
}

const Header = ({ title, dashboardLink }) => {
  const { setCurrentUser } = useAuth()

  function handleLogout() {
    localStorage.removeItem("insurance-auth")
    setCurrentUser(null)
  }

  return (
    <header className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <a onClick={handleLogout} style={{ cursor: "pointer" }} className="text-blue-600 hover:underline">
        Logout
      </a>
    </header>
  )
}

function LeadDashboard() {
  const [formData, setFormData] = useState([])
  const base_url = AppConfig.serverBaseUrl
  const { currentUser } = useAuth()
  console.log(currentUser.userid, "the current user is")
  const pollingRef = useRef(null)
  const pollingRefs = useRef({})

  const getFormData = async (url) => {
    console.log("Mock getFormData:", url)
    const resp = await PostReq(`${base_url}/recent_uploads`, { agent_id: currentUser.userid })
    console.log("resp", resp)

    const mockLeads = [
      {
        customer_name: "John Doe",
        mobile_num: "9876543210",
        email: "john@example.com",
        priority: "high",
        source: "website",
        lead_type: "HI",
      },
      {
        customer_name: "Jane Smith",
        mobile_num: "9123456789",
        email: "jane@example.com",
        priority: "medium",
        source: "social-media",
        lead_type: "NHI",
      },
    ]
    setFormData(resp.recent_lead_data)
  }

  const initialState = {
    lead_id: null,
    fname: "",
    lname: "",
    email: "",
    mob: "",
    fileName: "",
    leadSourceFrom: "social-media",
    file: null,
    priority: "low",
    language: "Marathi",
  }

  const [formState, setFormState] = useState(initialState)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const mylink = [
    { name: "Uploads Leads", icon: faCloudUploadAlt, redirectTo: "/#", isActive: true },
    { name: "Dashboard", icon: faUser, redirectTo: "/#/sales-advisor", isActive: false },
    { name: "Sales Advisor Dashboard", icon: faChartLine, redirectTo: "/#/sales-advisor-dashboard", isActive: false },
    { name: "Sales Manager Page", icon: faUserTie, redirectTo: "/#/sales-manager", isActive: false },
    { name: "Sales Manager Dashboard", icon: faChartLine, redirectTo: "/#/sales-manager-dashboard", isActive: false },
  ]

  useEffect(() => {
    console.log("form state", formState)
  }, [formState])

  useEffect(() => {
    getFormData(`${base_url}/recent_uploads`)

    const interval = setInterval(() => {
      if (!pollingRef.current) return
      getFormData(`${base_url}/recent_uploads`)
    }, 5000)

    return () => {
      clearInterval(interval)
      pollingRef.current = null
    }
  }, [])

  async function submitForm(formDataToSubmit:any) {
    setLoading(true)
    setError("")
    console.log("Submitting form data:", formDataToSubmit)

    const requiredFields = ["First Name", "Last Name", "Email", "Mobile Number", "Priority", "Lead Source"]
    const hasEmptyFields = requiredFields.some((field) => {
      const value = formDataToSubmit[field]
      return value === "" || value === null || value === undefined
    })

    if (hasEmptyFields) {
      setError("Please fill all fields of form")
      setLoading(false)
      return
    }

    const data = {
      lead_id: formDataToSubmit.lead_id,
      customer_name: formDataToSubmit["First Name"]+ " " + formDataToSubmit["Last Name"],
      mobile_num: formDataToSubmit["Mobile Number"],
      email: formDataToSubmit.Email,
      priority: formDataToSubmit.Priority,
      source: formDataToSubmit["Lead Source"],
      agent_id: currentUser.userid,
      pref_language: formDataToSubmit.Language || "Marathi",
      lead_type: "HI",
    }

    console.log("before submitting", data)
    try {
      await PostReq(`${base_url}/single_lead_upload`, data)
      setFormState(initialState)
      getFormData(`${base_url}/recent_uploads`)
    } catch (e) {
      console.error(e)
      setError("Failed to submit lead.")
    }
    setLoading(false)
  }

  return (
    <DataContext.Provider value={{ base_url, getFormData, formData }}>
      <div className="min-h-screen bg-slate-100 font-sans" style={{}}>
        {/* <Sidebar links={mylink} /> */}
        <div style={{}} className="mx-0 lg:mx-[8rem]">
          <div className="py-6">
            <Header title="Lead Management" dashboardLink="/#/" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Form state={formState} setState={setFormState} submitForm={submitForm} loading={loading} error={error} />
            <UploadComp />
          </div>

          <div className="mt-6 pb-8">
            <Table formState={formState} setFormState={setFormState} initialFormState={initialState} />
          </div>
        </div>
      </div>
    </DataContext.Provider>
  )
}

export default LeadDashboard
