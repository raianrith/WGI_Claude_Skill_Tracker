-- Optional link to the skill output (Claude Project, doc, Drive, etc.)
alter table skills add column if not exists output_url text;
