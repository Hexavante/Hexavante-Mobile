export type XpProfile = {
  level: number;
  currentXp: number;
  totalXp: number;
  league: string;
  xpToNextLevel: number;
  progressPercent: number;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  courseType: string;
  level: string | null;
  estimatedHours: number | null;
  totalModules: number;
  totalLessons: number;
  instructorName: string | null;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  durationMinutes: number | null;
  isCompleted?: boolean;
  isFavorite?: boolean;
};

export type CourseDetail = Course & {
  description: string | null;
  modules: Module[];
  progress?: {
    percent: number;
    completedLessons: number;
    totalLessons: number;
  };
};

export type Exam = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  subject: string;
  durationMinutes: number;
  questionCount: number;
  difficulty: string | null;
  status?: string;
  bestScore?: number | null;
  attemptsCount?: number;
};

export type RankingEntry = {
  rank: number;
  userId: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  league: string;
  totalXp: number;
  level: number;
};

export type Ranking = {
  data: RankingEntry[];
  me?: RankingEntry | null;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  icon?: string;
  available?: boolean;
};

export type ShopState = {
  coins: number;
  items: ShopItem[];
};

export type InventoryItem = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  equipped?: boolean;
  quantity: number;
};

export type NotificationsState = {
  notifications: unknown[];
  unreadCount: number;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};