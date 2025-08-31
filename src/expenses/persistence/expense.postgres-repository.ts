import { ConfigService } from '@nestjs/config';
import { Expense, Metadata } from '@expenses/domain/expense/expense';
import {
    ExpenseRepository,
    ExpensesByContact,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Inject } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Member } from '@groups/domain/member';
import {
    PairExpense,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Table } from '@infra/postgres/table';
import { User } from '@users/domain/user';

type StakeholderRecord = {
    id: string;
    expense_id: string;
    creditor: boolean;
    share: number;
};

type ExpenseRecord = {
    id: string;
    label: string;
    emoji: string;
    created_at: string;
    balance: number;
    group_id: string;
};

type StakeholderDetailedRecord = {
    id: string;
    firstname: string;
    lastname: string;
    avatar_url: string;
    email: string;
    creditor: boolean;
    share: number;
};

type ExpenseDetailedRecord = ExpenseRecord & {
    stakeholders: Array<StakeholderDetailedRecord>;
};

type GroupExpenseDetailedRecord = ExpenseDetailedRecord & {
    group: Awaited<ReturnType<GroupRepository['getActorGroupById']>>;
};

const MAX_EXPENSES_LIMIT = 20;

export class ExpensePostgresRepository implements ExpenseRepository {
    constructor(
        private configService: ConfigService,

        @Inject(groupRepositoryToken)
        protected groupRepository: GroupRepository,

        @InjectKnex()
        protected knex: Knex,
    ) {}

    async delete(expenseId: string): Promise<void> {
        await this.knex.delete().from(Table.Expenses).where('id', expenseId);
    }

    async getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null> {
        const {
            rows: [expense],
        } = await this.knex.raw(`
            with verified_stakeholders as (
                select
                    expense_id,
                    count(expense_id) as found_stakeholders
                from ${Table.Stakeholders}
                where
                    expense_id = '${expenseId}'
                    and id in (
                        '${actorId}',
                        '${contactId}'
                    )
                group by expense_id
            ), verified_expense as (
                    select *
                    from ${Table.Expenses}
                    where id = '${expenseId}'
            ), actor_stakeholder as (
                select
                    id,
                    share
                from ${Table.Stakeholders}
                where expense_id = '${expenseId}'
            )
            select ve.*
            from verified_stakeholders
            inner join verified_expense ve
                on ve.id = expense_id
            inner join actor_stakeholder ac
                on ac.id = '${actorId}'
            where found_stakeholders = 2
            and share > 0
            and group_id = '${this.configService.getOrThrow('DEFAULT_UUID')}';
        `);

        if (expense) {
            const { rows: stakeholders } = await this.knex.raw(`
                select
                    ${Table.Users}.id,
                    ${Table.Users}.firstname,
                    ${Table.Users}.lastname,
                    ${Table.Users}.avatar_url,
                    ${Table.Stakeholders}.creditor,
                    ${Table.Stakeholders}.share
                from ${Table.Stakeholders}
                inner join ${Table.Users}
                    on ${Table.Users}.id = ${Table.Stakeholders}.id
                where ${Table.Stakeholders}.expense_id = '${expenseId}'
            `);

            return this.mapPairExpenseFrom({
                id: expense.id,
                label: expense.label,
                emoji: expense.emoji,
                created_at: expense.created_at,
                balance: expense.balance,
                group_id: expense.group_id,
                stakeholders,
            });
        }

        return null;
    }

    async getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<PairExpense[]> {
        const { rows: expenses } = await this.knex.raw(`
            with verified_stakeholders as (
                select
                    expense_id,
                    count(expense_id) as found_stakeholders
                from ${Table.Stakeholders}
                where id in (
                    '${actorId}',
                    '${contactId}'
                )
                group by expense_id
                having count(id) = 2
            ), actor_stakeholder as (
                select
                    id,
                    expense_id,
                    share
                from ${Table.Stakeholders}
                where id = '${actorId}'
            )
            select e.*
            from ${Table.Expenses} e
            inner join verified_stakeholders vs
                on e.id = vs.expense_id
            inner join actor_stakeholder ac
                on e.id = ac.expense_id
            where share > 0
            and (${`'${search}'` || null} is null or e.label ilike '%${search}%')
            and group_id = '${this.configService.getOrThrow('DEFAULT_UUID')}'
            order by e.created_at desc
            limit ${MAX_EXPENSES_LIMIT}
            offset ${pageIndex * MAX_EXPENSES_LIMIT};
        `);

        return Promise.all(
            expenses.map(async (expense: ExpenseRecord) => {
                const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${expense.id}'
                `);

                return this.mapPairExpenseFrom({
                    id: expense.id,
                    label: expense.label,
                    emoji: expense.emoji,
                    created_at: expense.created_at,
                    balance: expense.balance,
                    group_id: expense.group_id,
                    stakeholders,
                });
            }),
        );
    }

    async getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        const {
            rows: [expense],
        } = await this.knex.raw(`
            with verified_expense as (
                select *
                from ${Table.Expenses}
                where id = '${expenseId}'
            ), actor_stakeholder as (
                select
                    id,
                    share
                from ${Table.Stakeholders}
                where expense_id = '${expenseId}'
            )
            select ve.*
            from verified_expense ve
            inner join actor_stakeholder ac
                on ac.id = '${actorId}'
            and share > 0;
        `);

        if (expense) {
            const group = await this.groupRepository.getActorGroupById(
                actorId,
                expense.group_id,
            );

            const { rows: stakeholders } = await this.knex.raw(`
                select
                    ${Table.Users}.id,
                    ${Table.Users}.firstname,
                    ${Table.Users}.lastname,
                    ${Table.Users}.avatar_url,
                    ${Table.Stakeholders}.creditor,
                    ${Table.Stakeholders}.share
                from ${Table.Stakeholders}
                inner join ${Table.Users}
                    on ${Table.Users}.id = ${Table.Stakeholders}.id
                where ${Table.Stakeholders}.expense_id = '${expense.id}'
            `);

            return this.mapExpenseFrom({
                id: expense.id,
                label: expense.label,
                emoji: expense.emoji,
                created_at: expense.created_at,
                balance: expense.balance,
                group_id: expense.group_id,
                stakeholders,
                group,
            });
        }
        return null;
    }

    async getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        const { rows: expenses } = await this.knex.raw(`
            with actor_stakeholder as (
                select 
                    id,
                    expense_id,
                    share
                from ${Table.Stakeholders}
                where id = '${actorId}'
            )
            select ${Table.Expenses}.*
            from ${Table.Expenses}
            inner join actor_stakeholder ac
                on ac.expense_id = ${Table.Expenses}.id
            where share > 0
            and (${`'${search}'` || null} is null or ${Table.Expenses}.label ilike '%${search}%')
            order by ${Table.Expenses}.created_at desc
            limit ${MAX_EXPENSES_LIMIT}
            offset ${pageIndex * MAX_EXPENSES_LIMIT};
        `);

        return Promise.all(
            expenses.map(async (expense: ExpenseRecord) => {
                const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${expense.id}'
                `);

                const detailedExpense: ExpenseDetailedRecord = {
                    ...expense,
                    stakeholders,
                };

                if (this.isPairExpense(detailedExpense)) {
                    return this.mapPairExpenseFrom(detailedExpense);
                }

                const group = await this.groupRepository.getActorGroupById(
                    actorId,
                    expense.group_id,
                );

                const detailedGroupExpense: GroupExpenseDetailedRecord = {
                    ...expense,
                    stakeholders,
                    group,
                };

                return this.mapGroupExpenseFrom(detailedGroupExpense);
            }),
        );
    }

    async getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null> {
        const {
            rows: [expense],
        } = await this.knex.raw(`
            with verified_stakeholders as (
                select
                    expense_id,
                    count(expense_id) as found_stakeholders
                from stakeholders
                where expense_id = '${expenseId}'
                group by expense_id
            ), verified_expense as (
                select *
                from expenses
                where id = '${expenseId}'
            ), actor_stakeholder as (
                select
                    id,
                    share
                from stakeholders
                where expense_id = '${expenseId}'
            )
            select ve.*
            from verified_stakeholders
            inner join verified_expense ve
                on ve.id = expense_id
            inner join actor_stakeholder ac
                on ac.id = '${actorId}'
            where found_stakeholders > 2
            and share > 0
            and group_id = '${groupId}';
        `);

        if (expense) {
            const group = await this.groupRepository.getActorGroupById(
                actorId,
                groupId,
            );

            const { rows: stakeholders } = await this.knex.raw(`
                select
                    ${Table.Users}.id,
                    ${Table.Users}.firstname,
                    ${Table.Users}.lastname,
                    ${Table.Users}.avatar_url,
                    ${Table.Stakeholders}.creditor,
                    ${Table.Stakeholders}.share
                from ${Table.Stakeholders}
                inner join ${Table.Users}
                    on ${Table.Users}.id = ${Table.Stakeholders}.id
                where ${Table.Stakeholders}.expense_id = '${expense.id}'
            `);

            return this.mapGroupExpenseFrom({
                ...expense,
                group,
                stakeholders,
            });
        }

        return null;
    }

    async getActorGroupExpenses(
        actorId: string,
        group: Group,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]> {
        const members = group.getMembers();
        const { rows: expenses } = await this.knex.raw(`
            with verified_stakeholders as (
                select expense_id
                from stakeholders
                where id in (${this.mapInStatementFromIdsInMembers(members)})
                group by expense_id
                having count(id) = ${members.length}
            ), actor_stakeholder as (
                select
                    id,
                    expense_id,
                    share
                from stakeholders
                where id = '${actorId}'
            )
            select e.*
            from expenses e
            inner join verified_stakeholders vs
                on e.id = vs.expense_id
            inner join actor_stakeholder ac
                on e.id = ac.expense_id
            where share > 0
            and group_id = '${group.getId()}'
            and (${`'${search}'` || null} is null or e.label ilike '%${search}%')
            order by e.created_at desc
            limit ${MAX_EXPENSES_LIMIT}
            offset ${pageIndex * MAX_EXPENSES_LIMIT};
        `);

        return Promise.all(
            expenses.map(async (expense: ExpenseRecord) => {
                const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${expense.id}'
                `);

                return this.mapGroupExpenseFrom({
                    ...expense,
                    group,
                    stakeholders,
                });
            }),
        );
    }

    async getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]> {
        const { rows: expenses } = await this.knex.raw(`
            with verified_stakeholders as (
                select
                    expense_id,
                    count(expense_id) as found_stakeholders
                from ${Table.Stakeholders}
                where id in (
                    '${actorId}',
                    '${contactId}'
                )
                group by expense_id
                having count(id) = 2
            ), actor_stakeholder as (
                select
                    id,
                    expense_id,
                    share
                from ${Table.Stakeholders}
                where id = '${actorId}'
            )
            select e.*
            from ${Table.Expenses} e
            inner join verified_stakeholders vs
                on e.id = vs.expense_id
            inner join actor_stakeholder ac
                on e.id = ac.expense_id
            where share > 0
            and group_id = '${this.configService.getOrThrow('DEFAULT_UUID')}';
        `);

        return Promise.all(
            expenses.map(async (expense: ExpenseRecord) => {
                const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${expense.id}'
                `);

                return this.mapPairExpenseFrom({
                    id: expense.id,
                    label: expense.label,
                    emoji: expense.emoji,
                    created_at: expense.created_at,
                    balance: expense.balance,
                    group_id: expense.group_id,
                    stakeholders,
                });
            }),
        );
    }

    async getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact> {
        const { rows: records } = await this.knex.raw(`
            with shared_expense_ids as (
                select
                    expense_id,
                    array_remove(array_agg(id), '${actorId}') AS counterparty_ids
                from
                    public.stakeholders
                where
                    id = '${actorId}'
                    or id = any (array[${this.mapInStatementFromIds(contactIds)}]::uuid[]) 
                group by
                    expense_id
                having
                    count(*) filter (where id = '${actorId}' ) > 0
                    and count(*) filter (where id = any (array[${this.mapInStatementFromIds(contactIds)}]::uuid[])) > 0
                )
                select
                    e.*, s.counterparty_ids
                from
                public.expenses e
                inner join 
                    shared_expense_ids s on e.id = s.expense_id
                where group_id = '${this.configService.getOrThrow('DEFAULT_UUID')}';
        `);

        const expenses: ExpensesByContact = {};
        for (const contactId of contactIds) expenses[contactId] = []; // todo -> add an e2e test for this one: all contacts should be returned even if no expense for contact

        console.log(records);
        for (const record of records) {
            const [counterparty_id] = record.counterparty_ids;
            const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${record.id}'
                `);

            const pairExpense = this.mapPairExpenseFrom({
                ...record,
                stakeholders,
            });

            if (expenses[counterparty_id]) {
                expenses[counterparty_id].push(pairExpense);
            } else {
                expenses[counterparty_id] = [pairExpense];
            }
        }

        return expenses;
    }

    async getAllActorExpenses(actorId: string): Promise<Expense[]> {
        const { rows: expenses } = await this.knex.raw(`
            with actor_stakeholder as (
                select 
                    id,
                    expense_id,
                    share
                from ${Table.Stakeholders}
                where id = '${actorId}'
            )
            select ${Table.Expenses}.*
            from ${Table.Expenses}
            inner join actor_stakeholder ac
                on ac.expense_id = ${Table.Expenses}.id
            where share > 0;
        `);

        return Promise.all(
            expenses.map(async (expense: ExpenseRecord) => {
                const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${expense.id}'
                `);

                const detailedExpense: ExpenseDetailedRecord = {
                    ...expense,
                    stakeholders,
                };

                if (this.isPairExpense(detailedExpense)) {
                    return this.mapPairExpenseFrom(detailedExpense);
                }

                const group = await this.groupRepository.getActorGroupById(
                    actorId,
                    expense.group_id,
                );

                const detailedGroupExpense: GroupExpenseDetailedRecord = {
                    ...expense,
                    stakeholders,
                    group,
                };

                return this.mapGroupExpenseFrom(detailedGroupExpense);
            }),
        );
    }

    async getAllActorGroupExpenses(
        actorId: string,
        group: Group,
    ): Promise<GroupExpense[]> {
        const members = group.getMembers();
        const { rows: expenses } = await this.knex.raw(`
            with verified_stakeholders as (
                select expense_id
                from stakeholders
                where id in (${this.mapInStatementFromIdsInMembers(members)})
                group by expense_id
                having count(id) = ${members.length}
            ), actor_stakeholder as (
                select
                    id,
                    expense_id,
                    share
                from stakeholders
                where id = '${actorId}'
            )
            select e.*
            from expenses e
            inner join verified_stakeholders vs
                on e.id = vs.expense_id
            inner join actor_stakeholder ac
                on e.id = ac.expense_id
            where share > 0
            and group_id = '${group.getId()}';
        `);

        return Promise.all(
            expenses.map(async (expense: ExpenseRecord) => {
                const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${expense.id}'
                `);

                return this.mapGroupExpenseFrom({
                    ...expense,
                    group,
                    stakeholders,
                });
            }),
        );
    }

    async getAllActorGroupsExpenses(
        actorId: string,
        groups: Array<Group>,
    ): Promise<ExpensesByGroup> {
        const groupIds = groups.flatMap((group) => group.getId());
        const { rows: records } = await this.knex.raw(`
            with actor_expenses as (
                select
                    expense_id
                from
                    public.stakeholders
                where
                    id = '${actorId}'
                )
                select
                    e.*
                from
                    public.expenses e
                inner join
                    actor_expenses ae on e.id = ae.expense_id
                where
                    e.group_id = any (array[${this.mapInStatementFromIds(groupIds)}]::uuid[]); 
        `);

        const expenses: ExpensesByGroup = {};
        for (const groupId of groupIds) expenses[groupId] = []; // todo -> add an e2e test for this one: all contacts should be returned even if no expense for contact

        for (const record of records) {
            const { rows: stakeholders } = await this.knex.raw(`
                    select
                        ${Table.Users}.id,
                        ${Table.Users}.firstname,
                        ${Table.Users}.lastname,
                        ${Table.Users}.avatar_url,
                        ${Table.Stakeholders}.creditor,
                        ${Table.Stakeholders}.share
                    from ${Table.Stakeholders}
                    inner join ${Table.Users}
                        on ${Table.Users}.id = ${Table.Stakeholders}.id
                    where ${Table.Stakeholders}.expense_id = '${record.id}'
                `);

            const { group_id } = record;
            const group = await this.groupRepository.getActorGroupById(
                actorId,
                group_id,
            );

            const groupExpense = this.mapGroupExpenseFrom({
                ...record,
                group,
                stakeholders,
            });

            if (expenses[group_id]) {
                expenses[group_id].push(groupExpense);
            } else {
                expenses[group_id] = [groupExpense];
            }
        }

        return expenses;
    }

    async saveGroupExpense(expense: GroupExpense): Promise<void> {
        await this.knex
            .insert({
                id: expense.getId(),
                label: expense.getLabel(),
                emoji: expense.getEmoji(),
                balance: expense.getRawBalance(),
                created_at: expense.getCreatedAt(),
                group_id: expense.getGroup().getId(),
            })
            .into(Table.Expenses)
            .onConflict('id')
            .ignore();

        for (const stakeholder of expense.getStakeholders()) {
            await this.knex
                .insert({
                    id: stakeholder.getId(),
                    expense_id: expense.getId(),
                    share: stakeholder.getShare(),
                    creditor: expense.hasCreditor(stakeholder.getId()),
                })
                .into(Table.Stakeholders)
                .onConflict(['id', 'expense_id'])
                .ignore();
        }
    }

    async savePairExpense(expense: PairExpense): Promise<void> {
        await this.knex
            .insert({
                id: expense.getId(),
                label: expense.getLabel(),
                emoji: expense.getEmoji(),
                balance: expense.getRawBalance(),
                created_at: expense.getCreatedAt(),
                group_id: this.configService.getOrThrow('DEFAULT_UUID'),
            })
            .into(Table.Expenses)
            .onConflict('id')
            .ignore();

        for (const stakeholder of expense.getStakeholders()) {
            await this.knex
                .insert({
                    id: stakeholder.getId(),
                    expense_id: expense.getId(),
                    share: stakeholder.getShare(),
                    creditor: expense.hasCreditor(stakeholder.getId()),
                })
                .into(Table.Stakeholders)
                .onConflict(['id', 'expense_id'])
                .ignore();
        }
    }

    async updateGroupExpense(expense: GroupExpense): Promise<void> {
        for (const stakeholder of expense.getStakeholders()) {
            await this.knex(Table.Stakeholders)
                .update({ share: stakeholder.getShare() })
                .where('expense_id', expense.getId())
                .andWhere('id', stakeholder.getId());
        }
    }

    async updatePairExpense(expense: PairExpense): Promise<void> {
        for (const stakeholder of expense.getStakeholders()) {
            await this.knex(Table.Stakeholders)
                .update({ share: stakeholder.getShare() })
                .where('expense_id', expense.getId())
                .andWhere('id', stakeholder.getId());
        }
    }

    protected mapStakeholderRecordFrom(
        stakeholder: Stakeholder,
        expense: Expense,
    ): StakeholderRecord {
        return {
            id: stakeholder.getId(),
            expense_id: expense.getId(),
            creditor: expense.hasCreditor(stakeholder.getId()),
            share: stakeholder.getShare(),
        };
    }

    private mapInStatementFromIds(ids: Array<string>): string {
        return ids
            .map((id, index) => `'${id}'${index < ids.length - 1 ? ',' : ''}`)
            .join('');
    }

    private mapInStatementFromIdsInMembers(members: Array<Member>): string {
        return members
            .map(
                (member, index) =>
                    `'${member.getId()}'${index < members.length - 1 ? ',' : ''}`,
            )
            .join('');
    }

    protected mapExpenseFrom(
        record: ExpenseDetailedRecord | GroupExpenseDetailedRecord,
    ): Expense {
        const isPairExpense = this.isPairExpense(record);
        return isPairExpense
            ? this.mapPairExpenseFrom(record)
            : this.mapGroupExpenseFrom(record);
    }

    private mapGroupExpenseFrom(
        record: GroupExpenseDetailedRecord,
    ): GroupExpense {
        if (!record.group)
            throw new Error(
                'No group was found and thus expense cannot be mapped',
            );

        const metadata = this.extractMetadataFrom(record);
        const payment = this.extractGroupPaymentFrom(record);
        const stakeholders = this.mapStakeholdersFrom(record);
        return GroupExpense.fromState(
            metadata,
            record.group,
            payment,
            stakeholders,
        );
    }

    private mapPairExpenseFrom(record: ExpenseDetailedRecord): PairExpense {
        const metadata = this.extractMetadataFrom(record);
        const payment = this.extractPairPaymentFrom(record);
        const stakeholders = this.mapStakeholdersFrom(record);
        return PairExpense.fromState(metadata, payment, stakeholders);
    }

    private extractGroupPaymentFrom(
        record: ExpenseDetailedRecord,
    ): GroupPayment {
        const { creditor } = this.extractCreditorAndDebtorsFrom(record);
        return {
            balance: record.balance,
            creditor: this.mapMemberFrom(creditor),
        };
    }

    private extractPairPaymentFrom(record: ExpenseDetailedRecord): PairPayment {
        const { creditor, debtors } =
            this.extractCreditorAndDebtorsFrom(record);
        return {
            balance: record.balance,
            creditor: this.mapUserFrom(creditor),
            debtor: this.mapUserFrom(debtors[0]),
        };
    }

    private mapStakeholdersFrom({
        stakeholders,
    }: ExpenseDetailedRecord): Array<Stakeholder> {
        return stakeholders.map(
            (stakeholder) =>
                new Stakeholder({
                    id: stakeholder.id,
                    firstname: stakeholder.firstname,
                    lastname: stakeholder.lastname,
                    avatarUrl: stakeholder.avatar_url,
                    share: stakeholder.share,
                }),
        );
    }

    private mapUserFrom(creditor: StakeholderDetailedRecord): User {
        return new User({
            id: creditor.id,
            firstname: creditor.firstname,
            lastname: creditor.lastname,
            avatarUrl: creditor.avatar_url,
            email: creditor.email,
        });
    }

    private mapMemberFrom(creditor: StakeholderDetailedRecord): Member {
        return new Member({
            id: creditor.id,
            firstname: creditor.firstname,
            lastname: creditor.lastname,
            avatarUrl: creditor.avatar_url,
        });
    }

    private extractCreditorAndDebtorsFrom(record: ExpenseDetailedRecord): {
        creditor: StakeholderDetailedRecord;
        debtors: Array<StakeholderDetailedRecord>;
    } {
        const creditor = this.getCreditorFrom(record);
        const debtors = this.getDebtorsFrom(record, creditor);
        return { creditor, debtors };
    }

    private getCreditorFrom(
        record: ExpenseDetailedRecord,
    ): StakeholderDetailedRecord {
        const creditor = record.stakeholders.find(
            (stakeholder) => stakeholder.creditor,
        );
        if (creditor) return creditor;
        throw new Error(`No creditor was found in record ${record.id}`);
    }

    private getDebtorsFrom(
        record: ExpenseDetailedRecord,
        creditor: StakeholderDetailedRecord,
    ): Array<StakeholderDetailedRecord> {
        return record.stakeholders.filter(
            (stakeholder) => stakeholder.id !== creditor.id,
        );
    }

    private isPairExpense(
        record: ExpenseDetailedRecord | GroupExpenseDetailedRecord,
    ): record is ExpenseDetailedRecord {
        return (
            record.group_id === this.configService.getOrThrow('DEFAULT_UUID')
        );
    }

    private extractMetadataFrom(record: ExpenseRecord): Metadata {
        return {
            id: record.id,
            label: record.label,
            emoji: record.emoji,
            createdAt: new Date(record.created_at),
        };
    }

    protected mapGroupExpenseRecordFrom(expense: GroupExpense): ExpenseRecord {
        return {
            id: expense.getId(),
            label: expense.getLabel(),
            emoji: expense.getEmoji(),
            created_at: expense.getCreatedAt(),
            balance: expense.getRawBalance(),
            group_id: expense.getGroup().getId(),
        };
    }

    protected mapPairExpenseRecordFrom(expense: PairExpense): ExpenseRecord {
        return {
            id: expense.getId(),
            label: expense.getLabel(),
            emoji: expense.getEmoji(),
            created_at: expense.getCreatedAt(),
            balance: expense.getRawBalance(),
            group_id: this.configService.getOrThrow('DEFAULT_UUID'),
        };
    }
}
