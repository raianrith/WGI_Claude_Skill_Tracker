-- Allow creators to edit their own skills and refresh collaborator tags
create policy "update own skill" on skills for update
  using (creator_id in (select id from people where auth_user_id = auth.uid()))
  with check (creator_id in (select id from people where auth_user_id = auth.uid()));

create policy "delete own collaborator tags" on skill_collaborators for delete
  using (exists (
    select 1 from skills s
    join people p on p.id = s.creator_id
    where s.id = skill_id and p.auth_user_id = auth.uid()
  ));
