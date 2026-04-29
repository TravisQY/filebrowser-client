export interface FileItem {
  name: string;
  size: number;
  mode: number;
  modified: string;
  extension: string;
  isDir: boolean;
  isSymlink: boolean;
  type: string;
  url: string;
  items?: FileItem[];
  numDirs: number;
  numFiles: number;
  sorting: {
    by: string;
    asc: boolean;
  };
}

export interface AuthState {
  token: string;
  serverUrl: string;
}

export interface User {
  id: number;
  username: string;
  admin: boolean;
  perm: {
    admin: boolean;
    execute: boolean;
    create: boolean;
    rename: boolean;
    modify: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
  };
  commands: string[];
  lockPassword: boolean;
}
