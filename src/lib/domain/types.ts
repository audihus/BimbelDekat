import type { AccountRole, IndonesiaZone, LessonStatus } from "./rules";

export interface Account { id: string; display_name: string; email: string; role: AccountRole; status: "active" | "deletion_pending"; timezone: IndonesiaZone; workspace_id: string; deletion_requested_at: string | null; session_expires_at: string }
export interface Student { id: string; name: string; level: string; guardian_phone: string; address: string; notes: string; source: string; archived: boolean; created_at: string }
export interface Package { id: string; student_id: string; name: string; quota: number; opening_used: number; agreed_price: string; remaining: number; received: string; due: string; overpaid: string; closed_at: string | null; closure_reason: string | null }
export interface Lesson { id: string; student_id: string; package_id: string; starts_at: string; ends_at: string; mode: "online" | "offline"; status: LessonStatus; reason: string; cancelled_by: string | null }
export interface Payment { id: string; package_id: string; amount: string; kind: "payment" | "refund" | "correction"; reason: string; paid_at: string }
export interface GuardianLink { id: string; student_id: string; expires_at: string; revoked_at: string | null }
export interface Offer { subject: string; level: string; mode: "online" | "offline"; duration: number; price: string }
export interface Area { province: string; regency: string; district: string }
export interface ProfileDocument { name: string; about: string; phone: string; province: string; regency: string; areas: Area[]; offers: Offer[]; photo?: string }
export interface TeacherProfile { id: string; draft: ProfileDocument; published: ProfileDocument | null; review_status: string; visible: boolean; admin_hidden: boolean; accepting: boolean; review_reason: string }
export interface PublicTeacher { id: string; document: ProfileDocument; accepting: boolean }
export interface WorkspaceSnapshot { students: Student[]; packages: Package[]; lessons: Lesson[]; payments: Payment[]; guardian_links: GuardianLink[]; profile: TeacherProfile | null; quota_events: { id: string; package_id: string; delta: number; reason: string; created_at: string }[]; audit_events: { id: string; action: string; reason: string; created_at: string }[] }
export interface GuardianSummary { student: Student; teacher: { name: string; timezone: IndonesiaZone }; packages: Package[]; lessons: Lesson[]; payments: Payment[]; expires_at: string }
