import React, { useEffect, useState } from "react";
import axios from "axios";
import dustbin from "../assets/Delete.png"; // <-- your dustbin image

const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ab1c1c]"></div>
  </div>
);

export default function Announcement() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    message: "",
    link: "",
    displayInScroller: false,
    targetType: "all",
    targetRoles: [],
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);

  const ROLE_OPTIONS = [
    { key: "admin", label: "Admin" },
    { key: "parent", label: "Parent" },
    { key: "doctor", label: "Doctor" },
    { key: "therapist", label: "Therapist" },
    { key: "superadmin", label: "Superadmin" },
  ];

  useEffect(() => {
    const r = sessionStorage.getItem("role");
    const token = sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setRole(r);
    fetchAnnouncements(r);
  }, []);

  const fetchAnnouncements = async (userRole) => {
  try {
    setLoading(true);
    const token = sessionStorage.getItem("token");
    const endpoint = `/api/superadmin/announcements`;
    const res = await axios.get(endpoint, {
      headers: { Authorization: `${token}` },
    });

    // Extract announcements
    let allAnnouncements = res.data || [];
    console.log("All Announcements from API:", allAnnouncements);
    console.log("User Role:", userRole);
    // 👇 Superadmin sees all. Others see only relevant ones.
    if (userRole !== "superadmin") {
      console.log("Filtering announcements for role:", userRole);
      allAnnouncements = allAnnouncements.filter((a) => {
        if (a.targetType === "all") return true;
        if (a.targetType === "specific" && Array.isArray(a.targetRoles)) {
          return a.targetRoles.includes(userRole);
        }
        return false;
      });
    }
    console.log("Fetched Announcements:", allAnnouncements);
    setAnnouncements(allAnnouncements);
  } catch (err) {
    console.error("Error fetching announcements:", err);
  } finally {
    setLoading(false);
  }
};


  const resetForm = () => {
    setForm({
      message: "",
      link: "",
      displayInScroller: false,
      targetType: "all",
      targetRoles: [],
    });
    setEditingAnnouncement(null);
    setDropdownOpen(false);
  };

  const toggleRoleInForm = (roleKey) => {
    setForm((prev) => {
      const exists = prev.targetRoles.includes(roleKey);
      return {
        ...prev,
        targetRoles: exists
          ? prev.targetRoles.filter((r) => r !== roleKey)
          : [...prev.targetRoles, roleKey],
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.message.trim()) {
      console.error("Please enter announcement text.");
      return;
    }
    if (form.targetType === "specific" && form.targetRoles.length === 0) {
      console.error("Please select at least one target role.");
      return;
    }

    try {
      setSubmitting(true);
      const token = sessionStorage.getItem("token");
      
      if (editingAnnouncement) {
        // Edit existing announcement
        await axios.put(
          `/api/superadmin/announcements/${editingAnnouncement._id || editingAnnouncement.id}`,
          {
            message: form.message,
            link: form.link && form.link.trim() ? form.link.trim() : null,
            displayInScroller: !!form.displayInScroller,
            targetType: form.targetType,
            targetRoles: form.targetType === "specific" ? form.targetRoles : [],
          },
          {
            headers: { Authorization: `${token}` },
          }
        );
        setShowEditModal(false);
        setEditingAnnouncement(null);
      } else {
        // Create new announcement
        await axios.post(
          "/api/superadmin/announcements",
          {
            message: form.message,
            link: form.link && form.link.trim() ? form.link.trim() : null,
            displayInScroller: !!form.displayInScroller,
            targetType: form.targetType,
            targetRoles: form.targetType === "specific" ? form.targetRoles : [],
          },
          {
            headers: { Authorization: `${token}` },
          }
        );
        setShowAddModal(false);
      }
      
      await fetchAnnouncements(role);
      resetForm();
    } catch (err) {
      console.error("Error saving announcement:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      message: announcement.message,
      link: announcement.link || "",
      displayInScroller: announcement.displayInScroller,
      targetType: announcement.targetType,
      targetRoles: announcement.targetRoles || [],
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    if (deletingIds.includes(id)) return;

    try {
      setDeletingIds((prev) => [...prev, id]);
      const token = sessionStorage.getItem("token");
      await axios.delete(`/api/superadmin/announcements/${id}`, {
        headers: { Authorization: `${token}` },
      });
      setAnnouncements((prev) => prev.filter((a) => a._id !== id && a.id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Failed to delete announcement. Please try again.");
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#ab1c1c]">Announcements</h1>

        {role === "superadmin" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#ab1c1c] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            + Add Announcement
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-[#ab1c1c] mb-4">Current Announcements</h2>

        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements have been posted yet.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => {
              const id = ann._id || ann.id;
              const isDeleting = deletingIds.includes(id);

              return (
                <div
                  key={id}
                  className="p-4 rounded-lg border border-gray-100 shadow-sm
               flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="md:pr-6 flex-1 min-w-0 text-left">
                    <p className="text-gray-800 font-medium break-words">
                      {ann.message}
                    </p>
                    {ann.link && (
                      <p className="text-sm text-blue-600 mt-1">
                        🔗 Links to: {ann.link}
                      </p>
                    )}
                  </div>

                  <div className="md:text-right md:items-end flex flex-col gap-2 md:gap-0 flex-none">
                    <p className="text-sm text-gray-500 italic whitespace-nowrap">
                      {new Date(ann.createdAt).toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 justify-end">
                      {role === "superadmin" && (
                        <>
                          <div className="text-sm text-gray-600 whitespace-nowrap">
                            {ann.displayInScroller ? (
                              <span className="mr-2 text-green-600 font-medium">Scroller Display</span>
                            ) : (
                              <span className="mr-2 text-gray-400">Not in Scroller</span>
                            )}
                            <span className="mx-2 text-gray-300">|</span>
                            <span>
                              Target:{" "}
                              {ann.targetType === "all"
                                ? "All Users"
                                : ann.targetType === "public" 
                                ? "Public (Non-Logged In)"
                                : ann.targetRoles && ann.targetRoles.length
                                ? ann.targetRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")
                                : "Specific Roles"}
                            </span>
                          </div>

                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleEdit(ann)}
                            title="Edit announcement"
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Edit announcement"
                          >
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* DELETE BUTTON using dustbin image */}
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={isDeleting}
                            title="Delete announcement"
                            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                              isDeleting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                            }`}
                            aria-label="Delete announcement"
                          >
                            {isDeleting ? (
                              <div className="w-5 h-5 border-b-2 border-red-500 rounded-full animate-spin" />
                            ) : (
                              <img
                                src={dustbin}
                                alt="Delete"
                                className="w-5 h-5 object-contain"
                                draggable={false}
                              />
                            )}
                          </button>
                        </>
                      )}

                      {role !== "superadmin" && (
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {ann.displayInScroller ? (
                            <span className="mr-2 text-green-600 font-medium">Scroller Display</span>
                          ) : (
                            <span className="mr-2 text-gray-400">Not in Scroller</span>
                          )}
                          <span className="mx-2 text-gray-300">|</span>
                          <span>
                            Target:{" "}
                            {ann.targetType === "all"
                              ? "All Users"
                              : ann.targetType === "public"
                              ? "Public (Non-Logged In)"
                              : ann.targetRoles && ann.targetRoles.length
                              ? ann.targetRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")
                              : "Specific Roles"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto relative border-t-4 border-[#ab1c1c]">
            <h3 className="text-2xl font-bold text-[#ab1c1c] mb-4">Add Announcement</h3>

            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={5}
              placeholder="Write announcement here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#ab1c1c] focus:border-[#ab1c1c] mb-4"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (Optional)
              </label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                placeholder="Internal route: /training OR External URL: https://google.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#ab1c1c] focus:border-[#ab1c1c]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Examples: /training, /contact, /services, https://example.com
              </p>
            </div>


            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={form.displayInScroller}
                onChange={(e) => setForm((p) => ({ ...p, displayInScroller: e.target.checked }))}
                className="form-checkbox h-4 w-4 text-[#ab1c1c] rounded"
              />
              <span className="text-gray-800">Display in the scroller</span>
            </label>

            <div className="mb-4">
              <label className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === "all"}
                  onChange={() => setForm((p) => ({ ...p, targetType: "all", targetRoles: [] }))}
                  className="form-radio h-4 w-4 text-[#ab1c1c]"
                />
                <span className="text-gray-800">All Users</span>
              </label>

              <label className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === "specific"}
                  onChange={() => setForm((p) => ({ ...p, targetType: "specific" }))}
                  className="form-radio h-4 w-4 text-[#ab1c1c]"
                />
                <span className="text-gray-800">Specific Roles</span>
              </label>

              <label className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === "public"}
                  onChange={() => setForm((p) => ({ ...p, targetType: "public", targetRoles: [] }))}
                  className="form-radio h-4 w-4 text-[#ab1c1c]"
                />
                <span className="text-gray-800">Public (Non-Logged In Users)</span>
              </label>

              {form.targetType === "specific" && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((s) => !s)}
                    type="button"
                    className="w-full text-left border border-gray-300 rounded-md p-2 flex items-center justify-between focus:outline-none bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      {form.targetRoles.length === 0 ? "Select roles..." : `${form.targetRoles.length} role(s) selected`}
                    </div>
                    <div className="text-gray-500">▾</div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto p-3">
                      {ROLE_OPTIONS.map((opt) => (
                        <label key={opt.key} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={form.targetRoles.includes(opt.key)}
                            onChange={() => toggleRoleInForm(opt.key)}
                            className="form-checkbox h-4 w-4 text-[#ab1c1c] rounded"
                          />
                          <span className="text-gray-800">{opt.label}</span>
                        </label>
                      ))}
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, targetRoles: ROLE_OPTIONS.map((r) => r.key) }))}
                          className="text-sm text-[#ab1c1c] hover:underline font-medium"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, targetRoles: [] }))}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full mt-3 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition-colors"
                      >
                        Done Selecting Roles
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-[#ab1c1c] hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>

            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-auto relative border-t-4 border-blue-600">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Edit Announcement</h3>

            <textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={5}
              placeholder="Write announcement here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 mb-4"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (Optional)
              </label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                placeholder="Internal route: /training OR External URL: https://google.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600"
              />
              <p className="text-sm text-gray-500 mt-1">
                Examples: /training, /contact, /services, https://example.com
              </p>
            </div>

            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={form.displayInScroller}
                onChange={(e) => setForm((p) => ({ ...p, displayInScroller: e.target.checked }))}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-800">Display in the scroller</span>
            </label>

            <div className="mb-4">
              <label className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="editTargetType"
                  checked={form.targetType === "all"}
                  onChange={() => setForm((p) => ({ ...p, targetType: "all", targetRoles: [] }))}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-gray-800">All Users</span>
              </label>

              <label className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="editTargetType"
                  checked={form.targetType === "specific"}
                  onChange={() => setForm((p) => ({ ...p, targetType: "specific" }))}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-gray-800">Specific Roles</span>
              </label>

              <label className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  name="editTargetType"
                  checked={form.targetType === "public"}
                  onChange={() => setForm((p) => ({ ...p, targetType: "public", targetRoles: [] }))}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="text-gray-800">Public (Non-Logged In Users)</span>
              </label>

              {form.targetType === "specific" && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((s) => !s)}
                    type="button"
                    className="w-full text-left border border-gray-300 rounded-md p-2 flex items-center justify-between focus:outline-none bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      {form.targetRoles.length === 0 ? "Select roles..." : `${form.targetRoles.length} role(s) selected`}
                    </div>
                    <div className="text-gray-500">▾</div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto p-3">
                      {ROLE_OPTIONS.map((opt) => (
                        <label key={opt.key} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={form.targetRoles.includes(opt.key)}
                            onChange={() => toggleRoleInForm(opt.key)}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-gray-800">{opt.label}</span>
                        </label>
                      ))}
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, targetRoles: ROLE_OPTIONS.map((r) => r.key) }))}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, targetRoles: [] }))}
                          className="text-sm text-gray-600 hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full mt-3 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition-colors"
                      >
                        Done Selecting Roles
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update"}
              </button>
            </div>

            <button
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
