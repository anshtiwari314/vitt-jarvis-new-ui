import { useEffect, useState, createContext, useContext } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudUploadAlt, faUser, faChartLine, faUserTie, faEdit, faCopy } from "@fortawesome/free-solid-svg-icons"
import { PostReq } from "../functions/requests"
import { useAuth } from "../context/AuthContext"
// --- Placeholder Components (Replace with your actual components) ---

// Mock Data Context for demonstration
const DataContext = createContext(null)
const useData = () => useContext(DataContext)

const Form = ({ state, setState, submitForm, loading, error }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setState((prevState) => ({ ...prevState, [name]: value }))
  }

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

export function Table({ setFormState, initialFormState }) {
  const { formData } = useData() // Using mock data from context
  const leads = formData || [] // Ensure leads is an array
  const hiLeads = Array.isArray(leads) ? leads.filter((l) => String(l?.lead_type || "").toUpperCase() === "HI") : []

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // 10 entries per page as requested

  // State to manage copy feedback message
  const [copyFeedback, setCopyFeedback] = useState({}) // { leadId: 'Copied!' }

  const [insightLoading, setInsightLoading] = useState({}) // { leadId: boolean }
  const [insightError, setInsightError] = useState({}) // { leadId: string }

  // Paginate and compute totals using only HI leads
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLeads = hiLeads.slice(indexOfFirstItem, indexOfLastItem)

  // Calculate total pages
  const totalPages = Math.ceil(hiLeads.length / itemsPerPage)

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Clamp currentPage when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1)
  }, [totalPages])

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

      window.open(`https://postfacto-health.netlify.app/#/${idOf}`, "_blank", "noopener,noreferrer")
      return
    }

    // If status is "N/A", do nothing
    if (lead.postfacto_status === "N/A") {
      return
    }

    // For "pending" status, generate new insight
    setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: true }))
    setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))

    try {
      const linkParams = lead.link_params || ""
      const cidMatch = linkParams.match(/cid_\w+/)
      const idOf = cidMatch ? cidMatch[0] : "cid_8459"
      const response = await PostReq(
        "https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis/main_router",
        {
          trigger_func: "trigger_metrics_HI",
          params: { session_id: idOf },
        },
      )
      console.log("Insight response:", response)

      if (response && response.msg) {
        // Open the insight URL in a new tab
        setToast({ message: response?.msg || "Insight generated successfully!", type: "success" })
        // window.open(response.url, "_blank", "noopener,noreferrer")
      } else {
        setToast({ message: "Failed to generate insight", type: "error" })
        throw new Error("No insight URL received from backend")
      }
    } catch (error) {
      console.error("Failed to generate insight:", error)
      setInsightError((prev) => ({
        ...prev,
        [uniqueLeadId]: "Failed to generate insight",
      }))
      setTimeout(() => {
        setInsightError((prev) => ({ ...prev, [uniqueLeadId]: "" }))
      }, 3000)
    } finally {
      setInsightLoading((prev) => ({ ...prev, [uniqueLeadId]: false }))
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

    // Default for "pending" and other statuses
    return `${baseClasses} bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white focus:ring-green-500`
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxButtons = 5 // current centered + neighbors
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
  const startItem = totalItems === 0 ? 0 : indexOfFirstItem + 1
  const endItem = Math.min(indexOfLastItem, totalItems)

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Recent Uploaded Leads</h3>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentLeads.map((lead, index) => {
                  // Ensure lead.link_params exists for the link generation
                  const linkToCopy = lead.link_params
                    ? `${window.location.protocol}//${window.location.host}/#/mainpage/?${lead.link_params}`
                    : "#" // Fallback link if link_params is missing

                  // Using a combination of lead.id (if available) and index for unique key
                  const uniqueLeadId = lead.id || `lead-${indexOfFirstItem + index}`
                  //console.log(lead,linkToCopy)
                  return (
                    <tr key={uniqueLeadId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.mob}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lead.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{lead.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{lead.source}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center space-x-2">
                        {/* Display the link text (optional, if you want it visible) target="_blank"*/}
                        <a href={linkToCopy} className="text-blue-600 hover:underline" rel="noopener noreferrer">
                          Link
                        </a>

                        <button
                          onClick={() => copyToClipboard(linkToCopy, uniqueLeadId)}
                          className="text-sky-600 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                          title="Copy Link"
                        >
                          <FontAwesomeIcon icon={faCopy} className="w-4 h-4" /> {/* Adjusted icon size slightly */}
                        </button>

                        {/* Display feedback message */}
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
                          >
                            {getInsightButtonText(lead, insightLoading[uniqueLeadId])}
                          </button>
                          {insightError[uniqueLeadId] && (
                            <span className="text-xs text-red-600 font-medium">{insightError[uniqueLeadId]}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Range info */}
            <div className="text-sm text-slate-600">
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

            {/* Pagination controls */}
            {totalPages > 1 && (
              <nav
                className="inline-flex items-center gap-1"
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
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Last
                </button>
              </nav>
            )}

            {/* Rows per page */}
            <div className="flex items-center gap-2">
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
  // Changed to named export
  return (
    <div className="hidden md:block fixed h-full bg-white text-slate-800 w-64 p-6 shadow-lg rounded-r-lg border-r border-slate-100">
      <div className="mb-10 pt-2">
        {/* Placeholder for a logo or more prominent title */}
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-wide">Lead Management</h2>
        <p className="text-sm text-slate-500 mt-1">Panel</p>
      </div>
      {/* <nav>
        <ul>
          {links.map((link, index) => (
            <li key={index} className="mb-3">
              <a
                href={link.redirectTo}
                className={`flex items-center p-3 rounded-lg text-base font-medium transition-all duration-250 ease-in-out
                  ${link.isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-500' // Faint blue background, darker text, left border
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800' // Faint hover background, slightly darker text
                  }`}
              >
                <FontAwesomeIcon icon={link.icon} className="mr-4 text-xl" />
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav> */}
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

// --- Main LeadDashboard Component ---

function LeadDashboard() {
  const [formData, setFormData] = useState([]) // Mock for useData's formData
  const base_url = "https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis"
  const { currentUser } = useAuth()

  const getFormData = async (url) => {
    console.log("Mock getFormData:", url)
    // Simulate fetching data
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
    fileName: "", // Not used in Form component directly, kept for consistency
    leadSourceFrom: "social-media",
    file: null, // Not used in Form component directly, kept for consistency
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
    // Initial data fetch simulation
    getFormData(`${base_url}/recent_uploads`)
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
      customer_name: formState.fname + " " + formState.lname, // Combined name for mock
      mobile_num: formState.mob,
      email: formState.email,
      priority: formState.priority,
      source: formState.leadSourceFrom,
      agent_id: currentUser.userid,
    }

    console.log("before submitting", data)
    try {
      await PostReq(`${base_url}/single_lead_upload`, data)
      setFormState(initialState)
      getFormData(`${base_url}/recent_uploads`) // Refresh data after submission
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
        <div style={{ margin: "0 8%" }}>
          <div className="py-6">
            <Header title="Lead Management" dashboardLink="/#/" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Form state={formState} setState={setFormState} submitForm={submitForm} loading={loading} error={error} />
            <UploadComp />
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
