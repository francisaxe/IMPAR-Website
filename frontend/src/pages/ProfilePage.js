import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Calendar, Shield, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <Badge className="rounded-sm bg-black text-white">Proprietário</Badge>;
      case 'admin':
        return <Badge className="rounded-sm bg-zinc-700 text-white">Administrador</Badge>;
      default:
        return <Badge variant="outline" className="rounded-sm">Utilizador</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-100 mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-zinc-900 mb-2">
            O Seu Perfil
          </h1>
          <p className="text-zinc-500">
            Gerir a informação da sua conta
          </p>
        </div>

        {/* Account Info Card */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-medium">Informação da Conta</CardTitle>
            <CardDescription>Detalhes da sua conta e função</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500">Função:</span>
              {getRoleBadge(user?.role)}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500">Membro desde:</span>
              <span>{formatDate(user?.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="rounded-lg border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-medium">Editar Perfil</CardTitle>
            <CardDescription>Atualize a informação do seu perfil público</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-zinc-600">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="O seu nome"
                  className="rounded-none border-zinc-300"
                  data-testid="profile-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm text-zinc-600">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Fale-nos sobre si..."
                  className="rounded-none border-zinc-300 min-h-[100px]"
                  data-testid="profile-bio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm text-zinc-600">URL do Avatar</Label>
                <Input
                  id="avatar"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://exemplo.com/avatar.jpg"
                  className="rounded-none border-zinc-300"
                  data-testid="profile-avatar"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                  data-testid="save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'A guardar...' : 'Guardar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
