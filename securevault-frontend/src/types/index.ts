// ---------- USER ----------
export interface User {
  id: string | number;
  email: string;
  name: string;

  // Optional fields (backend does NOT send these in user list)
  password?: string;
  role?: 'admin' | 'user';
  createdAt?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  avatar?: string;
  failedLoginAttempts?: number;
  selfDestructEnabled?: boolean;
  selfDestructThreshold?: number;
  autoDeleteDays?: number;
  panicKey?: string;
}

// ---------- SESSION ----------
export interface Session {
  id: string | number;
  userId: string | number;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

// ---------- FILES ----------
export interface EncryptedFile {
  id: string | number;
  name: string;
  originalName: string;
  size: number;
  type: string;
  encryptedData: string;
  iv: string;
  uploadedBy: string | number;
  uploadedAt: string;
  teamId?: string | number;
  permissions: FilePermissions;
  versions: FileVersion[];
  shareLinks: ShareLink[];
}

export interface FilePermissions {
  viewOnly: boolean;
  allowDownload: boolean;
  allowResharing: boolean;
  expirationDate?: string;
  maxDownloads?: number;
  currentDownloads: number;
}

export interface FileVersion {
  id: string | number;
  fileId: string | number;
  version: number;
  encryptedData: string;
  iv: string;
  uploadedAt: string;
  uploadedBy: string | number;
  size: number;
}

export interface ShareLink {
  id: string | number;
  fileId: string | number;
  createdBy: string | number;
  createdAt: string;
  expiresAt?: string;
  password?: string;
  maxOpens?: number;
  currentOpens: number;
  isActive: boolean;
}

// ---------- TEAMS ----------
export interface Team {
  id: string | number;
  name: string;
  description: string;
  createdBy: string | number;
  createdAt: string;
  members: TeamMember[];
  invitedEmails: string[];
  encryptionKey: string;
}


export interface TeamMember {
  userId: string | number;
  role: 'admin' | 'uploader' | 'viewer';
  joinedAt: string;
}

export interface TeamActivity {
  id: string | number;
  teamId: string | number;
  userId: string | number;
  action: string;
  details: string;
  timestamp: string;
}

export interface TeamMessage {
  id: string | number;
  teamId: string | number;
  userId: string | number;
  encryptedContent: string;
  iv: string;
  timestamp: string;

  // not stored in backend — only used in frontend
  decryptedContent?: string;
}


// ---------- NOTES ----------
export interface EncryptedNote {
  id: string | number;
  title: string;
  encryptedContent: string;
  iv: string;
  createdBy: string | number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// ---------- PASSWORDS ----------
export interface PasswordEntry {
  id: string | number;
  title: string;
  username: string;
  encryptedPassword: string;
  iv: string;
  url?: string;
  notes?: string;
  createdBy: string | number;
  createdAt: string;
  updatedAt: string;
  category: string;
}

// ---------- ACTIVITY LOG ----------
export interface ActivityLog {
  id: string | number;
  userId: string | number;
  action: ActivityAction;
  details: string;
  ip: string;
  device: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export type ActivityAction = 
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'file_upload'
  | 'file_download'
  | 'file_decrypt'
  | 'file_share'
  | 'share_link_open'
  | 'note_create'
  | 'note_view'
  | 'password_create'
  | 'password_view'
  | 'team_create'
  | 'team_join'
  | 'team_leave'
  | 'settings_change'
  | 'unauthorized_access'
  | '2fa_enable'
  | '2fa_disable'
  | 'session_terminate';

// ---------- SECURITY ALERT ----------
export interface SecurityAlert {
  id: string | number;
  userId: string | number;
  type: 'suspicious_login' | 'multiple_failed_attempts' | 'new_device' | 'unusual_activity' | 'data_breach_detected';
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
