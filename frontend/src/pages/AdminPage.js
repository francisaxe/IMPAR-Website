import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users, MessageSquare, Shield, Trash2, Send } from 'lucide-react';

const AdminPage = () => {
  const { api, isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, suggestionsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/suggestions'),
      ]);
      setUsers(usersRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success('User role updated');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.item) return;
    try {
      await api.delete(`/admin/users/${deleteDialog.item.id}`);
      setUsers(users.filter((u) => u.id !== deleteDialog.item.id));
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const handleSuggestionStatus = async (suggestionId, status) => {
    try {
      await api.put(`/suggestions/${suggestionId}/status?status=${status}`);
      setSuggestions(
        suggestions.map((s) => (s.id === suggestionId ? { ...s, status } : s))
      );
      toast.success('Suggestion status updated');
    } catch (error) {
      toast.error('Failed to update suggestion');
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!deleteDialog.item) return;
    try {
      await api.delete(`/suggestions/${deleteDialog.item.id}`);
      setSuggestions(suggestions.filter((s) => s.id !== deleteDialog.item.id));
      toast.success('Suggestion deleted');
    } catch (error) {
      toast.error('Failed to delete suggestion');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const submitSuggestion = async () => {
    if (!newSuggestion.trim()) return;
    try {
      const response = await api.post('/suggestions', { content: newSuggestion });
      setSuggestions([response.data, ...suggestions]);
      setNewSuggestion('');
      toast.success('Suggestion submitted');
    } catch (error) {
      toast.error('Failed to submit suggestion');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <Badge className="rounded-none bg-black text-white">Owner</Badge>;
      case 'admin':
        return <Badge className="rounded-none bg-zinc-700 text-white">Admin</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none">User</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="rounded-none text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="rounded-none text-blue-600 border-blue-600">Reviewed</Badge>;
      case 'implemented':
        return <Badge variant="outline" className="rounded-none text-green-600 border-green-600">Implemented</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="rounded-none text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="admin-page">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="label-caps mb-2">Administration</p>
          <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
            Admin Panel
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{users.length}</p>
                <p className="text-xs text-zinc-500">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">
                  {users.filter((u) => u.role === 'admin' || u.role === 'owner').length}
                </p>
                <p className="text-xs text-zinc-500">Admins</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{suggestions.length}</p>
                <p className="text-xs text-zinc-500">Suggestions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">
                  {suggestions.filter((s) => s.status === 'pending').length}
                </p>
                <p className="text-xs text-zinc-500">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="rounded-none bg-zinc-100 dark:bg-zinc-800 p-1">
            <TabsTrigger value="users" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <MessageSquare className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="font-serif text-xl">User Management</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      {isOwner && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {isOwner && user.role !== 'owner' ? (
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-28 rounded-none h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(user.role)
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        {isOwner && (
                          <TableCell className="text-right">
                            {user.role !== 'owner' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ open: true, type: 'user', item: user })}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                data-testid={`delete-user-${user.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="space-y-6">
              {/* Submit Suggestion */}
              <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Submit Suggestion</CardTitle>
                  <CardDescription>Share your ideas to improve the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Textarea
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="Your suggestion..."
                      className="rounded-none border-zinc-300 dark:border-zinc-700 flex-1"
                      data-testid="suggestion-input"
                    />
                    <Button
                      onClick={submitSuggestion}
                      className="rounded-none bg-black text-white hover:bg-zinc-800"
                      disabled={!newSuggestion.trim()}
                      data-testid="submit-suggestion"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions List */}
              <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">All Suggestions</CardTitle>
                  <CardDescription>Review and manage user suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">No suggestions yet</p>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-4 border border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm mb-2">{suggestion.content}</p>
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span>By {suggestion.user_name}</span>
                                <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                                {getStatusBadge(suggestion.status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={suggestion.status}
                                onValueChange={(value) => handleSuggestionStatus(suggestion.id, value)}
                              >
                                <SelectTrigger className="w-32 rounded-none h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="implemented">Implemented</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ open: true, type: 'suggestion', item: suggestion })}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteDialog.type === 'user' ? 'User' : 'Suggestion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'user'
                ? `Are you sure you want to delete ${deleteDialog.item?.name}? This action cannot be undone.`
                : 'Are you sure you want to delete this suggestion? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.type === 'user' ? handleDeleteUser : handleDeleteSuggestion}
              className="rounded-none bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
