// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function UsersView() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get("/api/superadmin/users", {
//           headers: { Authorization: sessionStorage.getItem("token") },
//         });
//         setUsers(response.data);
//         console.log(response.data);
//         setLoading(false);
//       } catch (error) {
//         setError("Failed to fetch users data");
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = roleFilter === "all" || user.role === roleFilter;
//     return matchesSearch && matchesRole;
//   });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(197,27,28)]"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-red-500 text-center py-8">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-6">Users</h2>
      
//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search users..."
//           className="px-4 py-2 border rounded-lg"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select
//           className="px-4 py-2 border rounded-lg"
//           value={roleFilter}
//           onChange={(e) => setRoleFilter(e.target.value)}
//         >
//           <option value="all">All Roles</option>
//           <option value="parent">Parent</option>
//           <option value="doctor">Doctor</option>
//           <option value="therapist">Therapist</option>
//           <option value="admin">Admin</option>
//           <option value="superadmin">Super Admin</option>
//         </select>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <table className="min-w-full">
//           <thead>
//             <tr className="bg-gray-50 text-left">
//               <th className="px-6 py-3 text-gray-600">Name</th>
//               {/* <th className="px-6 py-3 text-gray-600">Email</th> */}
//               <th className="px-6 py-3 text-gray-600">Role</th>
//               {/* <th className="px-6 py-3 text-gray-600">Phone</th> */}
//               <th className="px-6 py-3 text-gray-600">Centre</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredUsers
//               .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
//               .map((user) => (
//               <tr key={user._id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4">{user.name}</td>
//                 {/* <td className="px-6 py-4">{user.email}</td> */}
//                 <td className="px-6 py-4 capitalize">{user.role}</td>
//                 {/* <td className="px-6 py-4">{user.mobilenumber}</td> */}
//                 <td className="px-6 py-4">{user.centreId?.name || "-"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {filteredUsers.length > itemsPerPage && (
//         <div className="flex justify-center mt-6 gap-2">
//           <button
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className={`px-4 py-2 rounded ${
//               currentPage === 1
//                 ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 : "bg-[rgb(197,27,28)] text-white hover:bg-red-700"
//             }`}
//           >
//             Previous
//           </button>
//           <span className="px-4 py-2 text-gray-700">
//             Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
//           </span>
//           <button
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
//             disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
//             className={`px-4 py-2 rounded ${
//               currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)
//                 ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 : "bg-[rgb(197,27,28)] text-white hover:bg-red-700"
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import axios from "axios";

// =========================================================================
// 1. UserDetailsModal Component (The Name Click Popup)
// =========================================================================
const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 p-6 relative">
        {/* Cross symbol close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-150"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-[rgb(197,27,28)] mb-4 border-b pb-2">
          {user.name}'s Details
        </h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold w-24 inline-block">Role:</span>
            <span className="capitalize">{user.role}</span>
          </p>
          <p>

          </p>
          <p>
            <span className="font-semibold w-24 inline-block">Phone:</span>
            {user.mobilenumber || "N/A"}
          </p>
          <p>
            <span className="font-semibold w-24 inline-block">Centre:</span>
            {user.centreId?.name || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. WriteFeedbackPage Component (The New Page View)
// =========================================================================
const WriteFeedbackPage = ({ user, onBack, onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || !feedback.trim()) return;
    
    setIsSubmitting(true);
    // Call the parent component's async onSubmit handler and handle the promise
    // .catch is added to ensure isSubmitting is set to false even on API failure
    onSubmit(feedback).catch(() => {
        // Handle error inside onSubmit, but ensure finally runs here
    }).finally(() => {
        setIsSubmitting(false);
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      {/* Breadcrumb style navigation: User > Therapist > Write Feedback */}
      <div className="text-sm text-gray-500 mb-4">
        Users &gt; {user.name} &gt; Write Feedback
      </div>

      <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-4">
        Write Feedback for {user.name}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(197,27,28)] focus:border-transparent min-h-[200px]"
          placeholder={`Enter your feedback for ${user.name} here...`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        ></textarea>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[rgb(197,27,28)] text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// =========================================================================
// 3. Main UsersView Component
// =========================================================================
export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbackUser, setFeedbackUser] = useState(null);
  
  // Re-define fetchUsers outside of useEffect for potential re-use
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/superadmin/users", {
        headers: { Authorization: sessionStorage.getItem("token") },
      });
      setUsers(response.data);
      setLoading(false);
      return response.data; // Return data for potential chaining
    } catch (error) {
      setError("Failed to fetch users data");
      setLoading(false);
      throw error; // Propagate error
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleNameClick = (user) => {
    setSelectedUser(user);
  };

  const handleWriteFeedbackClick = (user) => {
    setFeedbackUser(user);
  };
  
  // FINAL ASYNC FUNCTION to handle secure API submission
  const handleFeedbackSubmit = async (user, feedbackText) => {
    try {
      console.log("Submitting feedback for user:", user._id);
      await axios.post(
        `/api/superadmin/therapists/${user._id}/feedback`,
        {
          content: feedbackText, // Content only, writerId is handled by the backend from the token
        },
        {
          headers: { Authorization: sessionStorage.getItem("token") },
        }
      );

      // Success: Show message and go back to users list
      alert(`Feedback for ${user.name} saved successfully!`);
      setFeedbackUser(null);
      // OPTIONAL: Re-fetch user list if you want to update the table immediately
      // fetchUsers(); 

    } catch (error) {
      console.error("Error saving feedback:", error.response?.data || error.message);
      alert("Failed to save feedback. Please check the console for error details.");
      throw error; // Re-throw to propagate failure
    }
  };


  const handleBackToUsers = () => {
      setFeedbackUser(null);
  }

  // Filtering Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Loading/Error States
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[rgb(197,27,28)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  // Conditional rendering for the Feedback Page
  if (feedbackUser) {
      return (
          <WriteFeedbackPage 
              user={feedbackUser} 
              onBack={handleBackToUsers}
              // Pass the submission function, binding the user context
              onSubmit={(feedbackText) => handleFeedbackSubmit(feedbackUser, feedbackText)}
          />
      );
  }

  // Main Users List View
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[rgb(197,27,28)] mb-6">Users</h2>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="parent">Parent</option>
          <option value="doctor">Doctor</option>
          <option value="therapist">Therapist</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-gray-600">Name</th>
              <th className="px-6 py-3 text-gray-600">Role</th>
              <th className="px-6 py-3 text-gray-600">Centre</th>
              <th className="px-6 py-3 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                
                {/* Name - Clickable with Info Icon */}
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleNameClick(user)}
                    className="flex items-center gap-1 text-[rgb(197,27,28)] hover:text-red-700 font-medium cursor-pointer transition duration-150 group"
                  >
                    <span>{user.name}</span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 text-gray-400 group-hover:text-red-700" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={2}
                        aria-label="View Details"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </td>
                
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">{user.centreId?.name || "-"}</td>
                
                {/* Actions column logic - Write Feedback Button */}
                <td className="px-6 py-4">
                  {user.role === "therapist" && (
                    <button
                      onClick={() => handleWriteFeedbackClick(user)}
                      className="text-sm bg-[rgb(197,27,28)] text-white px-3 py-1 rounded-full hover:bg-red-700 transition duration-150"
                    >
                      Write Feedback
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length > itemsPerPage && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[rgb(197,27,28)] text-white hover:bg-red-700"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
            disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[rgb(197,27,28)] text-white hover:bg-red-700"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* User Details Modal (Popup) */}
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}