import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { User, LogOut, Settings, Shield, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <span className="font-serif text-2xl font-semibold tracking-tight">IMPAR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/surveys"
              className={`text-sm font-medium transition-colors hover:text-black dark:hover:text-white ${
                isActive('/surveys') ? 'text-black dark:text-white' : 'text-zinc-500'
              }`}
              data-testid="nav-surveys"
            >
              Inquéritos
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-black dark:hover:text-white ${
                  isActive('/dashboard') ? 'text-black dark:text-white' : 'text-zinc-500'
                }`}
                data-testid="nav-dashboard"
              >
                Painel
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-black dark:hover:text-white ${
                  isActive('/admin') ? 'text-black dark:text-white' : 'text-zinc-500'
                }`}
                data-testid="nav-admin"
              >
                Administração
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/surveys/create" className="hidden sm:block">
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-none bg-black text-white hover:bg-zinc-800 btn-hover-lift"
                    data-testid="create-survey-btn"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Inquérito
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-zinc-200 dark:border-zinc-700"
                      data-testid="user-menu-trigger"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none w-48">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Painel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                      <Settings className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="menu-admin">
                          <Shield className="w-4 h-4 mr-2" />
                          Administração
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none"
                    data-testid="login-btn"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="rounded-none bg-black text-white hover:bg-zinc-800 btn-hover-lift"
                    data-testid="register-btn"
                  >
                    Começar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800 animate-slideUp">
            <div className="flex flex-col gap-2">
              <Link
                to="/surveys"
                className="px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inquéritos
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Painel
                  </Link>
                  <Link
                    to="/surveys/create"
                    className="px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Criar Inquérito
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Administração
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
