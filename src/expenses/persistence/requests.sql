with verified_stakeholders as (
    select
        id as stakeholder_id,
        creditor as stakeholder_creditor,
        expense_id
    from stakeholders
    where id in (
        '490a110d-3aa5-48e2-a162-0c156f40af3d',
        '45f7214f-5ebf-4e08-85ec-489fe9426b42'
    )
)
select
    ex.*,
    vs.stakeholder_id,
    vs.stakeholder_creditor
from expenses ex
inner join verified_stakeholders vs
    on vs.expense_id = ex.id
where
    vs.stakeholder_id != 'b714106e-7691-49f9-94c9-86eaea845642' -- actorId
    and case when ex.group_id != '46cd3732-f36e-4886-a2f8-1efebcda1ad6' --default groupId
        then vs.stakeholder_creditor = true
        else true 
    end;
    
------------------------------------------------------------------------------------

with verified_stakeholders as (
    select
        id as stakeholder_id,
        creditor as stakeholder_creditor,
        expense_id
    from stakeholders
    where id in (
        '490a110d-3aa5-48e2-a162-0c156f40af3d',
        '45f7214f-5ebf-4e08-85ec-489fe9426b42'
    )
),
verified_actor as (
    select
        id as actor_id,
        creditor as actor_creditor,
        expense_id
    from stakeholders
    where id = 'b714106e-7691-49f9-94c9-86eaea845642'
)
select
    ex.*,
    vs.stakeholder_id,
    vs.stakeholder_creditor
from expenses ex
inner join verified_stakeholders vs
    on vs.expense_id = ex.id
inner join verified_actor va
    on va.expense_id = ex.id
where
    vs.stakeholder_id != 'b714106e-7691-49f9-94c9-86eaea845642' -- actorId
    and case when ex.group_id != '46cd3732-f36e-4886-a2f8-1efebcda1ad6' --default groupId
        then vs.stakeholder_creditor = true or va.actor_creditor = true
        else true 
    end;