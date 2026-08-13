-- Separate the ORGANISATION from the WARD.
--
-- Until now a workspace was both at once: `name` held "Oak Hills Ward" and the
-- fact that it is the Elders Quorum's workspace was implicit. That conflation
-- was harmless while one organisation existed and becomes wrong the moment a
-- second one does.
--
-- Raised by the owner 2026-08-13 after a stake presidency meeting: if Relief
-- Society, Primary and Young Men also use wardOS, commitments will need to move
-- between organisations and the bishopric will need to follow them. None of
-- that is buildable while "the ward" and "the quorum" are the same row.
--
-- This migration does the smallest honest part of that: it names the
-- organisation. It deliberately does NOT introduce a wards table or reparent
-- anything -- see docs/plans for that discussion. Adding the column now means
-- the label in the sidebar is telling the truth rather than guessing.
--
-- First migration applied on top of a live database, so it is additive and
-- nullable. 202607060001 must never be edited again.

alter table workspaces
  add column if not exists organization text;

comment on column workspaces.organization is
  'The ward organisation this workspace belongs to (Elders Quorum, Relief Society, ...). Null means the workspace has not been attributed to one. The ward itself is `name`.';
