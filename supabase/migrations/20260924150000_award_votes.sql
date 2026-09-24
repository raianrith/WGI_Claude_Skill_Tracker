-- Team votes for Skillies awards that aren't decided by upvotes or time math
create table award_votes (
  award_id text not null check (award_id in ('unhinged', 'stolen-idea')),
  skill_id uuid not null references skills(id) on delete cascade,
  voter_id uuid not null references people(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (award_id, voter_id)
);

create index award_votes_skill_id_idx on award_votes (skill_id);

alter table award_votes enable row level security;

-- Hide tallies until wrap party — voters only see their own picks
create policy "read own award votes" on award_votes
  for select
  using (voter_id in (select id from people where auth_user_id = auth.uid()));

create policy "insert own award votes" on award_votes
  for insert
  with check (
    voter_id in (select id from people where auth_user_id = auth.uid())
    and not exists (
      select 1 from skills s
      where s.id = skill_id and s.creator_id = voter_id
    )
    and timezone('America/Chicago', now()) >= timestamp '2026-09-28 08:00:00'
    and timezone('America/Chicago', now()) < timestamp '2026-09-30 12:00:00'
  );

create policy "update own award votes" on award_votes
  for update
  using (voter_id in (select id from people where auth_user_id = auth.uid()))
  with check (
    voter_id in (select id from people where auth_user_id = auth.uid())
    and not exists (
      select 1 from skills s
      where s.id = skill_id and s.creator_id = voter_id
    )
    and timezone('America/Chicago', now()) >= timestamp '2026-09-28 08:00:00'
    and timezone('America/Chicago', now()) < timestamp '2026-09-30 12:00:00'
  );

create policy "delete own award votes" on award_votes
  for delete
  using (
    voter_id in (select id from people where auth_user_id = auth.uid())
    and timezone('America/Chicago', now()) >= timestamp '2026-09-28 08:00:00'
    and timezone('America/Chicago', now()) < timestamp '2026-09-30 12:00:00'
  );
