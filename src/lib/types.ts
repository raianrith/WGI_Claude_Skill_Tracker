export type SkillCategory = "client work" | "internal ops" | "personal";

export type Person = {
  id: string;
  full_name: string;
  email: string;
  auth_user_id: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Skill = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: SkillCategory;
  time_saved: string | null;
  fun_fact: string | null;
  output_url: string | null;
  shipped_at: string;
  created_at: string;
};

export type SkillWithRelations = Skill & {
  creator: Person;
  collaborators: Person[];
  upvote_count: number;
  viewer_has_upvoted: boolean;
};

export type ActivityItem = {
  id: string;
  type: "ship" | "upvote";
  message: string;
  created_at: string;
};
