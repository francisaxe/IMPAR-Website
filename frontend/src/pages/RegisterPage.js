import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Portuguesa',
    district: '',
    municipality: '',
    parish: '',
    marital_status: '',
    religion: '',
    education_level: '',
    profession: '',
    lived_abroad: '',
    accept_notifications: false,
  });

  // Distritos de Portugal
  const distritos = [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 
    'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 
    'Viana do Castelo', 'Vila Real', 'Viseu', 
    'Açores', 'Madeira'
  ];

  const generos = ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'];
  
  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'União de Facto', 'Divorciado(a)', 'Viúvo(a)'];
  
  const niveisEscolaridade = [
    'Ensino Básico - 1º Ciclo',
    'Ensino Básico - 2º Ciclo',
    'Ensino Básico - 3º Ciclo',
    'Ensino Secundário',
    'Licenciatura',
    'Mestrado',
    'Doutoramento'
  ];

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
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-12" data-testid="register-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-serif text-4xl font-normal text-zinc-900">IMPAR</h1>
          </Link>
          <p className="font-serif text-sm text-zinc-500 italic mt-2">
            Jornalismo factual. Imparcialidade por método.
          </p>
        </div>

        {/* Form Card */}
        <Card className="rounded-none border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            <h2 className="font-serif text-xl font-medium text-zinc-900 mb-6 text-center">
              Criar uma conta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-zinc-600">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="O seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-none border-zinc-300"
                  data-testid="register-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-zinc-600">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-none border-zinc-300"
                  data-testid="register-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-zinc-600">
                  Palavra-passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-none border-zinc-300 pr-10"
                    data-testid="register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-zinc-600">
                  Confirmar palavra-passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="rounded-none border-zinc-300"
                  data-testid="register-confirm-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                disabled={loading}
                data-testid="register-submit"
              >
                {loading ? 'A criar conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-500">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-zinc-900 hover:underline"
                data-testid="login-link"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
