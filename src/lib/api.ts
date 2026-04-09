const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000");

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Lightweight API client that wraps fetch with:
 * - Automatic JSON serialization/parsing
 * - Credentials (cookies) for auth
 * - Error handling with typed responses
 */
async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const config: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Network Error",
      message: `HTTP ${response.status}`,
    }));
    throw new ApiError(response.status, error.error, error.message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export class ApiError extends Error {
  status: number;
  error: string;

  constructor(status: number, error: string, message: string) {
    super(message);
    this.status = status;
    this.error = error;
    this.name = "ApiError";
  }
}

// ============================================================
// Typed API Methods
// ============================================================

export const api = {
  // Health
  health: () => request<{ status: string }>("/api/health"),

  // Users
  users: {
    me: () => request<{ data: User }>("/api/users/me"),
    updateProfile: (data: UpdateProfileData) =>
      request<{ data: User }>("/api/users/me", {
        method: "PATCH",
        body: data,
      }),
    completeProfile: (data: UpdateProfileData) =>
      request<{ data: User }>("/api/users/me/complete-profile", {
        method: "POST",
        body: data,
      }),
    stats: () => request<{ data: UserStats }>("/api/users/me/stats"),
  },

  // Ebooks
  ebooks: {
    list: (params?: EbookListParams) => {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      const qs = query.toString();
      return request<PaginatedResponse<EbookWithStatus>>(
        `/api/ebooks${qs ? `?${qs}` : ""}`
      );
    },
    get: (id: string) => request<{ data: Ebook }>(`/api/ebooks/${id}`),
    readerCount: (id: string) =>
      request<{ data: ReaderCount }>(`/api/ebooks/${id}/reader-count`),
    create: (data: CreateEbookData) =>
      request<{ data: Ebook }>("/api/ebooks", {
        method: "POST",
        body: data,
      }),
    update: (id: string, data: Partial<CreateEbookData>) =>
      request<{ data: Ebook }>(`/api/ebooks/${id}`, {
        method: "PATCH",
        body: data,
      }),
    delete: (id: string) =>
      request<{ data: Ebook }>(`/api/ebooks/${id}`, { method: "DELETE" }),
  },

  // Reading Sessions
  readingSessions: {
    start: (ebookId: string) =>
      request<{ data: ReadingSession }>("/api/reading-sessions/start", {
        method: "POST",
        body: { ebookId },
      }),
    heartbeat: (sessionId: string, durationSeconds: number) =>
      request<{ data: ReadingSession }>(
        `/api/reading-sessions/${sessionId}/heartbeat`,
        { method: "PATCH", body: { durationSeconds } }
      ),
    end: (sessionId: string) =>
      request<{ data: ReadingSession }>(
        `/api/reading-sessions/${sessionId}/end`,
        { method: "PATCH" }
      ),
    active: () =>
      request<{ data: ReadingSessionWithEbook | null }>(
        "/api/reading-sessions/active"
      ),
    history: (params?: HistoryParams) => {
      const query = new URLSearchParams();
      if (params?.sort) query.set("sort", params.sort);
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      const qs = query.toString();
      return request<PaginatedResponse<ReadingSessionWithEbook>>(
        `/api/reading-sessions/history${qs ? `?${qs}` : ""}`
      );
    },
  },

  // Admin
  admin: {
    dashboard: () => request<{ data: DashboardStats }>("/api/admin/dashboard"),
    dailyReaders: (days?: number) =>
      request<{ data: DailyReaderPoint[] }>(
        `/api/admin/dashboard/daily-readers${days ? `?days=${days}` : ""}`
      ),
    popularEbooks: (limit?: number) =>
      request<{ data: PopularEbook[] }>(
        `/api/admin/dashboard/popular-ebooks${limit ? `?limit=${limit}` : ""}`
      ),
    realtime: () =>
      request<{ data: RealtimeSession[] }>("/api/admin/dashboard/realtime"),
    users: {
      list: (params?: AdminUserListParams) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.role) query.set("role", params.role);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        const qs = query.toString();
        return request<PaginatedResponse<AdminUser>>(
          `/api/admin/users${qs ? `?${qs}` : ""}`
        );
      },
      updateRole: (userId: string, role: "admin" | "user") =>
        request<{ data: AdminUser }>(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          body: { role },
        }),
      delete: (userId: string) =>
        request<{ data: AdminUser }>(`/api/admin/users/${userId}`, {
          method: "DELETE",
        }),
    },
    userStats: () => request<{ data: AdminUserStats }>("/api/admin/stats/users"),
    ebooks: (params?: EbookListParams) => {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.page) query.set("page", String(params.page));
      if (params?.limit) query.set("limit", String(params.limit));
      const qs = query.toString();
      return request<PaginatedResponse<AdminEbook>>(
        `/api/admin/ebooks${qs ? `?${qs}` : ""}`
      );
    },
  },
};

// ============================================================
// Types
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string | null;
  gender: string | null;
  bio: string | null;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  name?: string;
  gender?: string;
  bio?: string;
  image?: string;
}

export interface UserStats {
  totalBooksRead: number;
  totalReadingTimeSeconds: number;
  currentStreak: number;
}

export interface Ebook {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  heyzineUrl: string;
  category: string | null;
  author: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EbookWithStatus extends Ebook {
  totalReadDuration: number;
  hasRead: boolean;
}

export interface EbookListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReaderCount {
  activeReaders: number;
  totalReaders: number;
}

export interface CreateEbookData {
  title: string;
  description?: string;
  coverImageUrl?: string;
  heyzineUrl: string;
  category?: string;
  author?: string;
  isPublished?: boolean;
}

export interface ReadingSession {
  id: string;
  userId: string;
  ebookId: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ReadingSessionWithEbook extends ReadingSession {
  ebook: Ebook;
}

export interface HistoryParams {
  sort?: "latest" | "oldest" | "longest";
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalReaders: number;
  avgDurationSeconds: number;
  activeSessions: number;
  totalEbooks: number;
}

export interface DailyReaderPoint {
  day: string;
  count: number;
}

export interface PopularEbook {
  ebook: Ebook;
  readerCount: number;
}

export interface RealtimeSession {
  id: string;
  user: { id: string; name: string; image: string | null };
  ebook: { id: string; title: string };
  durationSeconds: number;
  startedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string | null;
  gender: string | null;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
}

export interface AdminUserListParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserStats {
  totalUsers: number;
  activeNow: number;
  adminCount: number;
}

export interface AdminEbook extends Ebook {
  readerCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
