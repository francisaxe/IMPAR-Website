import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { User, LogOut, Edit, Save, X, Lock } from 'lucide-react';
import axios from 'axios';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    nationality: user?.nationality || 'Portuguesa',
    district: user?.district || '',
    municipality: user?.municipality || '',
    parish: user?.parish || '',
    marital_status: user?.marital_status || '',
    religion: user?.religion || '',
    education_level: user?.education_level || '',
    profession: user?.profession || '',
    lived_abroad: user?.lived_abroad || false,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditMode(false);
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Falha ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      date_of_birth: user?.date_of_birth || '',
      gender: user?.gender || '',
      nationality: user?.nationality || 'Portuguesa',
      district: user?.district || '',
      municipality: user?.municipality || '',
      parish: user?.parish || '',
      marital_status: user?.marital_status || '',
      religion: user?.religion || '',
      education_level: user?.education_level || '',
      profession: user?.profession || '',
      lived_abroad: user?.lived_abroad || false,
    });
    setEditMode(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('As palavras-passe não coincidem');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('impar_token')}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      // Tentar ler como JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Erro ao fazer parse do JSON:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao mudar palavra-passe');
      }

      toast.success('Palavra-passe atualizada com sucesso!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Erro na mudança de password:', error);
      toast.error(error.message || 'Falha ao mudar palavra-passe');
    } finally {
      setLoading(false);
    }
  };

  const distritos = [
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco',
    'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
    'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
    'Viana do Castelo', 'Vila Real', 'Viseu',
    'Açores', 'Madeira'
  ];

  const generos = ['Masculino', 'Feminino', 'Outro'];
  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'União de Facto', 'Divorciado(a)', 'Viúvo(a)'];
  const niveisEscolaridade = [
    'Ensino Básico - 1º Ciclo',
    'Ensino Básico - 2º Ciclo',
    'Ensino Básico - 3º Ciclo',
    'Ensino Secundário',
    'Curso Profissional',
    'Licenciatura',
    'Mestrado',
    'Doutoramento'
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="profile-page">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* User Identity Card */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardContent className="py-12 text-center">
            <div className="w-24 h-24 bg-zinc-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-zinc-600" />
            </div>
            <h1 className="font-serif text-2xl font-medium text-zinc-900 mb-1">
              {user?.name}
            </h1>
            <p className="text-zinc-500 text-sm">{user?.email}</p>
            <p className="text-xs text-zinc-400 mt-2 capitalize">
              {user?.role === 'owner' ? 'Proprietário' : user?.role === 'admin' ? 'Administrador' : 'Utilizador'}
            </p>
          </CardContent>
        </Card>

        {/* Personal Data Section */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-medium">Dados Pessoais</CardTitle>
              {!editMode ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-600 hover:text-zinc-900"
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-600"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-zinc-900 text-white hover:bg-zinc-800"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telemóvel</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="rounded-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="rounded-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {generos.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="rounded-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="district">Distrito</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData({ ...formData, district: value })}>
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Selecione o distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {distritos.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="municipality">Concelho</Label>
                    <Input
                      id="municipality"
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      className="rounded-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parish">Freguesia</Label>
                    <Input
                      id="parish"
                      value={formData.parish}
                      onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
                      className="rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="marital_status">Estado Civil</Label>
                    <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
                      <SelectTrigger className="rounded-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosCivis.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="religion">Religião</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="rounded-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="education_level">Nível de Escolaridade</Label>
                    <Select value={formData.education_level} onValueChange={(value) => setFormData({ ...formData, education_level: value })}>
                      <SelectTrigger className="rounded-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {niveisEscolaridade.map((nivel) => (
                          <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="profession">Profissão</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="rounded-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Nome</span>
                  <span className="text-zinc-900 text-sm font-medium">{user?.name || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Email</span>
                  <span className="text-zinc-900 text-sm">{user?.email || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Telemóvel</span>
                  <span className="text-zinc-900 text-sm">{user?.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Data de Nascimento</span>
                  <span className="text-zinc-900 text-sm">{formData.date_of_birth || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Género</span>
                  <span className="text-zinc-900 text-sm">{formData.gender || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Nacionalidade</span>
                  <span className="text-zinc-900 text-sm">{formData.nationality || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Distrito</span>
                  <span className="text-zinc-900 text-sm">{formData.district || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Concelho</span>
                  <span className="text-zinc-900 text-sm">{formData.municipality || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Freguesia</span>
                  <span className="text-zinc-900 text-sm">{formData.parish || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Estado Civil</span>
                  <span className="text-zinc-900 text-sm">{formData.marital_status || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Religião</span>
                  <span className="text-zinc-900 text-sm">{formData.religion || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Escolaridade</span>
                  <span className="text-zinc-900 text-sm">{formData.education_level || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Profissão</span>
                  <span className="text-zinc-900 text-sm">{formData.profession || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-sm">Viveu no Estrangeiro</span>
                  <span className="text-zinc-900 text-sm">{formData.lived_abroad ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-medium">Segurança</CardTitle>
              {!showPasswordChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-600 hover:text-zinc-900"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Mudar Palavra-passe
                </Button>
              )}
            </div>
          </CardHeader>
          {showPasswordChange && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Palavra-passe Atual</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="new_password">Nova Palavra-passe</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="rounded-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Mínimo 6 caracteres</p>
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirmar Nova Palavra-passe</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="rounded-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                      setShowPasswordChange(false);
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-zinc-900 text-white hover:bg-zinc-800"
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
                    Atualizar Palavra-passe
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Logout Button */}
        <div className="text-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-none border-red-500 text-red-500 hover:bg-red-50"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
