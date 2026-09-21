import { api } from '@/lib/api';
import type {
  Achievement,
  Certificate,
  Course,
  CourseDetail,
  Exam,
  ExamHistoryEntry,
  ExamStartResponse,
  ExamStats,
  ExamSubmitResponse,
  InventoryEntry,
  LessonDetail,
  Notification,
  Pagination,
  Ranking,
  ShopState,
  Tutorial,
  UserProfile,
  XpProfile,
} from '@/lib/types';

export function coursesApi(token: string) {
  return {
    list: () => api<{ data: Course[]; pagination: Pagination }>('/api/v1/courses', { token }),
    detail: (id: string) => api<{ course: CourseDetail }>(`/api/v1/courses/${id}`, { token }),
    enroll: (id: string) => api<{ success: boolean }>(`/api/v1/courses/${id}/enroll`, { method: 'POST', token }),
    progress: (id: string) => api<{ progress: unknown }>(`/api/v1/courses/${id}/progress`, { token }),
    lesson: (courseId: string, lessonId: string) =>
      api<{ lesson: LessonDetail }>(`/api/v1/courses/${courseId}/lessons/${lessonId}`, { token }),
    completeLesson: (courseId: string, lessonId: string) =>
      api<{ success: boolean }>(`/api/v1/courses/${courseId}/lessons/${lessonId}/complete`, { method: 'POST', token }),
  };
}

export function examsApi(token: string) {
  return {
    list: () => api<{ data: Exam[] }>('/api/v1/exams', { token }),
    detail: (id: string) => api<{ exam: Exam }>(`/api/v1/exams/${id}`, { token }),
    history: (page?: number) => api<{ attempts: ExamHistoryEntry[]; page: number; totalPages: number; total: number }>(`/api/v1/exams/history?page=${page ?? 1}`, { token }),
    stats: () => api<ExamStats>('/api/v1/exams/stats', { token }),
    evolution: () => api<{ date: string; score: number }[]>('/api/v1/exams/evolution', { token }),
    subjectStats: () => api<{ subject: string; correct: number; total: number }[]>('/api/v1/exams/subject-stats', { token }),
    start: (id: string) => api<ExamStartResponse>(`/api/v1/exams/${id}/start`, { method: 'POST', token }),
    submit: (attemptId: string, answers: { questionId: string; alternativeId?: string }[]) =>
      api<ExamSubmitResponse>('/api/v1/exams/submit', { method: 'POST', body: { attemptId, answers }, token }),
  };
}

export type MyRank = {
  rank?: number;
  totalXp?: number;
  level?: number;
  username?: string;
  league?: string;
};

export function gamificationApi(token: string) {
  return {
    xpProfile: () => api<XpProfile>('/api/v1/users/me/xp-profile', { token }),
    ranking: () =>
      api<{ data: Ranking['data']; pagination: Pagination; season?: unknown }>(
        '/api/v1/rankings',
        { token },
      ),
    me: () => api<MyRank | null>('/api/v1/rankings/me', { token }),
    achievements: () => api<{ achievements: Achievement[] }>('/api/v1/users/me/achievements', { token }),
  };
}

export function shopApi(token: string) {
  return {
    state: () => api<ShopState>('/api/v1/shop', { token }),
    purchase: (itemId: string) => api<{ success: boolean }>('/api/v1/shop/purchase', { method: 'POST', body: { storeItemId: itemId }, token }),
    equip: (inventoryId: string) => api<{ success: boolean }>('/api/v1/shop/equip', { method: 'POST', body: { inventoryId }, token }),
    inventory: () => api<{ items: InventoryEntry[] }>('/api/v1/inventory', { token }),
  };
}

export function certificatesApi(token: string) {
  return {
    list: () => api<{ success: boolean; certificates: Certificate[] }>('/api/v1/certificates', { token }),
    verify: (code: string) => api<{ success: boolean; certificate: Certificate }>(`/api/v1/certificates/verify/${code}`),
  };
}

export function notificationsApi(token: string) {
  return {
    list: (limit?: number, unreadOnly?: boolean) => {
      const params = new URLSearchParams();
      if (limit) params.set('limit', String(limit));
      if (unreadOnly) params.set('unreadOnly', 'true');
      return api<{ success: boolean; notifications: Notification[]; unreadCount: number }>(`/api/v1/notifications?${params}`, { token });
    },
    markRead: (id: string) => api<{ success: boolean }>(`/api/v1/notifications/${id}/read`, { method: 'PATCH', token }),
    markAllRead: () => api<{ success: boolean; count: number }>('/api/v1/notifications/read-all', { method: 'PATCH', token }),
  };
}

export function tutorialsApi(token?: string) {
  return {
    list: (page?: number, q?: string) => {
      const params = new URLSearchParams();
      if (page) params.set('page', String(page));
      if (q) params.set('q', q);
      return api<{ data: Tutorial[]; pagination: Pagination }>(`/api/v1/tutorials?${params}`, { token });
    },
    detail: (id: string) => api<{ tutorial: Tutorial }>(`/api/v1/tutorials/${id}`, { token }),
  };
}

export function usersApi(token: string) {
  return {
    me: () => api<{ user: UserProfile }>('/api/v1/users/me', { token }),
    update: (data: { fullName?: string; username?: string; birthDate?: string }) =>
      api<{ user: UserProfile }>('/api/v1/users/me', { method: 'PATCH', body: data, token }),
  };
}
