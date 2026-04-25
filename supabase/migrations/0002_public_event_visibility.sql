drop policy if exists "public_events_read" on events;

create policy "public_events_read" on events for select using (
  status in ('open', 'ongoing', 'judging', 'closed')
  or organiser_id = auth.uid()
);
