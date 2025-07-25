import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog';
import {
  UserPlus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Users
} from 'lucide-react';
import useAlertStore from '../../stores/alertStore';

interface AxieStudioUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  tenant_id: string;
  workspace_id: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

// API Service Functions
const userAPI = {
  async getAllUsers(): Promise<AxieStudioUser[]> {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/v1/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  },

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    is_active: boolean;
    is_superuser: boolean;
  }): Promise<AxieStudioUser> {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/v1/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create user');
    }

    const data = await response.json();
    return data.user;
  },

  async updateUser(userId: string, updates: Partial<AxieStudioUser>): Promise<AxieStudioUser> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update user');
    }

    const data = await response.json();
    return data.user;
  },

  async deleteUser(userId: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete user');
    }
  },

  async toggleUserStatus(userId: string): Promise<AxieStudioUser> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`/api/v1/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to toggle user status');
    }

    const data = await response.json();
    return data.user;
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState<AxieStudioUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AxieStudioUser | null>(null);

  // Alert store
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_superuser: false,
    is_active: true
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userAPI.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setErrorData({ title: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleAddUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setErrorData({ title: 'Please fill in all required fields' });
      return;
    }

    try {
      await userAPI.createUser(formData);
      setSuccessData({ title: 'User created successfully!' });
      setFormData({ username: '', email: '', password: '', is_superuser: false, is_active: true });
      setShowAddForm(false);
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error creating user:', error);
      setErrorData({ title: error instanceof Error ? error.message : 'Failed to create user' });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      await userAPI.updateUser(editingUser.id, formData);
      setSuccessData({ title: 'User updated successfully!' });
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', is_superuser: false, is_active: true });
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorData({ title: error instanceof Error ? error.message : 'Failed to update user' });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    try {
      await userAPI.deleteUser(userId);
      setSuccessData({ title: `User ${username} deleted successfully!` });
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorData({ title: error instanceof Error ? error.message : 'Failed to delete user' });
    }
  };

  const handleToggleUserStatus = async (userId: string, username: string, currentStatus: boolean) => {
    try {
      await userAPI.toggleUserStatus(userId);
      const action = currentStatus ? 'paused' : 'activated';
      setSuccessData({ title: `User ${username} ${action} successfully!` });
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error toggling user status:', error);
      setErrorData({ title: error instanceof Error ? error.message : 'Failed to update user status' });
    }
  };

  const startEditUser = (user: AxieStudioUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      is_superuser: user.is_superuser,
      is_active: user.is_active
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', is_superuser: false, is_active: true });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter password"
                        />
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_superuser"
                        checked={formData.is_superuser}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_superuser: checked })}
                      />
                      <Label htmlFor="is_superuser">Admin/Superuser</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddUser} className="flex-1">
                        Create User
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Create your first user to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_superuser ? "default" : "secondary"}>
                        {user.is_superuser ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.workspace_id}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.username, user.is_active)}
                        >
                          {user.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                              handleDeleteUser(user.id, user.username);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_superuser"
                checked={formData.is_superuser}
                onCheckedChange={(checked) => setFormData({ ...formData, is_superuser: checked })}
              />
              <Label htmlFor="edit-is_superuser">Admin/Superuser</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditUser} className="flex-1">
                Update User
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
