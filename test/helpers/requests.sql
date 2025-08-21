insert into users values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', 'Pierre', 'Viara', '');
insert into users values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', 'David', 'Gomez', '');
insert into users values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', 'Henry', 'Ford', '');

insert into groups values ('042f26d9-36a6-4594-8bd2-48270fe8d40b', 'Bretagne', '🌊', date('2025-12-28 12:03:29'));
insert into members values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', '042f26d9-36a6-4594-8bd2-48270fe8d40b');
insert into members values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', '042f26d9-36a6-4594-8bd2-48270fe8d40b');
insert into members values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', '042f26d9-36a6-4594-8bd2-48270fe8d40b');

insert into expenses values ('7e114cf3-5ba3-493e-b56f-4ab701852bc0', 'Cinéma', '🎬', date('2025-12-28 12:03:29'), 2800, '46cd3732-f36e-4886-a2f8-1efebcda1ad6');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', '7e114cf3-5ba3-493e-b56f-4ab701852bc0', true, 1200);
insert into stakeholders values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', '7e114cf3-5ba3-493e-b56f-4ab701852bc0', false, 1200);

insert into expenses values ('42ea96e9-8e84-4966-8c62-be2084ad6691', 'McDo', '🍔', date('2025-11-19 13:42:01'), 1400, '46cd3732-f36e-4886-a2f8-1efebcda1ad6');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', '42ea96e9-8e84-4966-8c62-be2084ad6691', true, 700);
insert into stakeholders values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', '42ea96e9-8e84-4966-8c62-be2084ad6691', false, 700);

-- raw select statements to do...
-- récupérer tous les membres d'un groupe dont l'id est celui donné et dont il existe un des membres qui a l'id de l'acteur donné
with actor_in_group as (
    select 1
    from members
    where group_id = '042f26d9-36a6-4594-8bd2-48270fe8d40b'
    and id = 'ecd0c12a-9f59-4703-9280-8bc1082986b0'
)

select 