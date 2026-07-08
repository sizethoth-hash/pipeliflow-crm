// Gerado manualmente — sincronizar com supabase/migrations/ sempre que o schema mudar.
// Para regenerar automaticamente: npx supabase gen types typescript --project-id hmxmtzqbioxyyjqmobyd

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ── Enums ────────────────────────────────────────────────────────────────────

export type PlanType = 'free' | 'pro'
export type MemberRole = 'admin' | 'member'
export type LeadStatus = 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type DealStage = 'new_lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note'
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'payment_failed'
  | 'trialing'
  | 'incomplete'

// ── Row types (shape retornado pelo Supabase) ─────────────────────────────────

export type WorkspaceRow = {
  id: string
  name: string
  plan: PlanType
  owner_id: string
  created_at: string
  updated_at: string
}

export type WorkspaceMemberRow = {
  workspace_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

export type LeadRow = {
  id: string
  workspace_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  job_title: string | null
  status: LeadStatus
  potential_value: number | null
  notes: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type DealRow = {
  id: string
  workspace_id: string
  lead_id: string | null
  title: string
  value: number
  stage: DealStage
  owner_id: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export type ActivityRow = {
  id: string
  workspace_id: string
  lead_id: string
  type: ActivityType
  description: string
  author_id: string
  scheduled_at: string | null
  created_at: string
}

export type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type WorkspaceInviteRow = {
  id: string
  workspace_id: string
  email: string
  role: MemberRole
  token: string
  invited_by: string
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export type SubscriptionRow = {
  id: string
  workspace_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: PlanType
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// ── Insert types (campos obrigatórios para INSERT) ────────────────────────────

export type WorkspaceInsert = {
  name: string
  owner_id: string
  plan?: PlanType
}

export type WorkspaceMemberInsert = {
  workspace_id: string
  user_id: string
  role?: MemberRole
}

export type LeadInsert = Pick<LeadRow, 'workspace_id' | 'name' | 'email' | 'owner_id'> &
  Partial<Pick<LeadRow, 'phone' | 'company' | 'job_title' | 'status' | 'potential_value' | 'notes'>>

export type DealInsert = Pick<DealRow, 'workspace_id' | 'title' | 'owner_id'> &
  Partial<Pick<DealRow, 'lead_id' | 'value' | 'stage' | 'due_date'>>

export type ActivityInsert = Pick<
  ActivityRow,
  'workspace_id' | 'lead_id' | 'type' | 'description' | 'author_id'
> & { scheduled_at?: string | null }

// ── Update types (todos os campos opcionais exceto PK) ────────────────────────

export type WorkspaceUpdate = Partial<Pick<WorkspaceRow, 'name' | 'plan'>>

export type LeadUpdate = Partial<
  Pick<
    LeadRow,
    | 'name'
    | 'email'
    | 'phone'
    | 'company'
    | 'job_title'
    | 'status'
    | 'potential_value'
    | 'notes'
    | 'owner_id'
  >
>

export type DealUpdate = Partial<
  Pick<DealRow, 'title' | 'value' | 'stage' | 'lead_id' | 'owner_id' | 'due_date'>
>

export type SubscriptionUpdate = Partial<
  Pick<
    SubscriptionRow,
    | 'stripe_customer_id'
    | 'stripe_subscription_id'
    | 'plan'
    | 'status'
    | 'current_period_start'
    | 'current_period_end'
    | 'cancel_at_period_end'
  >
>

// ── Database schema type (compatível com createClient<Database>()) ────────────

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: WorkspaceRow
        Insert: WorkspaceInsert
        Update: WorkspaceUpdate
        Relationships: []
      }
      workspace_members: {
        Row: WorkspaceMemberRow
        Insert: WorkspaceMemberInsert
        Update: Partial<Pick<WorkspaceMemberRow, 'role'>>
        Relationships: []
      }
      leads: {
        Row: LeadRow
        Insert: LeadInsert
        Update: LeadUpdate
        Relationships: []
      }
      deals: {
        Row: DealRow
        Insert: DealInsert
        Update: DealUpdate
        Relationships: []
      }
      activities: {
        Row: ActivityRow
        Insert: ActivityInsert
        Update: Partial<Pick<ActivityRow, 'description'>>
        Relationships: []
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>
        Update: SubscriptionUpdate
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>
        Update: Partial<Pick<ProfileRow, 'full_name' | 'avatar_url'>>
        Relationships: []
      }
      workspace_invites: {
        Row: WorkspaceInviteRow
        Insert: Pick<WorkspaceInviteRow, 'workspace_id' | 'email' | 'role' | 'invited_by'>
        Update: Partial<Pick<WorkspaceInviteRow, 'accepted_at'>>
        Relationships: []
      }
    }
    Views: Record<string, { Row: Record<string, unknown>; Relationships: [] }>
    Functions: {
      is_workspace_member: {
        Args: { p_workspace_id: string }
        Returns: boolean
      }
      is_workspace_admin: {
        Args: { p_workspace_id: string }
        Returns: boolean
      }
      create_workspace_with_admin: {
        Args: { p_name: string }
        Returns: { id: string; name: string; plan: PlanType }
      }
      accept_workspace_invite: {
        Args: { p_token: string }
        Returns: { workspace_id: string; role: MemberRole }
      }
      get_workspace_member_count: {
        Args: { p_workspace_id: string }
        Returns: number
      }
      create_invite_if_allowed: {
        Args: {
          p_workspace_id: string
          p_email: string
          p_role: string
          p_invited_by: string
        }
        Returns: string
      }
    }
    Enums: {
      plan_type: PlanType
      member_role: MemberRole
      lead_status: LeadStatus
      deal_stage: DealStage
      activity_type: ActivityType
      subscription_status: SubscriptionStatus
    }
    CompositeTypes: Record<string, unknown>
  }
}
