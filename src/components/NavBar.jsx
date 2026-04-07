import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Plane, Hotel, User2, LogOut, ChevronDown } from "lucide-react";

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Read auth state from localStorage on mount
   useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("authChange", syncUser);
    return () => window.removeEventListener("authChange", syncUser);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  return (
    <div className="w-full bg-blue-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top section */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div
            className="text-xl sm:text-2xl font-bold text-white cursor-pointer"
            onClick={() => navigate("/")}
          >
            TravelVerse
          </div>

          {/* Auth area — single position, toggled by state */}
          <div className="relative" ref={dropdownRef}>
            {!user ? (
              /* ── Not logged in: Login button ── */
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow-sm text-sm"
              >
                Login
              </button>
            ) : (
              /* ── Logged in: User avatar + dropdown ── */
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 transition-colors border border-blue-700"
              >
                {/* Avatar circle */}
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
                  <User2 size={15} className="text-blue-700" />
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">
                  {user.fullName?.split(" ")[0] || user.email?.split("@")[0] || "Account"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-blue-300 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}

            {/* Dropdown menu */}
            {dropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.fullName || "Guest"}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { navigate("/bookings"); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    My Bookings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom section - tabs */}
        <div className="flex gap-3 sm:gap-4 pb-4">
          <NavLink
            to="/flight"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all ${
                isActive
                  ? "bg-white text-blue-600 shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`
            }
          >
            <Plane size={18} />
            <span className="text-sm sm:text-base">Flight</span>
          </NavLink>

          <NavLink
            to="/hotel"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all ${
                isActive
                  ? "bg-white text-blue-600 shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`
            }
          >
            <Hotel size={18} />
            <span className="text-sm sm:text-base">Hotel</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavBar;