"use client"

import { useEffect, useState, createContext, useContext, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudUploadAlt, faUser, faChartLine, faUserTie, faEdit, faCopy } from "@fortawesome/free-solid-svg-icons"
import { PostReq } from "../functions/requests"
import { useAuth } from "../context/AuthContext"
import NewLeadPopup from "../components/UI2/NewLeadPopup"
// --- Placeholder Components (Replace with your actual components) ---

// Mock Data Context for demonstration
const DataContext = createContext(null)
const useData = () => useContext(DataContext)

const Form = ({ state, setState, submitForm, loading, error }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    console.log("name,value", name, value)
    setState((prevState) => ({ ...prevState, [name]: value }))
  }

  console.log(loading,state,loading ? "Submitting..." : state?.lead_id ? "Upload Lead" : "Add Lead")
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex-1">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Lead</h3>
      <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div>
          <label htmlFor="fname" className="block text-slate-500 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="fname"
            name="fname"
            value={state.fname}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="lname" className="block text-slate-500 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lname"
            name="lname"
            value={state.lname}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-slate-500 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={state.email}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="mob" className="block text-slate-500 mb-1">
            Mobile Number
          </label>
          <input
            type="text"
            id="mob"
            name="mob"
            value={state.mob}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="leadSourceFrom" className="block text-slate-500 mb-1">
            Lead Source
          </label>
          <select
            id="leadSourceFrom"
            name="leadSourceFrom"
            value={state.leadSourceFrom}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          >
            <option value="social-media">Social Media</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-slate-500 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={state.priority}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="language" className="block text-slate-500 mb-1">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={state.language}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
          >
            <option value="low">English</option>
            <option value="medium">Marathi</option>
            {/* <option value="high"></option> */}
          </select>
        </div>
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

// Table component original structure with fix notes
export function Table({ setFormState, initialFormState }) {
  const { formData, base_url, getFormData } = useData() // Using mock data from context
  const leads = formData || [] // Ensure leads is an array
  const hiLeads = Array.isArray(leads) ? leads.filter((l) => String(l?.lead_type || "").toUpperCase() === "LI") : []

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Polling state management
  const pollingTimers = useRef<{ [key: string]: number | null }>({}) // Ref for managing interval IDs
  const [insightMsg, setInsightMsg] = useState({}) // { leadId: 'Message' }

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // 10 entries per page as requested

  // State to manage copy feedback message
  const [copyFeedback, setCopyFeedback] = useState({}) // { leadId: 'Copied!' }

  const [insightLoading, setInsightLoading] = useState({}) // { leadId: boolean }
  const [insightError, setInsightError] = useState({}) // { leadId: string }

  // --- Start: Calculate Pagination Variables (NO DUPLICATES HERE) ---

  // Paginate and compute totals using only HI leads
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLeads = hiLeads.slice(indexOfFirstItem, indexOfLastItem)

  // Calculate total pages
  const totalItems = hiLeads.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Display range for footer
  const startItem = totalItems === 0 ? 0 : indexOfFirstItem + 1
  const endItem = Math.min(indexOfLastItem, totalItems)

  // --- End: Calculate Pagination Variables ---


  // Clamp currentPage when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1)

    // Cleanup function for polling timers
    return () => {
      Object.values(pollingTimers.current).forEach((id) => {
        if (id) window.clearInterval(id)
      })
      pollingTimers.current = {}
    }
  }, [totalPages]) // Added totalPages as a dependency

  // Note: The rest of the polling logic (stopPolling, startPolling) remains the same.
  const MAIN_ROUTER_URL = `${base_url}/main_router` // Assuming this is defined or passed down

  const stopPolling = (uniqueLeadId: string) => {
    const id = pollingTimers.current[uniqueLeadId]
    if (id) {
      window.clearInterval(id)
      delete pollingTimers.current[uniqueLeadId]
    }
  }

  const startPolling = (sessionId: string, uniqueLeadId: string) => {
    if (pollingTimers.current[uniqueLeadId]) return // already polling

    // keep the current row in loading state while polling
    setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: true }))
    setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
    setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Checking dashboard status..." }))

    const timerId = window.setInterval(async () => {
      try {
        const pollResp = await PostReq(MAIN_ROUTER_URL, {
          trigger_func: "ins_postfacto_status_check",
          params: { session_id: sessionId },
        })
        const status = pollResp?.status // expects "done" | "pending"

        if (status === "done") {
          stopPolling(uniqueLeadId)
          setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Dashboard is ready" }))
          setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))

          // open the Postfacto dashboard
          window.open(`https://postfacto.netlify.app/#/${sessionId}`, "_blank", "noopener,noreferrer")

          // refresh the list so postfacto_status updates to 'done'
          if (typeof getFormData === "function" && base_url) {
            getFormData(`${base_url}/recent_uploads`)
          }
        } else if (status === "pending") {
          // continue polling; optional micro-feedback
          setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Preparing dashboard…" }))
        }
      } catch (_e) {
        // transient errors; keep polling
        setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "Status check failed, retrying..." }))
        setTimeout(() => {
          setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
        }, 1500)
      }
    }, 3000)

    pollingTimers.current[uniqueLeadId] = timerId
  }

  // NOTE: The original component had an issue where `useEffect` was not handling the cleanup correctly
  // for the `pollingTimers`. I have moved the cleanup logic into the `useEffect` that depends on `totalPages`
  // and made it run on unmount.

  function enableEdit(lead) {
    const { name, mob, email, priority, source, lead_id } = lead
    const [fname, ...restName] = name.split(" ")

    console.log("enable edit", lead)
    setFormState({
      ...initialFormState,
      lead_id,
      fname,
      lname: restName.join(" "),
      mob,
      email,
      priority,
      leadSourceFrom: source,
    })
  }

  const generateInsight = async (lead) => {
    const uniqueLeadId = lead.id || lead.lead_id || `lead-${lead.name}-${lead.mob}`

    if (lead.postfacto_status === "done") {
      const linkParams = lead.link_params || ""
      const cidMatch = linkParams.match(/cid_\w+/)
      const idOf = cidMatch ? cidMatch[0] : "cid_8459"

      window.open(`https://postfacto.netlify.app/#/${idOf}`, "_blank", "noopener,noreferrer")
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

      // Initial trigger
      const response = await PostReq(MAIN_ROUTER_URL, {
        trigger_func: "trigger_metrics_LI",
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
        // stop loading; user can try again later
        setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))
        return
      }

      // If backend ever returns immediate done (rare)
      if (response?.status === "done") {
        setInsightMsg((prev) => ({ ...prev, [uniqueLeadId]: "Dashboard is ready" }))
        setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))
        window.open(`https://postfacto.netlify.app/#/${sessionId}`, "_blank", "noopener,noreferrer")
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

  // --- Duplicate lines removed from here ---
  // const totalItems = hiLeads.length // DUPLICATE
  // const indexOfLastItem = currentPage * itemsPerPage // DUPLICATE
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage // DUPLICATE
  // const startItem = totalItems === 0 ? 0 : indexOfFirstItem + 1 // DUPLICATE
  // const endItem = Math.min(indexOfLastItem, totalItems) // DUPLICATE
  // const currentLeads = hiLeads.slice(indexOfFirstItem, indexOfLastItem) // DUPLICATE

  // const totalPages = Math.ceil(hiLeads.length / itemsPerPage) // DUPLICATE

  // const paginate = (pageNumber) => setCurrentPage(pageNumber) // DUPLICATE

  // useEffect(() => { // DUPLICATE of a useEffect call
  //   if (currentPage > totalPages) setCurrentPage(totalPages || 1)
  // }, [totalPages])
  // -----------------------------------------

  const copyToClipboard = (textToCopy, leadId) => {
    const textarea = document.createElement("textarea")
    textarea.value = textToCopy
    textarea.style.position = "fixed"
    textarea.style.opacity = 0
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
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Recent Uploaded Leads</h3>
      {hiLeads.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No LI leads found.</p>
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
                    Lead Type
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
                  const linkToCopy = lead.link_params
                    ? `${window.location.protocol}//${window.location.host}/#/mainpage/?${lead.link_params}&${lead.pref_language.toLowerCase()}`
                    : "#" // Fallback link if link_params is missing

                  const uniqueLeadId = lead.id || lead.lead_id || `lead-${lead.name}-${lead.mob}`
                  return (
                    <tr key={uniqueLeadId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.mob}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.lead_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{lead.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{lead.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center space-x-2">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <button
                          onClick={() => enableEdit(lead)}
                          className="text-sky-600 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                          title="Edit Lead"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
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

          {/* --- This pagination is responsive --- */}
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
                      className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${
                          currentPage === p
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        }`}
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
  const [formData, setFormData] = useState([]) // Mock for useData's formData
  const base_url = "https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis"
  const { currentUser } = useAuth()
  const pollingRef = useRef(null)
  const pollingRefs = useRef({})

  const [isPopupVisible,setIsPopupVisible] = useState(false)

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
        lead_type: "LI",
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
    language: "English",
    file: null,
    priority: "low",
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
    getFormData(`${base_url}/recent_uploads`)

    // Polling setup
    const interval = setInterval(() => {
      if (!pollingRef.current) return
      getFormData(`${base_url}/recent_uploads`)
    }, 5000)

    return () => {
      clearInterval(interval)
      pollingRef.current = null
    }
  }, [])

  async function submitForm(e) {
    setLoading(true)
    setError("")
    e.preventDefault()

    if (
      formState.fname === "" ||
      formState.lname === "" ||
      formState.email === "" ||
      formState.mob === "" ||
      formState.priority === "" ||
      formState.leadSourceFrom === ""
    ) {
      setError("Please fill all fields of form")
      setLoading(false)
      return
    }

    const data = {
      lead_id: formState.lead_id,
      customer_name: formState.fname + " " + formState.lname,
      mobile_num: formState.mob,
      email: formState.email,
      priority: formState.priority,
      source: formState.leadSourceFrom,
      agent_id: currentUser.userid,
      pref_language: formState.language,
      lead_type: "LI",
    }

    console.log("before submitting", data)


    try {
      await PostReq(`${base_url}/single_lead_upload`, data)
      setIsPopupVisible(true)
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
      <div className="min-h-screen bg-slate-100 font-sans">
        {/* <Sidebar links={mylink} /> */}
        <div style={{  }} className="mx-0 lg:mx-[8rem]">
          <div className="py-6">
            <Header title="Lead Management" dashboardLink="/#/" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Form state={formState} setState={setFormState} submitForm={submitForm} loading={loading} error={error} />
            <UploadComp />
            <NewLeadPopup isOpen={isPopupVisible} setIsOpen={setIsPopupVisible}/>
          </div>

          <div className="mt-6 pb-8">
            <Table formState={formState} setFormState={setFormState} />
          </div>
        </div>
      </div>
    </DataContext.Provider>
  )
}

export default LeadDashboard