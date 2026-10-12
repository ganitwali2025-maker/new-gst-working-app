import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, KeyRound, Edit, Trash2, CheckCircle2, XCircle, 
  Search, CheckSquare, Square, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { 
  APP_MODULES, ModulePermission, PermissionMap, AppUser, 
  DEFAULT_PERMISSION, createEmptyPermissions, createFullPermissions 
} from '../../types/user';

export default function UserManagement() {
  const { users, isAdmin, user: currentUser, createUser, updateUser, changePassword, deleteUser, toggleUserStatus } = useAuth();
  const { showToast } = useToast() as any;

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<AppUser | null>(null);
  const [permissionsModalUser, setPermissionsModalUser] = useState<AppUser | null>(null);

  // Form states for Create User
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    designation: '',
    permissions: createEmptyPermissions(),
  });

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Editing user state
  const [editForm, setEditForm] = useState({
    username: '',
    designation: '',
  });

  // Manage permissions state
  const [tempPermissions, setTempPermissions] = useState<PermissionMap>(createEmptyPermissions());

  // Filtered users
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.designation && u.designation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Quick module toggle helpers for createForm
  const toggleCreatePermission = (moduleId: string, action: keyof ModulePermission) => {
    setCreateForm(prev => {
      const current = prev.permissions[moduleId] || { ...DEFAULT_PERMISSION };
      const updated = { ...current, [action]: !current[action] };
      // If adding/editing/deleting/importing/exporting, auto-enable view
      if (action !== 'view' && updated[action]) {
        updated.view = true;
      }
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: updated
        }
      };
    });
  };

  const toggleRowAllCreate = (moduleId: string) => {
    setCreateForm(prev => {
      const current = prev.permissions[moduleId] || { ...DEFAULT_PERMISSION };
      const allActive = current.view && current.add && current.edit && current.delete && current.import && current.export;
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: {
            view: !allActive,
            add: !allActive,
            edit: !allActive,
            delete: !allActive,
            import: !allActive,
            export: !allActive,
            import_export: !allActive,
          }
        }
      };
    });
  };

  const handleSelectAllCreate = () => {
    setCreateForm(prev => ({ ...prev, permissions: createFullPermissions() }));
  };

  const handleClearAllCreate = () => {
    setCreateForm(prev => ({ ...prev, permissions: createEmptyPermissions() }));
  };

  // Quick module toggle helpers for permissionsModal
  const toggleTempPermission = (moduleId: string, action: keyof ModulePermission) => {
    setTempPermissions(prev => {
      const current = prev[moduleId] || { ...DEFAULT_PERMISSION };
      const updated = { ...current, [action]: !current[action] };
      if (action !== 'view' && updated[action]) {
        updated.view = true;
      }
      return { ...prev, [moduleId]: updated };
    });
  };

  const toggleRowAllTemp = (moduleId: string) => {
    setTempPermissions(prev => {
      const current = prev[moduleId] || { ...DEFAULT_PERMISSION };
      const allActive = current.view && current.add && current.edit && current.delete && current.import && current.export;
      return {
        ...prev,
        [moduleId]: {
          view: !allActive,
          add: !allActive,
          edit: !allActive,
          delete: !allActive,
          import: !allActive,
          export: !allActive,
          import_export: !allActive,
        }
      };
    });
  };

  const handleSelectAllTemp = () => {
    setTempPermissions(createFullPermissions());
  };

  const handleClearAllTemp = () => {
    setTempPermissions(createEmptyPermissions());
  };

  // Create User submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.username.trim() || !createForm.password.trim()) {
      showToast('Username and password are required');
      return;
    }
    const res = await createUser({
      username: createForm.username,
      password: createForm.password,
      designation: createForm.designation,
      permissions: createForm.permissions,
    });
    if (res.success) {
      showToast(`User "${createForm.username}" created successfully`);
      setIsCreateModalOpen(false);
      setCreateForm({
        username: '',
        password: '',
        designation: '',
        permissions: createEmptyPermissions(),
      });
    } else {
      showToast(res.message || 'Error creating user');
    }
  };

  // Edit User submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = await updateUser(editingUser.id, {
      username: editForm.username.trim(),
      designation: editForm.designation.trim(),
    });
    if (res.success) {
      showToast('User profile updated');
      setEditingUser(null);
    } else {
      showToast(res.message || 'Error updating user');
    }
  };

  // Change Password submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }
    const res = await changePassword(passwordModalUser.id, newPassword);
    if (res.success) {
      showToast(`Password changed for "${passwordModalUser.username}"`);
      setPasswordModalUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast(res.message || 'Error changing password');
    }
  };

  // Save Permissions submit
  const handleSavePermissions = async () => {
    if (!permissionsModalUser) return;
    const res = await updateUser(permissionsModalUser.id, { permissions: tempPermissions });
    if (res.success) {
      showToast(`Permissions updated for "${permissionsModalUser.username}"`);
      setPermissionsModalUser(null);
    } else {
      showToast(res.message || 'Error updating permissions');
    }
  };

  // Delete User
  const handleDelete = async (u: AppUser) => {
    if (u.role === 'ADMIN' || u.username.toLowerCase() === 'admin') {
      showToast('Cannot delete Admin account');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user "${u.username}"?`)) {
      const res = await deleteUser(u.id);
      if (res.success) {
        showToast(`User "${u.username}" deleted`);
      } else {
        showToast(res.message || 'Failed to delete user');
      }
    }
  };

  // Helper to count active permissions
  const getPermissionSummary = (u: AppUser) => {
    if (u.role === 'ADMIN') {
      return { moduleCount: APP_MODULES.length, detailText: 'All Modules (Full Access)' };
    }
    let modulesWithView = 0;
    let totalActions = 0;
    Object.values(u.permissions || {}).forEach((p: ModulePermission) => {
      if (p.view) modulesWithView++;
      if (p.view) totalActions++;
      if (p.add) totalActions++;
      if (p.edit) totalActions++;
      if (p.delete) totalActions++;
      if (p.import) totalActions++;
      if (p.export) totalActions++;
    });
    return {
      moduleCount: modulesWithView,
      detailText: `${modulesWithView} Modules (${totalActions} actions enabled)`
    };
  };

  return (
    <div 
      className="panel" 
      style={{ 
        background: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid var(--border)', 
        boxShadow: 'var(--shadow-sm)',
        padding: '24px'
      }}
    >
      {/* 4. Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: '#f5f3ff', 
            color: '#7c3aed', 
            padding: '10px', 
            borderRadius: '10px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              User Management & Access Permissions
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
              Manage system users, designations, module access and action-level privileges.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px', gap: '8px' }}>
            <Search size={15} color="var(--muted)" />
            <input 
              type="text" 
              placeholder="Search Username / Role..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '8px 0', fontSize: '13px', width: '190px', color: 'var(--text)' }} 
            />
          </div>

          {isAdmin && (
            <button 
              className="btn primary" 
              onClick={() => setIsCreateModalOpen(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: '#7c3aed', 
                border: 'none', 
                padding: '9px 18px', 
                borderRadius: '8px', 
                fontWeight: 600, 
                fontSize: '13.5px', 
                color: '#fff', 
                cursor: 'pointer', 
                boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)' 
              }}
            >
              <UserPlus size={16} /> + Create User
            </button>
          )}
        </div>
      </div>

      {/* 5. User Table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table style={{ margin: 0 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)' }}>
                <th style={{ width: '180px', letterSpacing: '0.5px' }}>USERNAME</th>
                <th style={{ width: '170px', letterSpacing: '0.5px' }}>DESIGNATION</th>
                <th style={{ width: '150px', textAlign: 'center', letterSpacing: '0.5px' }}>ASSIGNED MODULES</th>
                <th style={{ letterSpacing: '0.5px' }}>PERMISSIONS SUMMARY</th>
                <th style={{ width: '110px', textAlign: 'center', letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ width: '230px', textAlign: 'center', letterSpacing: '0.5px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const summary = getPermissionSummary(u);
                  const isCurrent = currentUser?.id === u.id;
                  const isAdm = u.role === 'ADMIN' || u.username.toLowerCase() === 'admin';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: isAdm ? '#7c3aed' : 'var(--panel-2)', 
                            color: isAdm ? '#fff' : 'var(--text)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700 
                          }}>
                            {u.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text)' }}>
                              {u.username}
                              {isCurrent && <span style={{ marginLeft: '6px', fontSize: '11px', background: 'var(--panel-2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--muted)' }}>You</span>}
                            </div>
                            <div style={{ fontSize: '11.5px', color: isAdm ? '#7c3aed' : 'var(--muted)', fontWeight: 500 }}>
                              {isAdm ? 'Administrator' : 'Standard User'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                          {isAdm ? 'System Administrator' : (u.designation || 'Staff')}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 600,
                          background: isAdm ? '#ede9fe' : summary.moduleCount > 0 ? '#e0f2fe' : 'var(--panel-2)',
                          color: isAdm ? '#6d28d9' : summary.moduleCount > 0 ? '#0369a1' : 'var(--muted)'
                        }}>
                          {isAdm ? 'All Modules' : `${summary.moduleCount} / ${APP_MODULES.length}`}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '12.5px', color: 'var(--text)', fontWeight: 500 }}>
                          {isAdm ? 'All Modules (Full Access)' : summary.detailText}
                        </div>
                        {!isAdm && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {APP_MODULES.filter(m => u.permissions?.[m.id]?.view).slice(0, 4).map(m => (
                              <span key={m.id} style={{ fontSize: '10.5px', background: 'var(--panel-2)', padding: '1px 6px', borderRadius: '4px', color: 'var(--muted)' }}>
                                {m.label}
                              </span>
                            ))}
                            {APP_MODULES.filter(m => u.permissions?.[m.id]?.view).length > 4 && (
                              <span style={{ fontSize: '10.5px', color: '#7c3aed', fontWeight: 600 }}>
                                +{APP_MODULES.filter(m => u.permissions?.[m.id]?.view).length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => !isAdm && isAdmin && toggleUserStatus(u.id)}
                          disabled={isAdm || !isAdmin}
                          style={{
                            border: 'none',
                            background: u.status === 'Active' ? '#dcfce7' : '#fee2e2',
                            color: u.status === 'Active' ? '#15803d' : '#b91c1c',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isAdm || !isAdmin ? 'default' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {u.status === 'Active' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {u.status}
                        </button>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            className="btn ghost" 
                            style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setEditingUser(u);
                              setEditForm({ username: u.username, designation: u.designation });
                            }}
                            title="Edit User Details"
                          >
                            <Edit size={14} /> Edit
                          </button>

                          <button 
                            className="btn ghost" 
                            style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed' }}
                            onClick={() => {
                              setPermissionsModalUser(u);
                              setTempPermissions(u.permissions || (isAdm ? createFullPermissions() : createEmptyPermissions()));
                            }}
                            title="Manage Module Access & Permissions"
                          >
                            <Shield size={14} /> Access
                          </button>

                          <button 
                            className="btn ghost" 
                            style={{ padding: '6px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            title="Change Password"
                          >
                            <KeyRound size={14} /> Password
                          </button>

                          {!isAdm && (
                            <button 
                              className="btn ghost" 
                              style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleDelete(u)}
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content" style={{ background: 'var(--panel)', borderRadius: '12px', width: '100%', maxWidth: '840px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Create New User</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Set user credentials and module-wise action permissions</div>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Form Fields: Username, Password, Designation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Username *
                    </label>
                    <input 
                      type="text" 
                      className="ctrl" 
                      required 
                      placeholder="e.g. rahul_gst" 
                      value={createForm.username} 
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} 
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Password *
                    </label>
                    <input 
                      type="password" 
                      className="ctrl" 
                      required 
                      placeholder="Enter strong password" 
                      value={createForm.password} 
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} 
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Designation
                    </label>
                    <input 
                      type="text" 
                      className="ctrl" 
                      placeholder="e.g. GST Executive / Accountant" 
                      value={createForm.designation} 
                      onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })} 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Access Permissions Section */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text)' }}>
                        Access Permissions
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Select module-wise permissions: View, Add, Edit, Delete, Import, Export
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="btn ghost" 
                        onClick={handleSelectAllCreate}
                        style={{ fontSize: '12px', padding: '6px 12px', color: '#7c3aed' }}
                      >
                        Select All
                      </button>
                      <button 
                        type="button" 
                        className="btn ghost" 
                        onClick={handleClearAllCreate}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ margin: 0, fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--panel-2)' }}>
                          <th style={{ width: '34%' }}>Module Name</th>
                          <th style={{ textAlign: 'center', width: '11%' }}>View</th>
                          <th style={{ textAlign: 'center', width: '11%' }}>Add</th>
                          <th style={{ textAlign: 'center', width: '11%' }}>Edit</th>
                          <th style={{ textAlign: 'center', width: '11%' }}>Delete</th>
                          <th style={{ textAlign: 'center', width: '11%' }}>Import</th>
                          <th style={{ textAlign: 'center', width: '11%' }}>Export</th>
                        </tr>
                      </thead>
                      <tbody>
                        {APP_MODULES.map(m => {
                          const perm = createForm.permissions[m.id] || { ...DEFAULT_PERMISSION };
                          const hasAny = perm.view || perm.add || perm.edit || perm.delete || perm.import || perm.export;

                          return (
                            <tr key={m.id} style={{ background: hasAny ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                    type="button" 
                                    onClick={() => toggleRowAllCreate(m.id)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#7c3aed' }}
                                    title="Toggle all permissions for this module"
                                  >
                                    {perm.view && perm.add && perm.edit && perm.delete && perm.import && perm.export ? (
                                      <CheckSquare size={16} />
                                    ) : (
                                      <Square size={16} color="var(--muted)" />
                                    )}
                                  </button>
                                  <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.label}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={perm.view} 
                                  onChange={() => toggleCreatePermission(m.id, 'view')} 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={perm.add} 
                                  onChange={() => toggleCreatePermission(m.id, 'add')} 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={perm.edit} 
                                  onChange={() => toggleCreatePermission(m.id, 'edit')} 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={perm.delete} 
                                  onChange={() => toggleCreatePermission(m.id, 'delete')} 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={perm.import} 
                                  onChange={() => toggleCreatePermission(m.id, 'import')} 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={perm.export} 
                                  onChange={() => toggleCreatePermission(m.id, 'export')} 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', padding: '16px 24px', background: 'var(--panel-2)' }}>
                <button 
                  type="button" 
                  className="btn ghost" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn primary"
                  style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '9px 24px', fontWeight: 600 }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content" style={{ background: 'var(--panel)', borderRadius: '12px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Edit User Details</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Username</label>
                <input 
                  type="text" 
                  className="ctrl" 
                  required 
                  value={editForm.username} 
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Designation</label>
                <input 
                  type="text" 
                  className="ctrl" 
                  value={editForm.designation} 
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} 
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#7c3aed', border: 'none', color: '#fff' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalUser && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content" style={{ background: 'var(--panel)', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Change Password</h3>
              </div>
              <button onClick={() => setPasswordModalUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              Reset password for user: <strong style={{ color: 'var(--text)' }}>{passwordModalUser.username}</strong>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>New Password</label>
                <input 
                  type="password" 
                  className="ctrl" 
                  required 
                  placeholder="Enter new password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  className="ctrl" 
                  required 
                  placeholder="Re-enter new password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn ghost" onClick={() => setPasswordModalUser(null)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#7c3aed', border: 'none', color: '#fff' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE ACCESS PERMISSIONS MODAL */}
      {permissionsModalUser && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content" style={{ background: 'var(--panel)', borderRadius: '12px', width: '100%', maxWidth: '840px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
                    Manage Access: {permissionsModalUser.username}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                    Role: {permissionsModalUser.role === 'ADMIN' ? 'Administrator (Full Access)' : permissionsModalUser.designation || 'Staff'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn ghost" 
                  onClick={handleSelectAllTemp}
                  style={{ fontSize: '12px', padding: '6px 12px', color: '#7c3aed' }}
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  className="btn ghost" 
                  onClick={handleClearAllTemp}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Clear All
                </button>
                <button onClick={() => setPermissionsModalUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', marginLeft: '8px' }}><X size={20} /></button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: '20px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ margin: 0, fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-2)' }}>
                      <th style={{ width: '34%' }}>Module Name</th>
                      <th style={{ textAlign: 'center', width: '11%' }}>View</th>
                      <th style={{ textAlign: 'center', width: '11%' }}>Add</th>
                      <th style={{ textAlign: 'center', width: '11%' }}>Edit</th>
                      <th style={{ textAlign: 'center', width: '11%' }}>Delete</th>
                      <th style={{ textAlign: 'center', width: '11%' }}>Import</th>
                      <th style={{ textAlign: 'center', width: '11%' }}>Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {APP_MODULES.map(m => {
                      const perm = tempPermissions[m.id] || { ...DEFAULT_PERMISSION };
                      const hasAny = perm.view || perm.add || perm.edit || perm.delete || perm.import || perm.export;

                      return (
                        <tr key={m.id} style={{ background: hasAny ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                type="button" 
                                onClick={() => toggleRowAllTemp(m.id)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#7c3aed' }}
                                title="Toggle all permissions for this module"
                              >
                                {perm.view && perm.add && perm.edit && perm.delete && perm.import && perm.export ? (
                                  <CheckSquare size={16} />
                                ) : (
                                  <Square size={16} color="var(--muted)" />
                                )}
                              </button>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.label}</div>
                                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.description}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={perm.view} 
                              onChange={() => toggleTempPermission(m.id, 'view')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={perm.add} 
                              onChange={() => toggleTempPermission(m.id, 'add')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={perm.edit} 
                              onChange={() => toggleTempPermission(m.id, 'edit')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={perm.delete} 
                              onChange={() => toggleTempPermission(m.id, 'delete')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={perm.import} 
                              onChange={() => toggleTempPermission(m.id, 'import')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={perm.export} 
                              onChange={() => toggleTempPermission(m.id, 'export')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--panel-2)' }}>
              <button type="button" className="btn ghost" onClick={() => setPermissionsModalUser(null)}>Cancel</button>
              <button 
                type="button" 
                className="btn primary" 
                onClick={handleSavePermissions}
                style={{ background: '#7c3aed', border: 'none', color: '#fff', padding: '9px 24px', fontWeight: 600 }}
              >
                Apply Updated Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
