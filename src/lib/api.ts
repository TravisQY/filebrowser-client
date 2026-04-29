import { AuthState, FileItem } from "../types";

export class FileBrowserAPI {
  private serverUrl: string;
  private token: string;

  constructor(authState: AuthState) {
    this.serverUrl = authState.serverUrl.replace(/\/$/, "");
    this.token = authState.token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.serverUrl}${path}`;
    const headers = new Headers(options.headers);
    if (this.token) {
      headers.set("X-Auth", this.token);
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem("fb_auth");
      window.location.reload();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    return response;
  }

  async getResources(path: string): Promise<FileItem> {
    const response = await this.request(`/api/resources/${path}`);
    return response.json();
  }

  async deleteResource(path: string) {
    await this.request(`/api/resources/${path}`, { method: "DELETE" });
  }

  async createFolder(path: string) {
    // Creating a folder is a POST or PUT to a path ending in /?override=false
    const urlPath = `/api/resources/${path}/?override=false`;
    await this.request(urlPath, { method: "POST" });
  }

  async renameResource(oldPath: string, newPath: string) {
    await this.request(`/api/resources/${oldPath}?destination=${encodeURIComponent(newPath)}`, {
      method: "PATCH",
    });
  }

  getDownloadUrl(path: string): string {
    return `${this.serverUrl}/api/raw/${path}?auth=${this.token}`;
  }

  getPreviewUrl(path: string): string {
    return `${this.serverUrl}/api/preview/big/${path}?auth=${this.token}`;
  }
}

export async function login(serverUrl: string, username: string, password: string): Promise<string> {
  const url = `${serverUrl.replace(/\/$/, "")}/api/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, recaptcha: "" }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Login failed");
  }

  return response.text(); // Returns the JWT token
}
