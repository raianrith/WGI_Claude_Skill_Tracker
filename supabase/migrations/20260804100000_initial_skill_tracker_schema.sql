-- Initial Skill Tracker schema
create extension if not exists "pgcrypto";

create table people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  auth_user_id uuid unique,
  avatar_url text,
  created_at timestamptz default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references people(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('client work', 'internal ops', 'personal')),
  time_saved text,
  fun_fact text,
  shipped_at timestamptz default now(),
  created_at timestamptz default now()
);

create table skill_collaborators (
  skill_id uuid references skills(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  primary key (skill_id, person_id)
);

create table skill_upvotes (
  skill_id uuid references skills(id) on delete cascade,
  voter_id uuid references people(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (skill_id, voter_id)
);

alter table people enable row level security;
alter table skills enable row level security;
alter table skill_collaborators enable row level security;
alter table skill_upvotes enable row level security;

create policy "read all people" on people for select using (auth.role() = 'authenticated');
create policy "read all skills" on skills for select using (auth.role() = 'authenticated');
create policy "read all collaborators" on skill_collaborators for select using (auth.role() = 'authenticated');
create policy "read all upvotes" on skill_upvotes for select using (auth.role() = 'authenticated');

create policy "link own auth id" on people for update
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "insert own skill" on skills for insert
  with check (creator_id in (select id from people where auth_user_id = auth.uid()));

create policy "insert own upvote" on skill_upvotes for insert
  with check (voter_id in (select id from people where auth_user_id = auth.uid()));

create policy "insert own collaborator tags" on skill_collaborators for insert
  with check (exists (
    select 1 from skills s join people p on p.id = s.creator_id
    where s.id = skill_id and p.auth_user_id = auth.uid()
  ));

alter publication supabase_realtime add table skills;
alter publication supabase_realtime add table skill_upvotes;
