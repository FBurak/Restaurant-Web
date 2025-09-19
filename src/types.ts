/* ---------------- Types ---------------- */
import { type ReactNode } from "react";
export type SocialKey = "instagram" | "youtube" | "tiktok" | "facebook" | "linkedin";
export type Socials = Partial<Record<SocialKey, string>>;

export interface Restaurant {
  name?: string;
  aboutHtml?: string;
  googleBusinessUrl?: string | null;
  videoUrl?: string | null;
  socials?: Socials;
  isVisible?: boolean;
  headerImageUrl?: string | null;
  updatedAt?: unknown;
}
export interface GalleryItem {
  id: string;
  url: string;
  sortOrder: number;
}
export interface PasswordItem {
  id: string;
  title: string;
  value: string;
  hidden: boolean;
  sortOrder: number;
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
export const REST_ID = "kaffeewerk";
