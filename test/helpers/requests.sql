insert into users values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', 'Pierre', 'Viara', '');
insert into users values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', 'David', 'Gomez', '');
insert into users values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', 'Henry', 'Ford', '');

insert into expenses values ('7e114cf3-5ba3-493e-b56f-4ab701852bc0', 'Cinéma', '🎬', date('2025-12-28 12:03:29'), 2800, '8d86c809-e464-485d-81f0-b40600b12757');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', true, 1200, '7e114cf3-5ba3-493e-b56f-4ab701852bc0');
insert into stakeholders values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', false, 1200, '7e114cf3-5ba3-493e-b56f-4ab701852bc0');

insert into expenses values ('42ea96e9-8e84-4966-8c62-be2084ad6691', 'McDo', '🍔', date('2025-11-19 13:42:01'), 1400, '8d86c809-e464-485d-81f0-b40600b12757');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', true, 700, '42ea96e9-8e84-4966-8c62-be2084ad6691');
insert into stakeholders values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', false, 700, '42ea96e9-8e84-4966-8c62-be2084ad6691');