import { users, achievements, sessions, yogaPoses, products, dietPlans, musicTracks } from "@shared/schema";
import type {
  InsertUser, User, Session, Achievement,
  YogaPose, Product, DietPlan, MusicTrack,
  UserRelation, Challenge, ChallengeParticipant,
  Instructor, LessonGroup, Lesson
} from "@shared/schema";

export interface IStorage {
  // Existing methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserExperience(id: number, points: number): Promise<void>;
  createSession(session: Omit<Session, "id" | "createdAt">): Promise<Session>;
  getUserSessions(userId: number): Promise<Session[]>;
  createAchievement(achievement: Omit<Achievement, "id" | "earnedAt">): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;

  // New methods from original code
  getAllYogaPoses(): Promise<YogaPose[]>;
  getYogaPosesByDifficulty(difficulty: string): Promise<YogaPose[]>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getDietPlans(): Promise<DietPlan[]>;
  getDietPlansByType(type: string): Promise<DietPlan[]>;
  getMusicTracks(): Promise<MusicTrack[]>;
  getMusicTracksByCategory(category: string): Promise<MusicTrack[]>;

  // Social feature methods
  followUser(followerId: number, followingId: number): Promise<UserRelation>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;

  // Challenge and leaderboard methods
  createChallenge(challenge: Omit<Challenge, "id">): Promise<Challenge>;
  getChallenges(): Promise<Challenge[]>;
  getCurrentChallenge(): Promise<Challenge | undefined>;
  joinChallenge(userId: number, challengeId: number): Promise<ChallengeParticipant>;
  updateChallengeScore(userId: number, challengeId: number, score: number): Promise<void>;
  getLeaderboard(challengeId: number): Promise<(ChallengeParticipant & { user: User })[]>;
  getGlobalLeaderboard(): Promise<(User & { totalScore: number })[]>;

  // Instructor methods
  getInstructors(): Promise<Instructor[]>;
  getInstructorById(id: number): Promise<Instructor | undefined>;

  // Lesson group methods
  getLessonGroups(): Promise<(LessonGroup & { instructor: Instructor })[]>;
  getLessonsByGroupId(groupId: number): Promise<Lesson[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private achievements: Map<number, Achievement>;
  private yogaPoses: Map<number, YogaPose>;
  private products: Map<number, Product>;
  private dietPlans: Map<number, DietPlan>;
  private musicTracks: Map<number, MusicTrack>;
  private userRelations: Map<number, UserRelation>;
  private challenges: Map<number, Challenge>;
  private challengeParticipants: Map<number, ChallengeParticipant>;
  private instructors: Map<number, Instructor>;
  private lessonGroups: Map<number, LessonGroup>;
  private lessons: Map<number, Lesson>;

  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.achievements = new Map();
    this.yogaPoses = new Map();
    this.products = new Map();
    this.dietPlans = new Map();
    this.musicTracks = new Map();
    this.userRelations = new Map();
    this.challenges = new Map();
    this.challengeParticipants = new Map();
    this.instructors = new Map();
    this.lessonGroups = new Map();
    this.lessons = new Map();
    this.currentId = {
      users: 1,
      sessions: 1,
      achievements: 1,
      yogaPoses: 1,
      products: 1,
      dietPlans: 1,
      musicTracks: 1,
      userRelations: 1,
      challenges: 1,
      challengeParticipants: 1,
      instructors: 1,
      lessonGroups: 1,
      lessons: 1,
    };

    this.initializeSampleData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      ...insertUser,
      id,
      experiencePoints: 0,
      totalSessions: 0,
      lastSession: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserExperience(id: number, points: number): Promise<void> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    user.experiencePoints += points;
    user.totalSessions += 1;
    user.lastSession = new Date();
    this.users.set(id, user);
  }

  async createSession(sessionData: Omit<Session, "id" | "createdAt">): Promise<Session> {
    const id = this.currentId.sessions++;
    const session: Session = {
      ...sessionData,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  async createAchievement(achievementData: Omit<Achievement, "id" | "earnedAt">): Promise<Achievement> {
    const id = this.currentId.achievements++;
    const achievement: Achievement = {
      ...achievementData,
      id,
      earnedAt: new Date(),
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (achievement) => achievement.userId === userId,
    );
  }

  async getAllYogaPoses(): Promise<YogaPose[]> {
    return Array.from(this.yogaPoses.values());
  }

  async getYogaPosesByDifficulty(difficulty: string): Promise<YogaPose[]> {
    return Array.from(this.yogaPoses.values()).filter(
      (pose) => pose.difficulty === difficulty,
    );
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category,
    );
  }

  async getDietPlans(): Promise<DietPlan[]> {
    return Array.from(this.dietPlans.values());
  }

  async getDietPlansByType(type: string): Promise<DietPlan[]> {
    return Array.from(this.dietPlans.values()).filter(
      (plan) => plan.type === type,
    );
  }

  async getMusicTracks(): Promise<MusicTrack[]> {
    return Array.from(this.musicTracks.values());
  }

  async getMusicTracksByCategory(category: string): Promise<MusicTrack[]> {
    return Array.from(this.musicTracks.values()).filter(
      (track) => track.category === category,
    );
  }

  async followUser(followerId: number, followingId: number): Promise<UserRelation> {
    const id = this.currentId.userRelations++;
    const relation: UserRelation = {
      id,
      followerId,
      followingId,
      createdAt: new Date(),
    };
    this.userRelations.set(id, relation);
    return relation;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const relation = Array.from(this.userRelations.values()).find(
      (r) => r.followerId === followerId && r.followingId === followingId,
    );
    if (relation) {
      this.userRelations.delete(relation.id);
    }
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.userRelations.values())
      .filter((r) => r.followingId === userId)
      .map((r) => r.followerId);

    return Array.from(this.users.values()).filter((u) => followerIds.includes(u.id));
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.userRelations.values())
      .filter((r) => r.followerId === userId)
      .map((r) => r.followingId);

    return Array.from(this.users.values()).filter((u) => followingIds.includes(u.id));
  }

  async createChallenge(challengeData: Omit<Challenge, "id">): Promise<Challenge> {
    const id = this.currentId.challenges++;
    const challenge: Challenge = { ...challengeData, id };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getCurrentChallenge(): Promise<Challenge | undefined> {
    const now = new Date();
    return Array.from(this.challenges.values()).find(
      (c) => now >= c.startDate && now <= c.endDate,
    );
  }

  async joinChallenge(userId: number, challengeId: number): Promise<ChallengeParticipant> {
    const id = this.currentId.challengeParticipants++;
    const participant: ChallengeParticipant = {
      id,
      userId,
      challengeId,
      currentScore: 0,
      joinedAt: new Date(),
    };
    this.challengeParticipants.set(id, participant);
    return participant;
  }

  async updateChallengeScore(userId: number, challengeId: number, score: number): Promise<void> {
    const participant = Array.from(this.challengeParticipants.values()).find(
      (p) => p.userId === userId && p.challengeId === challengeId,
    );
    if (participant) {
      participant.currentScore = score;
      this.challengeParticipants.set(participant.id, participant);
    }
  }

  async getLeaderboard(challengeId: number): Promise<(ChallengeParticipant & { user: User })[]> {
    const participants = Array.from(this.challengeParticipants.values())
      .filter((p) => p.challengeId === challengeId)
      .sort((a, b) => b.currentScore - a.currentScore);

    return participants.map((p) => ({
      ...p,
      user: this.users.get(p.userId)!,
    }));
  }

  async getGlobalLeaderboard(): Promise<(User & { totalScore: number })[]> {
    const users = Array.from(this.users.values());
    const userScores = new Map<number, number>();

    for (const session of this.sessions.values()) {
      const currentScore = userScores.get(session.userId) || 0;
      userScores.set(session.userId, currentScore + session.score);
    }

    return users
      .map((user) => ({
        ...user,
        totalScore: userScores.get(user.id) || 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  async getInstructors(): Promise<Instructor[]> {
    return Array.from(this.instructors.values());
  }

  async getInstructorById(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }

  async getLessonGroups(): Promise<(LessonGroup & { instructor: Instructor })[]> {
    const groups = Array.from(this.lessonGroups.values());
    return Promise.all(
      groups.map(async (group) => {
        const instructor = await this.getInstructorById(group.instructorId);
        return { ...group, instructor: instructor! };
      })
    );
  }

  async getLessonsByGroupId(groupId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter((lesson) => lesson.groupId === groupId)
      .sort((a, b) => a.sequence - b.sequence);
  }


  private initializeSampleData() {
    const poses: YogaPose[] = [
      {
        id: this.currentId.yogaPoses++,
        name: "Mountain Pose",
        description: "A standing pose that forms the foundation of all standing poses.",
        difficulty: "beginner",
        imageUrl: "/images/mountain-pose.svg",
        videoUrl: "/videos/mountain-pose.mp4",
        benefits: "Improves posture, strengthens thighs, knees, and ankles",
      },
      {
        id: this.currentId.yogaPoses++,
        name: "Warrior I",
        description: "A standing pose that stretches and strengthens the whole body.",
        difficulty: "intermediate",
        imageUrl: "/images/warrior-1.svg",
        videoUrl: "/videos/warrior-1.mp4",
        benefits: "Strengthens shoulders, arms, legs, ankles and back",
      },
    ];
    poses.forEach(pose => this.yogaPoses.set(pose.id, pose));

    const products: Product[] = [
      {
        id: this.currentId.products++,
        name: "Premium Yoga Mat",
        description: "High-quality, non-slip yoga mat perfect for all types of yoga.",
        price: 1499,
        imageUrl: "/images/products/yoga-mat.svg",
        category: "mats",
        stockQuantity: 50,
        currency: "INR",
      },
      {
        id: this.currentId.products++,
        name: "Yoga Block Set",
        description: "Set of 2 high-density foam blocks for better stability and support.",
        price: 699,
        imageUrl: "/images/products/yoga-blocks.svg",
        category: "props",
        stockQuantity: 100,
        currency: "INR",
      },
    ];
    products.forEach(product => this.products.set(product.id, product));

    const dietPlans: DietPlan[] = [
      {
        id: this.currentId.dietPlans++,
        name: "Yoga Vitality Diet",
        description: "A balanced diet plan for yoga practitioners",
        type: "vegetarian",
        calories: 2000,
        recommendations: "Start your day with warm lemon water, focus on whole grains and plant-based proteins",
      },
      {
        id: this.currentId.dietPlans++,
        name: "Power Yoga Diet",
        description: "High-protein diet for intense yoga practice",
        type: "vegan",
        calories: 2500,
        recommendations: "Include protein smoothies, nuts, and plenty of leafy greens",
      },
    ];
    dietPlans.forEach(plan => this.dietPlans.set(plan.id, plan));

    const musicTracks: MusicTrack[] = [
      {
        id: this.currentId.musicTracks++,
        title: "Morning Meditation",
        artist: "Zen Masters",
        duration: 300,
        audioUrl: "/audio/morning-meditation.mp3",
        category: "meditation",
      },
      {
        id: this.currentId.musicTracks++,
        title: "Flow State",
        artist: "Yoga Sounds",
        duration: 600,
        audioUrl: "/audio/flow-state.mp3",
        category: "practice",
      },
    ];
    musicTracks.forEach(track => this.musicTracks.set(track.id, track));

    const challenges: Challenge[] = [
      {
        id: this.currentId.challenges++,
        title: "30-Day Yoga Challenge",
        description: "Complete daily yoga sessions for 30 days",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetScore: 3000,
      },
      {
        id: this.currentId.challenges++,
        title: "Weekend Warrior",
        description: "Achieve the highest score in weekend sessions",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        targetScore: 1000,
      },
    ];
    challenges.forEach(challenge => this.challenges.set(challenge.id, challenge));

    const instructors: Instructor[] = [
      {
        id: this.currentId.instructors++,
        name: "Priya Sharma",
        bio: "Certified yoga instructor with 10 years of experience in Hatha and Vinyasa yoga.",
        imageUrl: "/images/instructors/priya.svg",
        specialty: "Hatha Yoga",
      },
      {
        id: this.currentId.instructors++,
        name: "Rajesh Kumar",
        bio: "Expert in traditional Ashtanga yoga with focus on breathing techniques.",
        imageUrl: "/images/instructors/rajesh.svg",
        specialty: "Ashtanga Yoga",
      },
      {
        id: this.currentId.instructors++,
        name: "Amita Patel",
        bio: "Specializes in gentle yoga and meditation for beginners.",
        imageUrl: "/images/instructors/amita.svg",
        specialty: "Gentle Yoga",
      },
    ];
    instructors.forEach(instructor => this.instructors.set(instructor.id, instructor));

    const lessonGroups: LessonGroup[] = [
      {
        id: this.currentId.lessonGroups++,
        name: "Yoga Basics",
        description: "Perfect for beginners - learn fundamental poses and breathing techniques.",
        level: "Beginner",
        instructorId: 3,
        imageUrl: "/images/lessons/yoga-basics.svg",
        priceType: "free",
        price: 0,
        currency: "INR",
      },
      {
        id: this.currentId.lessonGroups++,
        name: "Morning Flow",
        description: "Start your day with energizing yoga sequences.",
        level: "Beginner",
        instructorId: 1,
        imageUrl: "/images/lessons/morning-flow.svg",
        priceType: "free",
        price: 0,
        currency: "INR",
      },
      {
        id: this.currentId.lessonGroups++,
        name: "Advanced Ashtanga Series",
        description: "Intensive Ashtanga yoga series for experienced practitioners.",
        level: "Advanced",
        instructorId: 2,
        imageUrl: "/images/lessons/ashtanga.svg",
        priceType: "paid",
        price: 2999,
        currency: "INR",
      },
      {
        id: this.currentId.lessonGroups++,
        name: "Power Yoga Mastery",
        description: "Build strength and flexibility with dynamic power yoga sequences.",
        level: "Intermediate",
        instructorId: 1,
        imageUrl: "/images/lessons/power-yoga.svg",
        priceType: "paid",
        price: 1999,
        currency: "INR",
      },
    ];
    lessonGroups.forEach(group => this.lessonGroups.set(group.id, group));

    const lessons: Lesson[] = [
      {
        id: this.currentId.lessons++,
        groupId: 1,
        title: "Introduction to Yoga",
        description: "Learn the basics of yoga postures and breathing.",
        duration: 30,
        videoUrl: null,
        audioUrl: "/audio/lessons/intro-yoga.mp3",
        imageUrl: "/images/lessons/intro-yoga.svg",
        sequence: 1,
      },
      {
        id: this.currentId.lessons++,
        groupId: 1,
        title: "Basic Sun Salutations",
        description: "Master the fundamental Surya Namaskar sequence.",
        duration: 45,
        videoUrl: null,
        audioUrl: "/audio/lessons/sun-salutations.mp3",
        imageUrl: "/images/lessons/sun-salutations.svg",
        sequence: 2,
      },
      {
        id: this.currentId.lessons++,
        groupId: 3,
        title: "Advanced Vinyasa Flow",
        description: "Complex flowing sequences for experienced practitioners.",
        duration: 60,
        videoUrl: "/videos/advanced-vinyasa.mp4",
        audioUrl: "/audio/lessons/advanced-vinyasa.mp3",
        imageUrl: "/images/lessons/advanced-vinyasa.svg",
        sequence: 1,
      },
    ];
    lessons.forEach(lesson => this.lessons.set(lesson.id, lesson));
  }
}

export const storage = new MemStorage();