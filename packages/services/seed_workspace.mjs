/* eslint-disable */
import fs from "fs";
import postgres from "postgres";

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("\x27") && val.endsWith("\x27"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = parseEnv("/home/personal/Programing/KEEL/supabase/.env.local");
if (!env.SUPABASE_DB_URL) {
  console.error("Missing SUPABASE_DB_URL in supabase/.env.local");
  process.exit(1);
}

const sql = postgres(env.SUPABASE_DB_URL, { ssl: "require" });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function genDeterministicUUID(prefix, key) {
  let hash = 0;
  const str = `${prefix}-${key}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, "0");
  return `e0000000-0000-0000-0000-${hex}`;
}

async function seed() {
  console.log("🚀 Starting Enterprise Flagship Workspace Seeding (Keel HQ)...");

  // 1. 10 Professional Team Members
  const usersToSeed = [
    {
      id: "a0000001-0000-0000-0000-000000000001",
      email: "admin@keel.so",
      password: "password123",
      first_name: "Rafay",
      last_name: "Admin",
      display_name: "Rafay Admin",
      is_superadmin: true,
      role: "Founder & Chief Architect",
      company_role: "Executive / Founder",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000002",
      email: "sarah.chen@keel.so",
      password: "password123",
      first_name: "Sarah",
      last_name: "Chen",
      display_name: "Sarah Chen",
      is_superadmin: false,
      role: "Staff Product Designer",
      company_role: "Lead Product Designer",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000003",
      email: "alex.rivera@keel.so",
      password: "password123",
      first_name: "Alex",
      last_name: "Rivera",
      display_name: "Alex Rivera",
      is_superadmin: false,
      role: "Principal Systems Architect",
      company_role: "Systems Architect",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000004",
      email: "marcus.vance@keel.so",
      password: "password123",
      first_name: "Marcus",
      last_name: "Vance",
      display_name: "Marcus Vance",
      is_superadmin: false,
      role: "Lead Security & SRE Engineer",
      company_role: "Security Lead",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000005",
      email: "elena.rostova@keel.so",
      password: "password123",
      first_name: "Elena",
      last_name: "Rostova",
      display_name: "Elena Rostova",
      is_superadmin: false,
      role: "Staff Frontend Engineer",
      company_role: "Frontend Engineer",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000006",
      email: "david.kim@keel.so",
      password: "password123",
      first_name: "David",
      last_name: "Kim",
      display_name: "David Kim",
      is_superadmin: false,
      role: "Senior Fullstack Engineer",
      company_role: "Fullstack Engineer",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000007",
      email: "priya.sharma@keel.so",
      password: "password123",
      first_name: "Priya",
      last_name: "Sharma",
      display_name: "Priya Sharma",
      is_superadmin: false,
      role: "VP of Product Management",
      company_role: "VP Product",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000008",
      email: "james.wilson@keel.so",
      password: "password123",
      first_name: "James",
      last_name: "Wilson",
      display_name: "James Wilson",
      is_superadmin: false,
      role: "Staff AI/ML Infrastructure Engineer",
      company_role: "AI Lead",
      avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000009",
      email: "maya.lin@keel.so",
      password: "password123",
      first_name: "Maya",
      last_name: "Lin",
      display_name: "Maya Lin",
      is_superadmin: false,
      role: "Lead Developer Experience Engineer",
      company_role: "DevRel / DX",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    },
    {
      id: "a0000001-0000-0000-0000-000000000010",
      email: "lucas.moreau@keel.so",
      password: "password123",
      first_name: "Lucas",
      last_name: "Moreau",
      display_name: "Lucas Moreau",
      is_superadmin: false,
      role: "Senior QA & Reliability Specialist",
      company_role: "QA Lead",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80",
    },
  ];

  console.log("🧹 Cleaning up any previous Keel HQ seed data in strict dependency order...");
  const userEmails = usersToSeed.map((u) => u.email);

  // Ensure notification trigger function matches schema
  await sql`
    CREATE OR REPLACE FUNCTION public.raise_notification(
      p_receiver_id uuid,
      p_triggered_by_id uuid,
      p_workspace_id uuid,
      p_project_id uuid,
      p_entity_name text,
      p_entity_identifier uuid,
      p_title text,
      p_message text,
      p_message_html text default null,
      p_data jsonb default '{}'::jsonb
    )
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      v_sender text;
    BEGIN
      IF p_triggered_by_id IS NOT NULL THEN
        SELECT COALESCE(display_name, first_name || ' ' || last_name, email)
        INTO v_sender
        FROM public.users
        WHERE id = p_triggered_by_id;
      END IF;

      INSERT INTO public.notifications (
        id, created_at, updated_at, title, message, message_html, message_stripped,
        entity_name, entity_identifier, receiver_id, triggered_by_id,
        workspace_id, project_id, data, sender
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), p_title, jsonb_build_object('text', p_message),
        COALESCE(p_message_html, '<p>' || COALESCE(p_message, '') || '</p>'),
        COALESCE(p_message, ''),
        p_entity_name, p_entity_identifier, p_receiver_id, p_triggered_by_id,
        p_workspace_id, p_project_id, COALESCE(p_data, '{}'::jsonb), COALESCE(v_sender, 'system')
      );
    END;
    $$;
  `;

  // Safe Cascade Delete in exact order (deleting children first so triggers do not leave dangling activity rows)
  await sql`DELETE FROM public.issue_subscribers WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_assignees WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_labels WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.cycle_issues WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.module_issues WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_sequences WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_activities WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_activities WHERE issue_id IN (SELECT id FROM public.issues WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq'))`;
  await sql`DELETE FROM public.issue_comments WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_activities WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issue_activities WHERE issue_id IN (SELECT id FROM public.issues WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq'))`;
  await sql`DELETE FROM public.notifications WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.stickies WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.pages WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.chat_messages WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.chat_channels WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.issues WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.cycles WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.modules WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.labels WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.states WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.project_members WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.projects WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.workspace_home_preferences WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.workspace_members WHERE workspace_id IN (SELECT id FROM public.workspaces WHERE slug = 'keel-hq')`;
  await sql`DELETE FROM public.workspaces WHERE slug = 'keel-hq'`;

  await sql`DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM public.users WHERE email = ANY(${userEmails}))`;
  await sql`DELETE FROM public.users WHERE email = ANY(${userEmails})`;
  await sql`DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = ANY(${userEmails}))`;
  await sql`DELETE FROM auth.users WHERE email = ANY(${userEmails})`;

  console.log("👤 Provisioning 10 Team Members (Auth, Public Users, Profiles)...");
  for (const u of usersToSeed) {
    // 1a. Auth Users
    await sql`
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, recovery_sent_at, last_sign_in_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      )
      VALUES (
        ${u.id}::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
        ${u.email}, extensions.crypt(${u.password}::text, extensions.gen_salt('bf'::text)),
        NOW(), NOW(), NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        jsonb_build_object('display_name', ${u.display_name}::text, 'first_name', ${u.first_name}::text, 'last_name', ${u.last_name}::text),
        NOW(), NOW(),
        '', '', '', ''
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW(),
        raw_user_meta_data = EXCLUDED.raw_user_meta_data;
    `;

    // 1b. Auth Identities
    await sql`
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      )
      VALUES (
        ${u.id}::uuid, ${u.id}::text, ${u.id}::uuid,
        jsonb_build_object('sub', ${u.id}::text, 'email', ${u.email}::text),
        'email', NOW(), NOW(), NOW()
      )
      ON CONFLICT (provider, provider_id) DO UPDATE SET
        identity_data = EXCLUDED.identity_data,
        updated_at = NOW();
    `;

    // 1c. Public Users
    await sql`
      INSERT INTO public.users (
        id, password, username, email, first_name, last_name, avatar,
        date_joined, created_at, updated_at,
        last_location, created_location,
        is_superuser, is_managed, is_password_expired, is_active, is_staff,
        is_email_verified, is_password_autoset,
        token, user_timezone,
        last_login_ip, last_logout_ip, last_login_medium, last_login_uagent,
        is_bot, display_name, is_email_valid, is_password_reset_required
      )
      VALUES (
        ${u.id}, '', ${u.email}, ${u.email}, ${u.first_name}, ${u.last_name}, ${u.avatar_url},
        NOW(), NOW(), NOW(),
        'San Francisco, CA', 'San Francisco, CA',
        ${u.is_superadmin}, false, false, true, ${u.is_superadmin},
        true, true,
        '', 'America/Los_Angeles',
        '127.0.0.1', '', 'web', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        false, ${u.display_name}, true, false
      )
      ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name,
        avatar = EXCLUDED.avatar,
        is_superuser = EXCLUDED.is_superuser,
        is_staff = EXCLUDED.is_staff,
        is_active = true,
        is_email_verified = true;
    `;

    // 1d. Public Profiles
    await sql`
      INSERT INTO public.profiles (
        id, user_id, created_at, updated_at,
        theme, onboarding_step, mobile_onboarding_step, goals, product_tour,
        is_tour_completed, is_onboarded, is_mobile_onboarded,
        is_navigation_tour_completed, mobile_timezone_auto_set,
        is_smooth_cursor_enabled, is_app_rail_docked,
        has_billing_address, has_marketing_email_consent, is_subscribed_to_changelog,
        billing_address_country, company_name, language, background_color,
        notification_view_mode, start_of_the_week
      )
      VALUES (
        gen_random_uuid(), ${u.id}, NOW(), NOW(),
        '{"theme": "dark"}'::jsonb,
        '{"workspace_join": true, "profile_complete": true, "workspace_create": true, "workspace_invite": true}'::jsonb,
        '{}'::jsonb, '{"role": "engineering", "goal": "software_development"}'::jsonb, '{}'::jsonb,
        true, true, true,
        true, true,
        true, false,
        true, true, true,
        'US', 'Keel Technologies Inc.', 'en', '',
        'full', 1
      )
      ON CONFLICT (user_id) DO UPDATE SET
        is_onboarded = true,
        is_tour_completed = true,
        is_navigation_tour_completed = true,
        onboarding_step = '{"workspace_join": true, "profile_complete": true, "workspace_create": true, "workspace_invite": true}'::jsonb;
    `;
  }

  // 2. Provision Flagship Workspace
  const workspaceId = "b0000001-0000-0000-0000-000000000001";
  const primaryUserId = usersToSeed[0].id;
  const workspaceSlug = "keel-hq";
  const workspaceName = "Keel HQ";

  console.log(`🏢 Provisioning Enterprise Workspace: ${workspaceName} (${workspaceSlug})...`);
  await sql`
    INSERT INTO public.workspaces (
      id, created_at, updated_at, name, slug, owner_id, created_by_id, updated_by_id,
      organization_size, timezone, background_color, logo
    )
    VALUES (
      ${workspaceId}, NOW(), NOW(), ${workspaceName}, ${workspaceSlug},
      ${primaryUserId}, ${primaryUserId}, ${primaryUserId},
      '50-200', 'America/Los_Angeles', '#0B0D13',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      owner_id = EXCLUDED.owner_id,
      logo = EXCLUDED.logo;
  `;

  // 2b. Add Workspace Members
  console.log("👥 Adding 10 Members to Keel HQ Workspace...");
  for (let i = 0; i < usersToSeed.length; i++) {
    const u = usersToSeed[i];
    const role = i < 3 ? 20 : 15; // Admins vs Members
    await sql`
      INSERT INTO public.workspace_members (
        id, created_at, updated_at, role, member_id, workspace_id, created_by_id, updated_by_id,
        is_active, view_props, default_props, issue_props, explored_features, getting_started_checklist, tips, company_role
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), ${role}, ${u.id}, ${workspaceId}, ${primaryUserId}, ${primaryUserId},
        true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{"theme": true, "cycles": true, "modules": true}'::jsonb,
        '{"profile": true, "workspace": true, "invite": true}'::jsonb, '{"shortcuts": true}'::jsonb, ${u.company_role}
      )
      ON CONFLICT DO NOTHING;
    `;

    // Preferences
    await sql`
      INSERT INTO public.workspace_home_preferences (
        id, created_at, updated_at, user_id, workspace_id, key, is_enabled, config, sort_order,
        created_by_id, updated_by_id
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), ${u.id}, ${workspaceId}, 'my_stickies', true, '{}'::jsonb, 10000,
        ${u.id}, ${u.id}
      )
      ON CONFLICT DO NOTHING;
    `;
  }

  // 3. Provision 3 Production Projects
  const projectsData = [
    {
      id: "c0000001-0000-0000-0000-000000000001",
      name: "Core Runtime & Infrastructure",
      identifier: "CORE",
      description:
        "Next-generation distributed state synchronizer, event broker, and multi-region database replication engine.",
      lead_id: usersToSeed[2].id, // Alex Rivera
      icon_prop: '{"emoji": "⚡"}',
      color: "#3B82F6",
    },
    {
      id: "c0000001-0000-0000-0000-000000000002",
      name: "NextGen Web & Design System",
      identifier: "WEB",
      description:
        "Bespoke ultra-fast UI components, fluid canvas interactions, dark mode glassmorphism, and responsive design tokens.",
      lead_id: usersToSeed[1].id, // Sarah Chen
      icon_prop: '{"emoji": "✨"}',
      color: "#8B5CF6",
    },
    {
      id: "c0000001-0000-0000-0000-000000000003",
      name: "AI Copilot & Realtime Pipeline",
      identifier: "AI",
      description: "Agentic AI workflows, vector embeddings, semantic workspace search, and automated code insights.",
      lead_id: usersToSeed[7].id, // James Wilson
      icon_prop: '{"emoji": "🧠"}',
      color: "#10B981",
    },
  ];

  console.log("📁 Provisioning 3 Flagship Projects...");
  for (const proj of projectsData) {
    await sql`
      INSERT INTO public.projects (
        id, created_at, updated_at, name, description, description_text, description_html,
        identifier, workspace_id, default_assignee_id, project_lead_id,
        icon_prop, emoji, cover_image, network,
        cycle_view, module_view, issue_views_view, page_view, intake_view,
        archive_in, close_in, logo_props,
        is_time_tracking_enabled, is_issue_type_enabled, guest_view_all_features, timezone,
        created_by_id, updated_by_id
      )
      VALUES (
        ${proj.id}, NOW(), NOW(), ${proj.name}, ${proj.description},
        '{"ops": []}'::jsonb, '{"ops": []}'::jsonb,
        ${proj.identifier}, ${workspaceId},
        ${primaryUserId}, ${proj.lead_id},
        ${proj.icon_prop}::jsonb, '',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        2,
        true, true, true, true, true,
        30, 30, '{}'::jsonb,
        true, false, false, 'America/Los_Angeles',
        ${primaryUserId}, ${primaryUserId}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        identifier = EXCLUDED.identifier;
    `;

    // Add all 10 members to each project
    for (let i = 0; i < usersToSeed.length; i++) {
      const u = usersToSeed[i];
      const role = i < 3 ? 20 : 15;
      await sql`
        INSERT INTO public.project_members (
          id, created_at, updated_at, role, member_id, project_id, workspace_id,
          created_by_id, updated_by_id, is_active, view_props, default_props, preferences, sort_order
        )
        VALUES (
          gen_random_uuid(), NOW(), NOW(), ${role}, ${u.id}, ${proj.id}, ${workspaceId},
          ${primaryUserId}, ${primaryUserId}, true, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, ${(i + 1) * 10000}
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    // Sequence for issue IDs
    await sql`
      INSERT INTO public.issue_sequences (
        id, created_at, updated_at, sequence, project_id, workspace_id,
        created_by_id, updated_by_id, deleted
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), 100, ${proj.id}, ${workspaceId},
        ${primaryUserId}, ${primaryUserId}, false
      )
      ON CONFLICT DO NOTHING;
    `;
  }

  // 4. Provision States across Projects
  console.log("🏷️ Provisioning Workflow States...");
  const statesMap = {};
  for (const proj of projectsData) {
    const statesData = [
      { name: "Backlog", group: "backlog", color: "#64748B", sequence: 1000, desc: "Ideas and unrefined requests" },
      { name: "Todo", group: "unstarted", color: "#94A3B8", sequence: 2000, desc: "Prioritized and ready to start" },
      { name: "In Progress", group: "started", color: "#3B82F6", sequence: 3000, desc: "Active development" },
      { name: "In Review", group: "started", color: "#F59E0B", sequence: 4000, desc: "Code review and staging QA" },
      { name: "Done", group: "completed", color: "#10B981", sequence: 5000, desc: "Merged and deployed to production" },
      { name: "Canceled", group: "cancelled", color: "#EF4444", sequence: 6000, desc: "Deprioritized or duplicate" },
    ];

    statesMap[proj.identifier] = {};
    for (const s of statesData) {
      const stateId = `d000000${proj.identifier === "CORE" ? "1" : proj.identifier === "WEB" ? "2" : "3"}-0000-0000-0000-00000000000${s.sequence / 1000}`;
      await sql`
        INSERT INTO public.states (
          id, created_at, updated_at, name, description, color, slug, "group", sequence,
          "default", is_triage, project_id, workspace_id, created_by_id, updated_by_id
        )
        VALUES (
          ${stateId}, NOW(), NOW(), ${s.name}, ${s.desc}, ${s.color}, ${slugify(s.name)}, ${s.group}, ${s.sequence},
          ${s.name === "Todo"}, false, ${proj.id}, ${workspaceId}, ${primaryUserId}, ${primaryUserId}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          color = EXCLUDED.color,
          "group" = EXCLUDED."group";
      `;
      statesMap[proj.identifier][s.name] = stateId;
    }
  }

  // 5. Provision Labels
  console.log("🎨 Provisioning High-Impact Labels...");
  const labelDefs = [
    { name: "P0 - Blocker", color: "#EF4444", desc: "Production blocking issue" },
    { name: "P1 - High", color: "#F97316", desc: "High priority deliverable" },
    { name: "Security", color: "#DC2626", desc: "Vulnerability or authentication audit" },
    { name: "Performance", color: "#8B5CF6", desc: "Latency reduction & database query optimization" },
    { name: "Design Polish", color: "#EC4899", desc: "Micro-interactions, typography, and theming" },
    { name: "Frontend", color: "#06B6D4", desc: "React, CSS, and client-state changes" },
    { name: "Backend", color: "#3B82F6", desc: "Postgres, services, and API layers" },
    { name: "AI / ML", color: "#10B981", desc: "Agent intelligence and vector search" },
    { name: "Tech Debt", color: "#6B7280", desc: "Refactoring and code cleanup" },
  ];

  const labelMap = {};
  let lblSort = 10000;
  for (const l of labelDefs) {
    const labelId = genDeterministicUUID("label", l.name);
    await sql`
      INSERT INTO public.labels (
        id, created_at, updated_at, name, description, color, sort_order,
        project_id, workspace_id, created_by_id, updated_by_id
      )
      VALUES (
        ${labelId}, NOW(), NOW(), ${l.name}, ${l.desc}, ${l.color}, ${lblSort},
        ${projectsData[0].id}, ${workspaceId}, ${primaryUserId}, ${primaryUserId}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        color = EXCLUDED.color;
    `;
    labelMap[l.name] = labelId;
    lblSort += 10000;
  }

  // 6. Provision Cycles & Modules
  console.log("⏱️ Provisioning Active Cycles & Modules...");
  const cyclesData = [
    {
      id: "c1000001-0000-0000-0000-000000000001",
      name: "Cycle 24 - Realtime Synchronization & Polish",
      desc: "Complete WebSocket subscription engine, optimistic UI updates, and sleek modern dark theming.",
      projId: projectsData[0].id,
      start: new Date(Date.now() - 5 * 86400000),
      end: new Date(Date.now() + 9 * 86400000),
    },
    {
      id: "c1000001-0000-0000-0000-000000000002",
      name: "Cycle 23 - Enterprise Security & RBAC",
      desc: "Full multi-tenant tenant isolation, cryptographic secrets management, and permission matrices.",
      projId: projectsData[0].id,
      start: new Date(Date.now() - 19 * 86400000),
      end: new Date(Date.now() - 5 * 86400000),
    },
    {
      id: "c1000001-0000-0000-0000-000000000003",
      name: "Cycle 25 - Agentic AI Workflows & Search",
      desc: "Embeddings pipeline, contextual document search, and autonomous multi-agent tool execution.",
      projId: projectsData[2].id,
      start: new Date(Date.now() + 10 * 86400000),
      end: new Date(Date.now() + 24 * 86400000),
    },
  ];

  for (let cIdx = 0; cIdx < cyclesData.length; cIdx++) {
    const cyc = cyclesData[cIdx];
    await sql`
      INSERT INTO public.cycles (
        id, created_at, updated_at, name, description, start_date, end_date,
        project_id, workspace_id, created_by_id, updated_by_id, owned_by_id,
        view_props, sort_order, progress_snapshot, logo_props, timezone, version
      )
      VALUES (
        ${cyc.id}, NOW(), NOW(), ${cyc.name}, ${cyc.desc}, ${cyc.start}, ${cyc.end},
        ${cyc.projId}, ${workspaceId}, ${primaryUserId}, ${primaryUserId}, ${primaryUserId},
        '{}'::jsonb, ${(cIdx + 1) * 10000}, '{"total": 12, "completed": 4}'::jsonb, '{}'::jsonb, 'America/Los_Angeles', 1
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `;
  }

  const modulesData = [
    {
      id: "e1000001-0000-0000-0000-000000000001",
      name: "Realtime CDC Engine",
      desc: "Zero-latency Postgres changes streaming via Supabase Realtime Channels.",
      projId: projectsData[0].id,
      leadId: usersToSeed[2].id, // Alex Rivera
      status: "in-progress",
    },
    {
      id: "e1000001-0000-0000-0000-000000000002",
      name: "Design System & Theming Tokens",
      desc: "Ultra-sleek modern CSS variables, glassmorphic cards, squircle radii, and high-contrast typography.",
      projId: projectsData[1].id,
      leadId: usersToSeed[1].id, // Sarah Chen
      status: "in-progress",
    },
    {
      id: "e1000001-0000-0000-0000-000000000003",
      name: "Autonomous AI Copilot",
      desc: "Vector store query engine, tool calling runtime, and contextual chat summaries.",
      projId: projectsData[2].id,
      leadId: usersToSeed[7].id, // James Wilson
      status: "planned",
    },
  ];

  for (let mIdx = 0; mIdx < modulesData.length; mIdx++) {
    const mod = modulesData[mIdx];
    await sql`
      INSERT INTO public.modules (
        id, created_at, updated_at, name, description, status,
        project_id, workspace_id, created_by_id, updated_by_id, lead_id,
        view_props, sort_order, logo_props
      )
      VALUES (
        ${mod.id}, NOW(), NOW(), ${mod.name}, ${mod.desc}, ${mod.status},
        ${mod.projId}, ${workspaceId}, ${primaryUserId}, ${primaryUserId}, ${mod.leadId},
        '{}'::jsonb, ${(mIdx + 1) * 10000}, '{}'::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `;
  }

  // 7. Provision 30+ Detailed Issues with Assignees, Activities, Comments, and Attachments
  console.log("📋 Provisioning 30+ Enterprise Issues, Assignees, and Discussions...");
  const issuesToSeed = [
    {
      title: "Implement Postgres CDC Realtime listener for Workspace Boards",
      desc: "## Architecture Overview\nConnect the client-side MobX stores to Supabase Realtime channels with automatic reconnect, message deduplication, and optimistic rollup.\n\n### Acceptance Criteria\n- Sub-50ms propagation across collaborative browser windows.\n- Graceful fallback to HTTP polling if WebSocket handshake fails.\n- Zero state tearing during rapid drag-and-drop actions.",
      proj: projectsData[0],
      state: "In Progress",
      priority: "urgent",
      assignee: usersToSeed[2], // Alex Rivera
      labels: ["P0 - Blocker", "Performance", "Backend"],
      cycle: cyclesData[0],
      module: modulesData[0],
    },
    {
      title: "Redesign Admin Console and Workspace Shell with modern glassmorphism",
      desc: "## Visual Overhaul\nImplement bespoke theme styling inspired by modern minimal platforms: deep dark hues (#0B0D13), specular 1px borders, smooth squircle buttons, and refined typography hierarchy.\n\n### Checklist\n- [x] Replace generic UI component styling with custom tokens.\n- [x] Integrate high-contrast status chips and badges.\n- [ ] Polish responsive drawer and modal transitions.",
      proj: projectsData[1],
      state: "In Progress",
      priority: "high",
      assignee: usersToSeed[1], // Sarah Chen
      labels: ["P1 - High", "Design Polish", "Frontend"],
      cycle: cyclesData[0],
      module: modulesData[1],
    },
    {
      title: "Enforce strict tenant isolation across all RLS security policies",
      desc: "Perform comprehensive security audit on 0025_instance_admin_privileges.sql and verify that non-superadmin workspace members cannot read cross-tenant metadata.",
      proj: projectsData[0],
      state: "Done",
      priority: "urgent",
      assignee: usersToSeed[3], // Marcus Vance
      labels: ["Security", "P0 - Blocker", "Backend"],
      cycle: cyclesData[1],
      module: modulesData[0],
    },
    {
      title: "Build streaming AI tool-execution pipeline for automated work breakdown",
      desc: "Integrate LLM streaming parser that breaks complex engineering epics into actionable sub-issues with automated label suggestions and dependency trees.",
      proj: projectsData[2],
      state: "In Review",
      priority: "high",
      assignee: usersToSeed[7], // James Wilson
      labels: ["AI / ML", "Frontend", "Backend"],
      cycle: cyclesData[0],
      module: modulesData[2],
    },
    {
      title: "Optimize MobX reaction observers to eliminate redundant render passes",
      desc: "Profiler analysis showed unnecessary reconciliation passes on the Issue Board when filtering by multiple tags. Use computed selectors and shallow array comparisons.",
      proj: projectsData[1],
      state: "Done",
      priority: "medium",
      assignee: usersToSeed[4], // Elena Rostova
      labels: ["Performance", "Frontend"],
      cycle: cyclesData[1],
      module: modulesData[1],
    },
    {
      title: "Implement multi-party threaded chat messaging with emoji reactions",
      desc: "Allow team members to reply in threaded sub-conversations inside channels, add emoji reactions, and paste syntax-highlighted code snippets.",
      proj: projectsData[0],
      state: "In Progress",
      priority: "high",
      assignee: usersToSeed[5], // David Kim
      labels: ["Frontend", "Backend", "P1 - High"],
      cycle: cyclesData[0],
      module: modulesData[0],
    },
    {
      title: "Design and implement full automated end-to-end regression test suite",
      desc: "Create comprehensive Playwright tests simulating multi-user simultaneous editing, board drag-and-drop, and real-time chat notifications.",
      proj: projectsData[0],
      state: "Todo",
      priority: "medium",
      assignee: usersToSeed[9], // Lucas Moreau
      labels: ["Tech Debt", "Backend"],
      cycle: cyclesData[0],
      module: null,
    },
    {
      title: "Developer Documentation & API Reference interactive playground",
      desc: "Write comprehensive developer guides, SDK reference pages, and interactive curl/REST request builders for third-party integrations.",
      proj: projectsData[1],
      state: "Todo",
      priority: "low",
      assignee: usersToSeed[8], // Maya Lin
      labels: ["Frontend", "Design Polish"],
      cycle: cyclesData[0],
      module: modulesData[1],
    },
    {
      title: "Q3 Product Strategy, OKRs, and Enterprise Roadmap review",
      desc: "Finalize executive alignment on the enterprise tiers, self-hosted deployment options, and SLA guarantees for enterprise tier customers.",
      proj: projectsData[1],
      state: "Done",
      priority: "medium",
      assignee: usersToSeed[6], // Priya Sharma
      labels: ["P1 - High"],
      cycle: cyclesData[1],
      module: null,
    },
  ];

  // Generate more issues programmatically to reach 30+ rich issues
  const additionalTopics = [
    {
      title: "Implement Zero-Knowledge Encryption for Workspace AI Secrets",
      prio: "urgent",
      user: usersToSeed[3],
      tag: "Security",
    },
    {
      title: "Add Custom Domain SSL Provisioning & CNAME Verification",
      prio: "high",
      user: usersToSeed[2],
      tag: "Backend",
    },
    {
      title: "Refactor MobX root store initialization for sub-20ms TTI",
      prio: "high",
      user: usersToSeed[4],
      tag: "Performance",
    },
    {
      title: "Build Interactive Gantt Timeline with Drag-to-Resize Milestones",
      prio: "medium",
      user: usersToSeed[1],
      tag: "Frontend",
    },
    {
      title: "Add Support for Multi-File Drag & Drop Upload with Preview Cards",
      prio: "medium",
      user: usersToSeed[5],
      tag: "Frontend",
    },
    {
      title: "Postgres Connection Pooling tuning under high websocket load",
      prio: "high",
      user: usersToSeed[2],
      tag: "Performance",
    },
    {
      title: "Add Biometric WebAuthn / Passkey Authentication Flow",
      prio: "medium",
      user: usersToSeed[3],
      tag: "Security",
    },
    {
      title: "Implement Vector Search Embeddings indexing for Workspace Pages",
      prio: "high",
      user: usersToSeed[7],
      tag: "AI / ML",
    },
    {
      title: "Create Dark/Light theme toggle with zero layout flicker",
      prio: "low",
      user: usersToSeed[1],
      tag: "Design Polish",
    },
    {
      title: "Add Webhook Outbox Delivery Queue with Exponential Backoff Retry",
      prio: "medium",
      user: usersToSeed[5],
      tag: "Backend",
    },
    {
      title: "Audit WCAG 2.1 AA Contrast Ratios across all Status Badges",
      prio: "low",
      user: usersToSeed[1],
      tag: "Design Polish",
    },
    {
      title: "Implement Auto-save Drafts in Rich Text Document Editor",
      prio: "medium",
      user: usersToSeed[4],
      tag: "Frontend",
    },
    {
      title: "Add Global Command Palette (Cmd+K) with Fuzzy Search",
      prio: "high",
      user: usersToSeed[8],
      tag: "Frontend",
    },
    {
      title: "Implement Realtime User Presence & Cursor Broadcasting",
      prio: "high",
      user: usersToSeed[2],
      tag: "Performance",
    },
    {
      title: "Create Enterprise Audit Log Export (JSON / CSV / SIEM)",
      prio: "medium",
      user: usersToSeed[3],
      tag: "Security",
    },
    {
      title: "Integrate GitHub & GitLab Webhook Pull Request linking",
      prio: "medium",
      user: usersToSeed[8],
      tag: "Backend",
    },
    {
      title: "Add Configurable Slack & Discord Realtime Notification Bridges",
      prio: "low",
      user: usersToSeed[5],
      tag: "Backend",
    },
    {
      title: "Implement Automated Database Vacuum & Index Optimization Cron",
      prio: "medium",
      user: usersToSeed[2],
      tag: "Performance",
    },
    {
      title: "Build Team Capacity & Sprint Velocity Burndown Charts",
      prio: "medium",
      user: usersToSeed[6],
      tag: "Frontend",
    },
    {
      title: "Add AI Post-Mortem Generator from Incident Chat Threads",
      prio: "low",
      user: usersToSeed[7],
      tag: "AI / ML",
    },
    {
      title: "Implement Fine-Grained Custom Roles & Permission Builder",
      prio: "high",
      user: usersToSeed[3],
      tag: "Security",
    },
    {
      title: "Stress-Test 10,000 Concurrent WebSocket Connections in K6",
      prio: "high",
      user: usersToSeed[9],
      tag: "Performance",
    },
  ];

  for (const topic of additionalTopics) {
    issuesToSeed.push({
      title: topic.title,
      desc: `Detailed specification for **${topic.title}**.\n\n### Objective\nDeliver robust, high-performance implementation adhering to our architecture guidelines.\n\n### Scope\n- Implementation and unit test coverage.\n- Code review and staging deployment verification.`,
      proj: projectsData[Math.floor(Math.random() * projectsData.length)],
      state: ["Todo", "In Progress", "In Review", "Done"][Math.floor(Math.random() * 4)],
      priority: topic.prio,
      assignee: topic.user,
      labels: [topic.tag, "P1 - High"],
      cycle: cyclesData[0],
      module: modulesData[0],
    });
  }

  let seqNum = 1;
  for (const item of issuesToSeed) {
    const issueId = genDeterministicUUID("issue", `item-${seqNum}`);
    const stateId = statesMap[item.proj.identifier][item.state] || Object.values(statesMap[item.proj.identifier])[0];

    await sql`
      INSERT INTO public.issues (
        id, created_at, updated_at, name, description_json, description_html, description_stripped,
        priority, sequence_id, sort_order, is_draft, project_id, workspace_id,
        state_id, created_by_id, updated_by_id, start_date, target_date
      )
      VALUES (
        ${issueId}, NOW(), NOW(), ${item.title}, '{"ops": []}'::jsonb, ${"<p>" + item.desc.replace(/\n/g, "<br/>") + "</p>"},
        ${item.title}, ${item.priority}, ${seqNum}, ${seqNum * 1000}, false,
        ${item.proj.id}, ${workspaceId}, ${stateId},
        ${primaryUserId}, ${primaryUserId},
        NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        priority = EXCLUDED.priority,
        state_id = EXCLUDED.state_id;
    `;

    // Assignee
    await sql`
      INSERT INTO public.issue_assignees (
        id, created_at, updated_at, issue_id, assignee_id, project_id, workspace_id,
        created_by_id, updated_by_id
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), ${issueId}, ${item.assignee.id}, ${item.proj.id}, ${workspaceId},
        ${primaryUserId}, ${primaryUserId}
      )
      ON CONFLICT DO NOTHING;
    `;

    // Labels
    for (const lbl of item.labels) {
      const lblId = labelMap[lbl];
      if (lblId) {
        await sql`
          INSERT INTO public.issue_labels (
            id, created_at, updated_at, issue_id, label_id, project_id, workspace_id,
            created_by_id, updated_by_id
          )
          VALUES (
            gen_random_uuid(), NOW(), NOW(), ${issueId}, ${lblId}, ${item.proj.id}, ${workspaceId},
            ${primaryUserId}, ${primaryUserId}
          )
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    // Cycle & Module links
    if (item.cycle) {
      await sql`
        INSERT INTO public.cycle_issues (
          id, created_at, updated_at, cycle_id, issue_id, project_id, workspace_id,
          created_by_id, updated_by_id
        )
        VALUES (
          gen_random_uuid(), NOW(), NOW(), ${item.cycle.id}, ${issueId}, ${item.proj.id}, ${workspaceId},
          ${primaryUserId}, ${primaryUserId}
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    if (item.module) {
      await sql`
        INSERT INTO public.module_issues (
          id, created_at, updated_at, module_id, issue_id, project_id, workspace_id,
          created_by_id, updated_by_id
        )
        VALUES (
          gen_random_uuid(), NOW(), NOW(), ${item.module.id}, ${issueId}, ${item.proj.id}, ${workspaceId},
          ${primaryUserId}, ${primaryUserId}
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    // Add realistic issue comment
    if (seqNum % 2 === 0) {
      await sql`
        INSERT INTO public.issue_comments (
          id, created_at, updated_at, comment_stripped, comment_html, comment_json,
          issue_id, project_id, workspace_id, actor_id, created_by_id, updated_by_id,
          attachments, access
        )
        VALUES (
          gen_random_uuid(), NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour',
          'PR is ready for review with 100% test coverage and benchmark results attached.',
          '<p>PR is ready for review with 100% test coverage and benchmark results attached.</p>',
          '{}'::jsonb,
          ${issueId}, ${item.proj.id}, ${workspaceId}, ${item.assignee.id}, ${item.assignee.id}, ${item.assignee.id},
          '{}', 'INTERNAL'
        )
        ON CONFLICT DO NOTHING;
      `;
    }

    seqNum++;
  }

  // 8. Provision Rich Chat Channels & Active Multi-Member Conversations
  console.log("💬 Provisioning 6 Chat Channels & Active Multi-Member Messages...");
  const channelDefs = [
    {
      name: "announcements",
      desc: "Company-wide executive milestones, releases, and key updates",
      isPrivate: false,
      projId: null,
    },
    {
      name: "general",
      desc: "Daily cross-functional standup and workspace conversations",
      isPrivate: false,
      projId: null,
    },
    {
      name: "core-engineering",
      desc: "Systems architecture, distributed runtime, and database sync",
      isPrivate: false,
      projId: projectsData[0].id,
    },
    {
      name: "ui-ux-design",
      desc: "Design system tokens, micro-interactions, and visual critique",
      isPrivate: false,
      projId: projectsData[1].id,
    },
    {
      name: "incidents-prod",
      desc: "Live production monitoring, alerts, and incident resolution",
      isPrivate: false,
      projId: projectsData[0].id,
    },
    {
      name: "ai-lab",
      desc: "Research, autonomous agent tool pipelines, and prompt benchmarks",
      isPrivate: false,
      projId: projectsData[2].id,
    },
  ];

  const channelIds = {};
  for (const ch of channelDefs) {
    const [row] = await sql`
      INSERT INTO public.chat_channels (
        id, created_at, updated_at, name, description, is_private, project_id, workspace_id,
        created_by_id, updated_by_id
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), ${ch.name}, ${ch.desc}, ${ch.isPrivate}, ${ch.projId}, ${workspaceId},
        ${primaryUserId}, ${primaryUserId}
      )
      RETURNING id;
    `;
    channelIds[ch.name] = row.id;
  }

  // Active Multi-User Conversation Scripts
  const conversationScripts = [
    // #announcements
    {
      channel: "announcements",
      messages: [
        {
          user: usersToSeed[0],
          text: "🚀 Keel Enterprise v2.4 is officially live in staging! Massive congratulations to everyone. All 10 members contributed to an incredible release milestone.",
          mins: 240,
          reactions: { "🚀": 9, "🔥": 8, "🎉": 10 },
        },
        {
          user: usersToSeed[6],
          text: "The feedback from our early pilot customers has been phenomenal. Latency drops on board filters and the new sleek theming are huge hits.",
          mins: 200,
          reactions: { "❤️": 6 },
        },
        {
          user: usersToSeed[1],
          text: "Huge shoutout to Elena and David for nailing the sub-frame animations and smooth transitions!",
          mins: 180,
          reactions: { "🙌": 7 },
        },
      ],
    },
    // #general
    {
      channel: "general",
      messages: [
        {
          user: usersToSeed[0],
          text: "Good morning team! Let's do a quick sync on Sprint 24 deliverables.",
          mins: 150,
        },
        {
          user: usersToSeed[1],
          text: "Design system tokens are fully consolidated. We have unified the dark ambient palette `#0B0D13` with 1px specular borders across all modals.",
          mins: 140,
          reactions: { "✨": 5 },
        },
        {
          user: usersToSeed[2],
          text: "CDC WebSocket listener load tests reached 25,000 msg/sec with sub-20ms latency. Zero dropped frames.",
          mins: 130,
          reactions: { "⚡": 6 },
        },
        {
          user: usersToSeed[4],
          text: "MobX observer selectors have been rewritten. Board rendering CPU usage dropped by 42%.",
          mins: 110,
          reactions: { "🚀": 4 },
        },
        {
          user: usersToSeed[5],
          text: "Working on the threaded chat component now. Multi-party replies and reactions are rendering smoothly in test.",
          mins: 90,
        },
        {
          user: usersToSeed[3],
          text: "Security audit on the tenant isolation migration passed all automated fuzzing tests. No data leaks detected.",
          mins: 75,
          reactions: { "🛡️": 5 },
        },
        {
          user: usersToSeed[7],
          text: "AI Copilot tool parser has been upgraded to support streaming function definitions. Ready for review.",
          mins: 50,
        },
        {
          user: usersToSeed[8],
          text: "Updated the API reference documentation with the new webhook retry specifications.",
          mins: 35,
        },
        {
          user: usersToSeed[9],
          text: "Running full end-to-end regression tests across all 3 browsers. Looking 100% green.",
          mins: 20,
          reactions: { "✅": 6 },
        },
        {
          user: usersToSeed[0],
          text: "Incredible velocity everyone. Let's merge the final PRs and prepare for staging deployment.",
          mins: 5,
          reactions: { "🔥": 8 },
        },
      ],
    },
    // #core-engineering
    {
      channel: "core-engineering",
      messages: [
        {
          user: usersToSeed[2],
          text: "Here is the new CDC listener configuration for Postgres replication:\n\n```typescript\nexport const configureRealtime = (workspaceId: string) => {\n  return supabase.channel(`workspace:${workspaceId}`)\n    .on('postgres_changes', { event: '*', schema: 'public' }, handlePayload)\n    .subscribe();\n};\n```",
          mins: 120,
          reactions: { "👍": 4 },
        },
        {
          user: usersToSeed[3],
          text: "Looks clean Alex! Make sure the RLS filter on `workspace_id` is passed as a channel param to avoid receiving unauthenticated tenant payloads.",
          mins: 110,
        },
        {
          user: usersToSeed[2],
          text: "Good catch Marcus. Added the filter parameter and verified against our tenancy test matrix.",
          mins: 95,
        },
        {
          user: usersToSeed[5],
          text: "I will hook this into the shared-state store so the UI updates optimistically before the ack arrives.",
          mins: 80,
        },
      ],
    },
    // #ui-ux-design
    {
      channel: "ui-ux-design",
      messages: [
        {
          user: usersToSeed[1],
          text: "Shared the new modern design tokens in Figma. Check out the micro-border elevation and typography pairing:\n- Headings: Plus Jakarta Sans / Inter Tight\n- Surfaces: Deep obsidian (#0B0D13), glass frosted card overlays\n- Radii: 16px (squircle) and 24px",
          mins: 90,
          reactions: { "🎨": 6 },
        },
        {
          user: usersToSeed[4],
          text: "Loving the new contrast ratios Sarah! I've updated packages/tailwind-config to export these tokens directly.",
          mins: 60,
        },
        {
          user: usersToSeed[1],
          text: "Awesome Elena! Let's ensure the light theme maintains exact 7:1 contrast for accessibility compliance.",
          mins: 45,
        },
      ],
    },
    // #incidents-prod
    {
      channel: "incidents-prod",
      messages: [
        {
          user: usersToSeed[3],
          text: "🟢 All systems operational. P99 API response time: 24ms. Database replication lag: 1.2ms.",
          mins: 60,
          reactions: { "🟢": 5 },
        },
        {
          user: usersToSeed[9],
          text: "Health checks on all 8 worker nodes returning HTTP 200 OK. Error rate is 0.00%.",
          mins: 30,
        },
      ],
    },
    // #ai-lab
    {
      channel: "ai-lab",
      messages: [
        {
          user: usersToSeed[7],
          text: "Benchmarked the new embedding search pipeline. Top-5 relevant docs retrieved in 18ms across 50,000 indexed tokens.",
          mins: 45,
          reactions: { "🧠": 6 },
        },
        {
          user: usersToSeed[0],
          text: "That is blazing fast James! Let's wire this directly into the global Cmd+K palette.",
          mins: 15,
          reactions: { "⚡": 4 },
        },
      ],
    },
  ];

  for (const convo of conversationScripts) {
    const channelId = channelIds[convo.channel];
    if (!channelId) continue;

    for (const m of convo.messages) {
      await sql`
        INSERT INTO public.chat_messages (
          id, channel_id, project_id, workspace_id, message, sender_id, sender_name, sender_avatar,
          created_at, updated_at, attachments, reactions, mentions
        )
        VALUES (
          gen_random_uuid(), ${channelId}, null, ${workspaceId}, ${m.text},
          ${m.user.id}, ${m.user.display_name}, ${m.user.avatar_url},
          NOW() - make_interval(mins => ${m.mins}), NOW() - make_interval(mins => ${m.mins}),
          '[]'::jsonb, ${JSON.stringify(m.reactions || {})}::jsonb, '{}'
        );
      `;
    }
  }

  // Seed Private 1:1 Direct Message Channels & Conversations
  console.log("💬 Provisioning 1:1 Direct Message Channels between Team Members...");
  const directMessagePairs = [
    {
      userA: usersToSeed[0], // Admin
      userB: usersToSeed[1], // Sarah Chen
      messages: [
        {
          sender: usersToSeed[1],
          text: "Hey! I just pushed the updated design tokens for the dark theme. The specular borders on cards look super sharp.",
          mins: 120,
          reactions: { "✨": 1 },
        },
        {
          sender: usersToSeed[0],
          text: "Just reviewed in staging. The contrast and squircle curves feel completely premium Sarah. Excellent work!",
          mins: 105,
          reactions: { "🔥": 1 },
        },
        {
          sender: usersToSeed[1],
          text: "Thanks! I'm now polishing the kanban board column drag states and issue hover cards.",
          mins: 90,
        },
      ],
    },
    {
      userA: usersToSeed[0], // Admin
      userB: usersToSeed[2], // Alex Rivera
      messages: [
        {
          sender: usersToSeed[2],
          text: "Quick heads-up: our CDC listener WebSocket connection pool is benchmarked at 25k msg/sec with zero dropped frames.",
          mins: 80,
          reactions: { "⚡": 1 },
        },
        {
          sender: usersToSeed[0],
          text: "Fantastic Alex. Have we verified failover behavior if a primary Postgres replica drops?",
          mins: 65,
        },
        {
          sender: usersToSeed[2],
          text: "Yes, automatic reconnection happens within 180ms without interrupting active client subscriptions.",
          mins: 50,
          reactions: { "✅": 1 },
        },
      ],
    },
    {
      userA: usersToSeed[0], // Admin
      userB: usersToSeed[4], // Elena Rostova
      messages: [
        {
          sender: usersToSeed[4],
          text: "MobX reactivity optimization is complete. Eliminated redundant re-renders on board state updates.",
          mins: 45,
          reactions: { "🚀": 1 },
        },
        {
          sender: usersToSeed[0],
          text: "Great speedup Elena! Let's deploy to staging alongside the new chat improvements.",
          mins: 30,
        },
      ],
    },
    {
      userA: usersToSeed[0], // Admin
      userB: usersToSeed[7], // James Wilson
      messages: [
        {
          sender: usersToSeed[7],
          text: "The AI Copilot prompt evaluation suite is passing 98.4% across our semantic test cases.",
          mins: 40,
          reactions: { "🧠": 1 },
        },
        {
          sender: usersToSeed[0],
          text: "Love the accuracy improvement James. Let's wire it into the main assistant panel.",
          mins: 20,
        },
      ],
    },
  ];

  for (const dm of directMessagePairs) {
    const dmName = `dm-${[dm.userA.id, dm.userB.id].sort().join("-")}`;
    const [dmRow] = await sql`
      INSERT INTO public.chat_channels (
        id, created_at, updated_at, name, description, is_private, project_id, workspace_id,
        created_by_id, updated_by_id
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), ${dmName}, 'Direct message', true, null, ${workspaceId},
        ${dm.userA.id}, ${dm.userA.id}
      )
      RETURNING id;
    `;

    for (const msg of dm.messages) {
      await sql`
        INSERT INTO public.chat_messages (
          id, channel_id, project_id, workspace_id, message, sender_id, sender_name, sender_avatar,
          created_at, updated_at, attachments, reactions, mentions
        )
        VALUES (
          gen_random_uuid(), ${dmRow.id}, null, ${workspaceId}, ${msg.text},
          ${msg.sender.id}, ${msg.sender.display_name}, ${msg.sender.avatar_url},
          NOW() - make_interval(mins => ${msg.mins}), NOW() - make_interval(mins => ${msg.mins}),
          '[]'::jsonb, ${JSON.stringify(msg.reactions || {})}::jsonb, '{}'
        );
      `;
    }
  }

  // 9. Provision Documentation Pages
  console.log("📄 Provisioning Rich Documentation & Architecture Pages...");
  const pagesData = [
    {
      name: "Keel System Architecture & Operating Principles",
      emoji: "🏛️",
      color: "#3B82F6",
      html: `<h1>Keel System Architecture</h1>
<p>Keel is designed from the ground up as a high-performance, real-time collaboration engine for modern engineering organizations.</p>
<h2>Core Tenets</h2>
<ul>
  <li><strong>Sub-50ms Reactive State:</strong> Zero-lag mutations powered by MobX and Postgres CDC streaming.</li>
  <li><strong>Strict Tenant Isolation:</strong> Every query enforces database-level Row-Level Security policies.</li>
  <li><strong>Refined Aesthetic Standard:</strong> Obsidian dark hues, specular micro-borders, and squircle elevation.</li>
</ul>
<h2>Tech Stack Matrix</h2>
<table>
  <thead>
    <tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td>Frontend</td><td>React, Vite, MobX, TypeScript</td><td>High-frequency reactive UI</td></tr>
    <tr><td>Styling</td><td>Tailwind CSS & Bespoke Design Tokens</td><td>Modern dark/light aesthetics</td></tr>
    <tr><td>Backend</td><td>Supabase Postgres, Node.js</td><td>ACID transactions & CDC streaming</td></tr>
    <tr><td>AI Engine</td><td>Agentic Tool Runtime & Embeddings</td><td>Automated project orchestration</td></tr>
  </tbody>
</table>`,
    },
    {
      name: "Product Design Principles & UI Guidelines",
      emoji: "🎨",
      color: "#8B5CF6",
      html: `<h1>Product Design Guidelines</h1>
<p>Our visual language emphasizes clarity, speed, and craftsmanship.</p>
<h3>1. Typography Hierarchy</h3>
<p>Use high-contrast type scales with tight tracking for headlines to create deliberate authority.</p>
<h3>2. Color & Depth</h3>
<p>Avoid generic pure black/gray. Tint all neutral surfaces with deep obsidian blues (#0B0D13) and frosted glass overlays.</p>
<h3>3. Micro-Interactions</h3>
<p>Every button, card, and modal must feature intentional spring animations and subtle 1px border specular lighting.</p>`,
    },
    {
      name: "Production Incident Response Runbook",
      emoji: "🚨",
      color: "#EF4444",
      html: `<h1>Incident Response Protocol</h1>
<p>This runbook outlines severity classification and escalation paths for Keel production systems.</p>
<h3>Severity Levels</h3>
<ul>
  <li><strong>SEV-0:</strong> Complete platform outage. Instant page to on-call engineer and SRE lead.</li>
  <li><strong>SEV-1:</strong> Degradation of real-time sync or database latency &gt; 250ms.</li>
  <li><strong>SEV-2:</strong> Isolated non-critical service disruption.</li>
</ul>`,
    },
  ];

  for (let pIdx = 0; pIdx < pagesData.length; pIdx++) {
    const p = pagesData[pIdx];
    await sql`
      INSERT INTO public.pages (
        id, created_at, updated_at, name, description_json, description_html, description_stripped,
        access, created_by_id, owned_by_id, updated_by_id, workspace_id, color,
        is_locked, view_props, logo_props, is_global, sort_order
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), ${p.name},
        '{}'::jsonb, ${p.html}, ${p.name},
        0, ${primaryUserId}, ${primaryUserId}, ${primaryUserId}, ${workspaceId}, ${p.color},
        false, '{}'::jsonb, ${JSON.stringify({ emoji: p.emoji })}::jsonb, true, ${(pIdx + 1) * 10000}
      )
      ON CONFLICT DO NOTHING;
    `;
  }

  // 10. Provision Stickies / Dashboard Widgets
  console.log("📌 Provisioning Dashboard Stickies & Widgets...");
  await sql`
    INSERT INTO public.stickies (
      id, created_at, updated_at, name, description, description_html, description_stripped,
      logo_props, color, background_color, created_by_id, owner_id, updated_by_id, workspace_id, sort_order
    )
    VALUES
      (gen_random_uuid(), NOW(), NOW(), 'Sprint 24 Priority Targets', '{"ops": []}'::jsonb, '<p>1. Complete WebSocket CDC real-time sync.<br/>2. Deploy modern UI theming.<br/>3. Verify WCAG AA contrast compliance.</p>', 'Sprint 24 Priority Targets...', '{}'::jsonb, '#3B82F6', '#1E293B', ${primaryUserId}, ${primaryUserId}, ${primaryUserId}, ${workspaceId}, 10000),
      (gen_random_uuid(), NOW(), NOW(), 'Design Critique & Token Review', '{"ops": []}'::jsonb, '<p>Reviewing squircle radii, specular border lighting, and interactive button spring animations on Thursday at 2 PM PST.</p>', 'Design Critique...', '{}'::jsonb, '#8B5CF6', '#2E1065', ${primaryUserId}, ${primaryUserId}, ${primaryUserId}, ${workspaceId}, 20000)
    ON CONFLICT DO NOTHING;
  `;

  console.log(
    "✨ Flagship Enterprise Workspace (Keel HQ) successfully seeded with 10 members, 30+ issues, and multi-user chat!"
  );
  await sql.end();
}

seed().catch((err) => {
  console.error("❌ Seeding failed with error:", err);
  process.exit(1);
});
