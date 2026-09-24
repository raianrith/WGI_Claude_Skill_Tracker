-- Allow category award ballots (Client Crush, Personal Fave, Ops Hero)
alter table award_votes drop constraint if exists award_votes_award_id_check;

alter table award_votes add constraint award_votes_award_id_check
  check (award_id in (
    'unhinged',
    'stolen-idea',
    'client-crush',
    'personal-fave',
    'ops-hero'
  ));

drop policy if exists "insert own award votes" on award_votes;
drop policy if exists "update own award votes" on award_votes;

create policy "insert own award votes" on award_votes
  for insert
  with check (
    voter_id in (select id from people where auth_user_id = auth.uid())
    and not exists (
      select 1 from skills s
      where s.id = skill_id and s.creator_id = voter_id
    )
    and (
      (award_id in ('unhinged', 'stolen-idea')
        and exists (select 1 from skills s where s.id = skill_id))
      or (award_id = 'client-crush'
        and exists (select 1 from skills s where s.id = skill_id and s.category = 'client work'))
      or (award_id = 'personal-fave'
        and exists (select 1 from skills s where s.id = skill_id and s.category = 'personal'))
      or (award_id = 'ops-hero'
        and exists (select 1 from skills s where s.id = skill_id and s.category = 'internal ops'))
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
    and (
      (award_id in ('unhinged', 'stolen-idea')
        and exists (select 1 from skills s where s.id = skill_id))
      or (award_id = 'client-crush'
        and exists (select 1 from skills s where s.id = skill_id and s.category = 'client work'))
      or (award_id = 'personal-fave'
        and exists (select 1 from skills s where s.id = skill_id and s.category = 'personal'))
      or (award_id = 'ops-hero'
        and exists (select 1 from skills s where s.id = skill_id and s.category = 'internal ops'))
    )
    and timezone('America/Chicago', now()) >= timestamp '2026-09-28 08:00:00'
    and timezone('America/Chicago', now()) < timestamp '2026-09-30 12:00:00'
  );
