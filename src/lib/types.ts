export type XpProfile = {
  level: number;
  currentXp: number;
  totalXp: number;
  league: string;
  xpToNextLevel: number;
  progressPercent: number;
  streakDays?: number;
  activeDays?: number;
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
  videoUrl?: string | null;
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
  examType: string;
  questionCount: number;
  timeLimit: number | null;
  isPremiumOnly: boolean;
  userAttemptCount: number;
  coverImage?: string | null;
};

export type ExamStats = {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
};

export type ExamQuestionItem = {
  id: string;
  statement: string;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  orderNumber: number;
  points: number;
  type: string;
  subject: string | null;
  alternatives: { id: string; text: string }[];
};

export type ExamStartResponse = {
  attemptId: string;
  examId: string;
  title: string;
  timeLimit: number | null;
  startedAt: string;
  questions: ExamQuestionItem[];
};

export type ExamSubmitResponse = {
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  finishedAt: string;
};

export type ExamHistoryEntry = {
  id: string;
  examId: string;
  examTitle: string;
  examSlug: string;
  examType: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  finishedAt: string;
};

export type RankingEntry = {
  rank: number;
  userId: string;
  username: string;
  name: string | null;
  fullName?: string | null;
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
  slug: string;
  name: string;
  description: string | null;
  cost: number;
  category: string;
  imageUrl: string | null;
  isPremiumOnly: boolean;
  isPermanent: boolean;
  ownershipStatus: 'available' | 'owned_permanent' | 'active_temporary' | 'expired_temporary';
  inventoryId?: string | null;
  isEquipped?: boolean;
  expiresAt?: string | null;
};

export type ShopState = {
  items: ShopItem[];
  inventory: InventoryEntry[];
  coins: number;
  premium: boolean;
  premiumExpiresAt: string | null;
};

export type InventoryEntry = {
  id: string;
  storeItemId: string;
  isEquipped: boolean;
  purchasedAt: string;
  expiresAt: string | null;
  item: ShopItem;
};

export type Certificate = {
  id: string;
  code: string;
  issuedAt: string;
  course: {
    title: string;
    categoryName: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type Tutorial = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  viewCount: number;
  categoryId: string | null;
  categoryName: string | null;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  tags: string[];
  createdAt: string;
};

export type UserProfile = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  birthDate: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profileVisibility: string;
  isVerified: boolean;
  isPremium: boolean;
  coins: number;
  twoFactorEnabled: boolean;
  presence: string;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Achievement = {
  key: string;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  tier?: string | null;
  unlocked: boolean;
  unlockedAt?: string | null;
};

export type LessonDetail = {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  duration?: number | null;
  orderNumber?: number | null;
};

export type VerifiedCertificate = {
  title: string;
  userName?: string | null;
  fullName?: string | null;
  issuedAt?: string | null;
  code?: string | null;
};
