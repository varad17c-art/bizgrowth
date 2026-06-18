import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-outline-variant/30 ${
        isScrolled 
          ? 'bg-surface/90 backdrop-blur-md shadow-md h-16' 
          : 'bg-surface/70 backdrop-blur-md shadow-sm h-20'
      }`}
      id="main-nav"
    >
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-margin-mobile md:px-margin-desktop h-full">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-85 transition-opacity">
          <span className="material-symbols-outlined icon-fill text-primary" style={{ fontSize: '28px' }}>public</span>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">BizGrowth</span>
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/ecosystem" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Ecosystem
          </NavLink>
          <NavLink 
            to="/marketplace" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Marketplace
          </NavLink>
          <NavLink 
            to="/consultants" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Consultants
          </NavLink>
          <NavLink 
            to="/events" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Events
          </NavLink>
          <NavLink 
            to="/resources" 
            className={({ isActive }) => 
              `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                isActive 
                  ? 'text-secondary font-bold border-secondary' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
              }`
            }
          >
            Resources
          </NavLink>
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 mr-3 ${
                    isActive 
                      ? 'text-secondary font-bold border-secondary' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/organizations" 
                className={({ isActive }) => 
                  `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 mr-3 ${
                    isActive 
                      ? 'text-secondary font-bold border-secondary' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
                  }`
                }
              >
                My Organizations
              </NavLink>
              <NavLink 
                to="/messages" 
                className={({ isActive }) => 
                  `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 mr-3 ${
                    isActive 
                      ? 'text-secondary font-bold border-secondary' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
                  }`
                }
              >
                Messages
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 mr-3 ${
                      isActive 
                        ? 'text-secondary font-bold border-secondary' 
                        : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
              <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                  `font-label-md text-label-md transition-all duration-300 pb-1 border-b-2 ${
                    isActive 
                      ? 'text-secondary font-bold border-secondary' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent'
                  }`
                }
              >
                Profile
              </NavLink>
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5 px-3 py-2">
                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                Hi, <span className="font-bold text-primary">{user.name}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="border border-outline text-primary hover:text-on-primary bg-transparent hover:bg-primary font-label-md text-label-md px-5 py-2.5 rounded-full transition-all duration-300 scale-95 active:scale-90 flex items-center justify-center font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="font-label-md text-label-md text-primary hover:bg-surface-container-low px-4 py-2 rounded-full transition-all duration-300 scale-95 active:scale-90 flex items-center justify-center font-semibold"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-md scale-95 active:scale-90 flex items-center justify-center font-semibold"
              >
                Join BizGrowth
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-primary p-2 hover:bg-surface-container-low rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer (Drop-down) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface border-b border-outline-variant/30 shadow-lg px-margin-mobile py-6 flex flex-col gap-3 animate-fade-in-up max-h-[calc(100vh-5rem)] overflow-y-auto z-50">
          <NavLink 
            to="/ecosystem" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Ecosystem
          </NavLink>
          <NavLink 
            to="/marketplace" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Marketplace
          </NavLink>
          <NavLink 
            to="/consultants" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Consultants
          </NavLink>
          <NavLink 
            to="/events" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Events
          </NavLink>
          <NavLink 
            to="/resources" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `font-label-md text-label-md py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-surface-container-low text-secondary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`
            }
          >
            Resources
          </NavLink>
          <div className="h-[1px] bg-outline-variant/30 my-1"></div>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-center font-label-md text-label-md text-on-surface-variant py-1 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                  Hi, <span className="font-bold text-primary">{user.name}</span>
                </div>
                <NavLink 
                  to="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `text-center font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-container-low transition-all font-semibold border mb-1 ${
                      isActive 
                        ? 'border-secondary text-secondary font-bold' 
                        : 'border-outline text-primary hover:bg-surface-container-low'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/organizations" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `text-center font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-container-low transition-all font-semibold border mb-1 ${
                      isActive 
                        ? 'border-secondary text-secondary font-bold' 
                        : 'border-outline text-primary hover:bg-surface-container-low'
                    }`
                  }
                >
                  My Organizations
                </NavLink>
                <NavLink 
                  to="/messages" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `text-center font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-container-low transition-all font-semibold border mb-1 ${
                      isActive 
                        ? 'border-secondary text-secondary font-bold' 
                        : 'border-outline text-primary hover:bg-surface-container-low'
                    }`
                  }
                >
                  Messages
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-center font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-container-low transition-all font-semibold border mb-1 ${
                        isActive 
                          ? 'border-secondary text-secondary font-bold' 
                          : 'border-outline text-primary hover:bg-surface-container-low'
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
                <NavLink 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `text-center font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-container-low transition-all font-semibold border mb-1.5 ${
                      isActive 
                        ? 'border-secondary text-secondary font-bold' 
                        : 'border-outline text-primary hover:bg-surface-container-low'
                    }`
                  }
                >
                  Profile
                </NavLink>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="text-center border border-outline text-primary font-label-md text-label-md py-2.5 rounded-full hover:bg-surface-container-low transition-all font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-label-md text-label-md text-primary hover:bg-surface-container-low py-2.5 rounded-full transition-all border border-outline-variant/50 font-semibold"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center bg-primary text-on-primary font-label-md text-label-md py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md font-semibold"
                >
                  Join BizGrowth
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
