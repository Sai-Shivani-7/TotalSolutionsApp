import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Scroller = ({ userRole }) => {
  const [scrollerMessages, setScrollerMessages] = useState([]);
  const navigate = useNavigate();

  const handleAnnouncementClick = (link) => {
    if (!link) return;
    
    // Check if it's an external URL (starts with http:// or https://)
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      // Internal route - use React Router navigation
      navigate(link);
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = sessionStorage.getItem("token");
        
        // Prepare headers conditionally - only add Authorization if token exists
        const headers = token ? { Authorization: `${token}` } : {};

        const res = await axios.get(`/api/superadmin/announcements`, {
          headers,
        });

        // Handle both possible response shapes
        const allAnnouncements = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        if (!Array.isArray(allAnnouncements)) {
          console.error("Announcements response is not an array:", res.data);
          setScrollerMessages([]);
          return;
        }

        const now = new Date();

        // Filter announcements for scroller
        const filtered = allAnnouncements.filter((ann) => {
          if (!ann.displayInScroller) return false;

          // check if it's within 24 hours
          const createdAt = new Date(ann.createdAt);
          const hoursSince = (now - createdAt) / (1000 * 60 * 60);
          if (hoursSince > 24) return false;

          // if superadmin, show regardless of targetType/targetRoles
          if (userRole === "superadmin") return true;

          // Show public announcements to non-authenticated users
          if (userRole === "public" && ann.targetType === "public") {
            return true;
          }

          // Show "all" announcements to everyone (authenticated and non-authenticated)
          if (ann.targetType === "all" || !ann.targetType) {
            return true;
          }

          // Show role-specific announcements to authenticated users with matching roles
          if (ann.targetType === "specific" && userRole && userRole !== "public") {
            return ann.targetRoles?.includes(userRole);
          }

          return false;
        });

        setScrollerMessages(filtered);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        // For public users, if there's an auth error (401/403), it's expected
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("No authentication token for public user - this is expected");
        }
        setScrollerMessages([]); // fallback to avoid crash
      }
    };

    fetchAnnouncements();
  }, [userRole]);

  if (scrollerMessages.length === 0) return null;

  return (
    <div className="bg-[#fde8e8] text-[#ab1c1c] py-2 overflow-hidden shadow-sm border-b border-[#fca5a5]">
      <div className="animate-marquee whitespace-nowrap">
        {scrollerMessages.map((ann, idx) => (
          ann.link ? (
            <span 
              key={ann._id || idx} 
              className="mx-10 font-medium cursor-pointer hover:underline hover:text-[#8b1515] transition-colors" 
              onClick={() => handleAnnouncementClick(ann.link)}
              title={`Click to visit: ${ann.link}`}
            >
              📢 {ann.message}
            </span>
          ) : (
            <span key={ann._id || idx} className="mx-10 font-medium">
              📢 {ann.message}
            </span>
          )
        ))}
      </div>

      {/* Animation style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Scroller;
