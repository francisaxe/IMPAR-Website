import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Home, ClipboardList, MessageCircle, Lightbulb, Info, User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/surveys', label: 'Sondagens', icon: ClipboardList },
    { path: '/responses', label: 'Respostas', icon: MessageCircle, requiresAuth: true },
    { path: '/suggest', label: 'Sugerir', icon: Lightbulb, requiresAuth: true },
    { path: '/about', label: 'Sobre', icon: Info },
  ];

  return (
    <nav className="bg-white border-b border-zinc-200" data-testid="navbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="navbar-logo">
            <span className="font-serif text-xl font-normal tracking-tight text-zinc-900">IMPAR</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors rounded-sm ${
                    isActive(item.path)
                      ? 'text-zinc-900 bg-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User Menu / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors rounded-sm ${
                      isActive('/profile')
                        ? 'text-zinc-900 bg-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                    data-testid="user-menu-trigger"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Perfil</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-zinc-500">
                    {user.name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Painel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Definições
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
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors rounded-sm ${
                  isActive('/login') || isActive('/register')
                    ? 'text-zinc-900 bg-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
                data-testid="login-btn"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
