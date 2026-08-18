import { api } from '@/lib/api';
import type {
  Course,
  CourseDetail,
  Exam,
  InventoryItem,
  Pagination,
  Ranking,
  ShopState,
  XpProfile,
} from '@/lib/types';

export function coursesApi(token: string) {
  return {
    list: () => api<{ data: Course[]; pagination: Pagination }>('/api/v1/courses', { token }),
    detail: (id: string) => api<{ course: CourseDetail }>(`/api/v1/courses/${id}`, { token }),
    enroll: (id: string) => api<{ success: boolean }>(`/api/v1/courses/${id}/enroll`, { method: 'POST', token }),
    progress: (id: string) => api<{ progress: unknown }>(`/api/v1/courses/${id}/progress`, { token }),
  };
}

export function examsApi(token: string) {
  return {
    list: () => api<Exam[]>('/api/v1/exams', { token }),
  };
}

export function gamificationApi(token: string) {
  return {
    xpProfile: () => api<XpProfile>('/api/v1/users/me/xp-profile', { token }),
    ranking: () => api<Ranking>('/api/v1/rankings', { token }),
  };
}

export function shopApi(token: string) {
  return {
    state: () => api<ShopState>('/api/v1/shop', { token }),
    purchase: (itemId: string) => api<{ success: boolean }>('/api/v1/shop/purchase', { method: 'POST', body: { itemId }, token }),
    inventory: () => api<{ items: InventoryItem[] }>('/api/v1/inventory', { token }),
  };
}