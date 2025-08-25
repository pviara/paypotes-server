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

-- pair expenses
insert into expenses values ('7e114cf3-5ba3-493e-b56f-4ab701852bc0', 'Popcorn', '🍿', date('2025-12-28 12:03:29'), 600, '46cd3732-f36e-4886-a2f8-1efebcda1ad6');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', '7e114cf3-5ba3-493e-b56f-4ab701852bc0', true, 300);
insert into stakeholders values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', '7e114cf3-5ba3-493e-b56f-4ab701852bc0', false, 300);

insert into expenses values ('42ea96e9-8e84-4966-8c62-be2084ad6691', 'McDo', '🍔', date('2025-11-19 13:42:01'), 1400, '46cd3732-f36e-4886-a2f8-1efebcda1ad6');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', '42ea96e9-8e84-4966-8c62-be2084ad6691', true, 700);
insert into stakeholders values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', '42ea96e9-8e84-4966-8c62-be2084ad6691', false, 700);

-- group expense
insert into expenses values ('e1089b37-e4ba-44c9-8ccd-a7dd6fac850e', 'Essence', '⛽', date('2025-11-19 13:42:01'), 7500, '042f26d9-36a6-4594-8bd2-48270fe8d40b');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', 'e1089b37-e4ba-44c9-8ccd-a7dd6fac850e', true, 2500);
insert into stakeholders values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', 'e1089b37-e4ba-44c9-8ccd-a7dd6fac850e', false, 2500);
insert into stakeholders values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', 'e1089b37-e4ba-44c9-8ccd-a7dd6fac850e', false, 2500);

insert into expenses values ('d8eb763a-8a9c-4e27-b3a4-4b9190455d4f', 'Péage', '🛂', date('2025-11-19 13:42:01'), 4200, '042f26d9-36a6-4594-8bd2-48270fe8d40b');
insert into stakeholders values ('ecd0c12a-9f59-4703-9280-8bc1082986b0', 'd8eb763a-8a9c-4e27-b3a4-4b9190455d4f', false, 1400);
insert into stakeholders values ('62fb2fe0-ba63-412a-a0fc-b0ac3239efcd', 'd8eb763a-8a9c-4e27-b3a4-4b9190455d4f', true, 1400);
insert into stakeholders values ('856b40a4-00d6-43be-864f-4c6a6d4bc069', 'd8eb763a-8a9c-4e27-b3a4-4b9190455d4f', false, 1400);

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
-- getActorExpenseById
with verified_expense as (
    select *
    from expenses
    where id = '7e114cf3-5ba3-493e-b56f-4ab701852bc0'
), actor_stakeholder as (
    select
        id,
        share
    from stakeholders
    where expense_id = '7e114cf3-5ba3-493e-b56f-4ab701852bc0'
)
select ve.*
from verified_expense ve
inner join actor_stakeholder ac
    on ac.id = 'ecd0c12a-9f59-4703-9280-8bc1082986b0'
and share > 0
and group_id = '46cd3732-f36e-4886-a2f8-1efebcda1ad6';

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
-- getActorContactExpenseById
with verified_stakeholders as (
    select
        expense_id,
        count(expense_id) as found_stakeholders
    from stakeholders
    where
        expense_id = '7e114cf3-5ba3-493e-b56f-4ab701852bc0'
        and id in (
            'ecd0c12a-9f59-4703-9280-8bc1082986b0',
            '62fb2fe0-ba63-412a-a0fc-b0ac3239efcd'
        )
    group by expense_id
), verified_expense as (
    select *
    from expenses
    where id = '7e114cf3-5ba3-493e-b56f-4ab701852bc0'
), actor_stakeholder as (
    select
        id,
        share
    from stakeholders
    where expense_id = '7e114cf3-5ba3-493e-b56f-4ab701852bc0'
)
select ve.*
from verified_stakeholders
inner join verified_expense ve
    on ve.id = expense_id
inner join actor_stakeholder ac
    on ac.id = 'ecd0c12a-9f59-4703-9280-8bc1082986b0'
where found_stakeholders = 2
and share > 0
and group_id = '46cd3732-f36e-4886-a2f8-1efebcda1ad6';

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
-- getActorContactExpenses
with verified_stakeholders as (
    select
        expense_id,
        count(expense_id) as found_stakeholders
    from stakeholders
    where id in (
        'ecd0c12a-9f59-4703-9280-8bc1082986b0',
        '62fb2fe0-ba63-412a-a0fc-b0ac3239efcd'
    )
    group by expense_id
    having count(id) = 2
), actor_stakeholder as (
    select
        id,
        expense_id,
        share
    from stakeholders
    where id = 'ecd0c12a-9f59-4703-9280-8bc1082986b0'
)
select e.*
from expenses e
inner join verified_stakeholders vs
    on e.id = vs.expense_id
inner join actor_stakeholder ac
    on e.id = ac.expense_id
where share > 0
and group_id = '46cd3732-f36e-4886-a2f8-1efebcda1ad6';

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
-- getActorGroupExpenseById
with verified_stakeholders as (
    select
        expense_id,
        count(expense_id) as found_stakeholders
    from stakeholders
    where expense_id = 'e1089b37-e4ba-44c9-8ccd-a7dd6fac850e'
    group by expense_id
), verified_expense as (
    select *
    from expenses
    where id = 'e1089b37-e4ba-44c9-8ccd-a7dd6fac850e'
), actor_stakeholder as (
    select
        id,
        share
    from stakeholders
    where expense_id = '7e114cf3-5ba3-493e-b56f-4ab701852bc0'
)
select ve.*
from verified_stakeholders
inner join verified_expense ve
    on ve.id = expense_id
inner join actor_stakeholder ac
    on ac.id = 'ecd0c12a-9f59-4703-9280-8bc1082986b0'
where found_stakeholders > 2
and share > 0
and group_id = '042f26d9-36a6-4594-8bd2-48270fe8d40b';

----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------
-- getActorGroupExpenses
with verified_stakeholders as (
    select expense_id
    from stakeholders
    where id in (
        'ecd0c12a-9f59-4703-9280-8bc1082986b0',
        '62fb2fe0-ba63-412a-a0fc-b0ac3239efcd',
        '856b40a4-00d6-43be-864f-4c6a6d4bc069'
    )
    group by expense_id
    having count(id) = 3
), actor_stakeholder as (
    select
        id,
        expense_id,
        share
    from stakeholders
    where id = 'ecd0c12a-9f59-4703-9280-8bc1082986b0'
)
select e.*
from expenses e
inner join verified_stakeholders vs
    on e.id = vs.expense_id
inner join actor_stakeholder ac
    on e.id = ac.expense_id
where share > 0
and group_id = '042f26d9-36a6-4594-8bd2-48270fe8d40b';