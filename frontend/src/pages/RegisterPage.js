import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox.jsx';
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
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        nationality: formData.nationality,
        district: formData.district,
        municipality: formData.municipality,
        parish: formData.parish,
        marital_status: formData.marital_status,
        religion: formData.religion,
        education_level: formData.education_level,
        profession: formData.profession,
        lived_abroad: formData.lived_abroad === 'Sim',
        accept_notifications: formData.accept_notifications,
      };
      
      await register(registerData.email, registerData.password, registerData.name, registerData);
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
      <div className="w-full max-w-2xl">
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
        <Card className="rounded-lg border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-2 text-center">
              Criar Conta
            </h2>
            <p className="text-center text-sm text-zinc-500 mb-8">
              Registe-se na IMPAR
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-zinc-700">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-sm border-zinc-300"
                  data-testid="register-name"
                />
              </div>

              {/* Email e Telemóvel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-zinc-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-sm border-zinc-300"
                    data-testid="register-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-zinc-700">
                    Telemóvel <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Número de telemóvel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="rounded-sm border-zinc-300"
                    data-testid="register-phone"
                  />
                </div>
              </div>

              {/* Palavra-passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-zinc-700">
                  Palavra-passe <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Palavra-passe (mín 6 caracteres)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-sm border-zinc-300 pr-10"
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

              {/* Data de Nascimento e Género */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm text-zinc-700">
                    1. Data de Nascimento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    placeholder="DD/MM/AAAA"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                    className="rounded-sm border-zinc-300"
                    data-testid="register-dob"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm text-zinc-700">
                    2. Género <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm border-zinc-300">
                      <SelectValue placeholder="Selecione o género" />
                    </SelectTrigger>
                    <SelectContent>
                      {generos.map((genero) => (
                        <SelectItem key={genero} value={genero}>
                          {genero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nacionalidade */}
              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-sm text-zinc-700">
                  3. Nacionalidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationality"
                  type="text"
                  placeholder="Nacionalidade"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  required
                  className="rounded-sm border-zinc-300"
                  data-testid="register-nationality"
                />
              </div>

              {/* Onde Vive */}
              <div className="space-y-4">
                <Label className="text-sm text-zinc-700 font-medium">
                  4. Onde Vive <span className="text-red-500">*</span>
                </Label>
                
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm text-zinc-600">
                    Distrito <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm border-zinc-300">
                      <SelectValue placeholder="Selecione o distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {distritos.map((distrito) => (
                        <SelectItem key={distrito} value={distrito}>
                          {distrito}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="municipality" className="text-sm text-zinc-600">
                      Concelho
                    </Label>
                    <Input
                      id="municipality"
                      type="text"
                      placeholder="Concelho"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className="rounded-sm border-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parish" className="text-sm text-zinc-600">
                      Freguesia
                    </Label>
                    <Input
                      id="parish"
                      type="text"
                      placeholder="Freguesia"
                      value={formData.parish}
                      onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
                      className="rounded-sm border-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* Estado Civil e Religião */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marital_status" className="text-sm text-zinc-700">
                    5. Estado Civil <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.marital_status}
                    onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm border-zinc-300">
                      <SelectValue placeholder="Selecione o estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosCivis.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion" className="text-sm text-zinc-700">
                    6. Religião <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="religion"
                    type="text"
                    placeholder="Religião"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    required
                    className="rounded-sm border-zinc-300"
                  />
                </div>
              </div>

              {/* Nível de Escolaridade e Profissão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education_level" className="text-sm text-zinc-700">
                    7. Nível de Escolaridade <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.education_level}
                    onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                    required
                  >
                    <SelectTrigger className="rounded-sm border-zinc-300">
                      <SelectValue placeholder="Nível mais elevado completado" />
                    </SelectTrigger>
                    <SelectContent>
                      {niveisEscolaridade.map((nivel) => (
                        <SelectItem key={nivel} value={nivel}>
                          {nivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-sm text-zinc-700">
                    8. Profissão <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="profession"
                    type="text"
                    placeholder="Profissão"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    required
                    className="rounded-sm border-zinc-300"
                  />
                </div>
              </div>

              {/* Viveu no Estrangeiro */}
              <div className="space-y-2">
                <Label htmlFor="lived_abroad" className="text-sm text-zinc-700">
                  9. Já viveu no estrangeiro? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.lived_abroad}
                  onValueChange={(value) => setFormData({ ...formData, lived_abroad: value })}
                  required
                >
                  <SelectTrigger className="rounded-sm border-zinc-300">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notificações */}
              <div className="flex items-start space-x-3 py-4">
                <Checkbox
                  id="accept_notifications"
                  checked={formData.accept_notifications}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, accept_notifications: checked })
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="accept_notifications"
                  className="text-sm text-zinc-600 leading-relaxed cursor-pointer"
                >
                  Aceito receber notificações por email quando forem publicadas novas sondagens
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800 py-6 text-base"
                disabled={loading}
                data-testid="register-submit"
              >
                {loading ? 'A registar...' : 'Registar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-500">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="text-zinc-900 hover:underline font-medium"
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
