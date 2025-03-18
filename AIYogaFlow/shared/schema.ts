import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  experiencePoints: integer("experience_points").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  lastSession: timestamp("last_session"),
  location: text("location"),
});

// Add social relationships table
export const userRelations = pgTable("user_relations", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Add user challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetScore: integer("target_score").notNull(),
});

// Add user challenge participation table
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  currentScore: integer("current_score").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Keep existing tables
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: integer("duration").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const yogaPoses = pgTable("yoga_poses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  benefits: text("benefits").notNull(),
});

// Update the products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  stockQuantity: integer("stock_quantity").notNull(),
  currency: text("currency").notNull().default("INR"),
});

export const dietPlans = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  calories: integer("calories").notNull(),
  recommendations: text("recommendations").notNull(),
});

export const musicTracks = pgTable("music_tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  duration: integer("duration").notNull(),
  audioUrl: text("audio_url").notNull(),
  category: text("category").notNull(),
});

// Add instructor table
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url").notNull(),
  specialty: text("specialty").notNull(),
});

// Update the lesson groups table
export const lessonGroups = pgTable("lesson_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  instructorId: integer("instructor_id").notNull(),
  imageUrl: text("image_url").notNull(),
  priceType: text("price_type").notNull(), // "free" or "paid"
  price: decimal("price").notNull(),
  currency: text("currency").notNull().default("INR"),
});

// Update the lessons table schema to make videoUrl optional
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  videoUrl: text("video_url").default(null),
  audioUrl: text("audio_url").notNull(),
  imageUrl: text("image_url").notNull(),
  sequence: integer("sequence").notNull(),
});

// Keep existing schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  location: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  duration: true,
  score: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
});

export const insertYogaPoseSchema = createInsertSchema(yogaPoses);
export const insertProductSchema = createInsertSchema(products);
export const insertDietPlanSchema = createInsertSchema(dietPlans);
export const insertMusicTrackSchema = createInsertSchema(musicTracks);

// Add new schemas for social features
export const insertUserRelationSchema = createInsertSchema(userRelations).pick({
  followerId: true,
  followingId: true,
});

export const insertChallengeSchema = createInsertSchema(challenges);

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).pick({
  userId: true,
  challengeId: true,
});

// Add new schemas for lessons and instructors
export const insertInstructorSchema = createInsertSchema(instructors);
export const insertLessonGroupSchema = createInsertSchema(lessonGroups);
export const insertLessonSchema = createInsertSchema(lessons);


// Keep existing type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type YogaPose = typeof yogaPoses.$inferSelect;
export type Product = typeof products.$inferSelect;
export type DietPlan = typeof dietPlans.$inferSelect;
export type MusicTrack = typeof musicTracks.$inferSelect;

// Add new type exports
export type UserRelation = typeof userRelations.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type Instructor = typeof instructors.$inferSelect;
export type LessonGroup = typeof lessonGroups.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;