import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As palavras-passe não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha no registo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4 py-12" data-testid="register-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl font-semibold text-zinc-900 dark:text-white">IMPAR</span>
          </Link>
        </div>

        <Card className="rounded-none border border-zinc-200 dark:border-zinc-800 shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-serif text-2xl font-medium">Criar uma conta</CardTitle>
            <CardDescription>Introduza os seus dados para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-none border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                  data-testid="register-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-none border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                  data-testid="register-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Palavra-passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-none border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white pr-10"
                    data-testid="register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Palavra-passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="rounded-none border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
                  data-testid="register-confirm-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 btn-hover-lift"
                disabled={loading}
                data-testid="register-submit"
              >
                {loading ? 'A criar conta...' : 'Criar Conta'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-black dark:text-white hover:underline"
                data-testid="login-link"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
