import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/img.png";
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex-shrink-0 flex items-center space-x-3">
            <Link to="/" className="flex items-center group">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                <img
                  src={logo || "/placeholder.svg"}
                  alt="Coconut Tender Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="ml-2 text-white text-xl md:text-2xl font-bold whitespace-nowrap group-hover:text-blue-200 transition-colors duration-300">
                Coconut Tender
              </span>
            </Link>
          </div>

          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>

            {user ? (
              <>
                <NavLink to={`/${user.role}`} className="bg-blue-700 hover:bg-blue-800">
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="bg-blue-700 hover:bg-blue-800">
                Login
              </NavLink>
            )}
          </div>

      
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-200 hover:bg-blue-700 focus:outline-none transition duration-200"
              aria-expanded="false"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

    
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
          <MobileNavLink to="/" onClick={toggleMobileMenu}>Home</MobileNavLink>
          <MobileNavLink to="/about" onClick={toggleMobileMenu}>About</MobileNavLink>
          <MobileNavLink to="/contact" onClick={toggleMobileMenu}>Contact</MobileNavLink>

          {user ? (
            <>
              <MobileNavLink to={`/${user.role}`} onClick={toggleMobileMenu}>
                Dashboard
              </MobileNavLink>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                className="w-full text-left text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <MobileNavLink 
              to="/login" 
              onClick={toggleMobileMenu}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Login
            </MobileNavLink>
          )}
        </div>
      </div>
    </nav>
  );
};


const NavLink = ({ to, children, className = '' }) => (
  <Link
    to={to}
    className={`text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${className}`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, onClick, className = '' }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium ${className}`}
  >
    {children}
  </Link>
);

export default Navbar;