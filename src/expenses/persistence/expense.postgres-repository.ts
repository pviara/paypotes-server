import { ConfigService } from '@nestjs/config';
import { Expense, Metadata } from '@expenses/domain/expense/expense';
import {
    ExpenseRepository,
    ExpensesByContact,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import {
    PairExpense,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Table } from '@infra/postgres/table';
import { User } from '@users/domain/user';
import { Group } from '@app/groups/domain/group';
import { Nullable } from '@app/shared/nullable';
import { GroupDetailedRecord } from '@app/groups/persistence/group.postgres-repository';
import { GroupRepository } from '@app/groups/persistence/group.repository';
import { Inject } from '@nestjs/common';
import { groupRepositoryToken } from '@app/groups/persistence/group.repository-provider';
import { Member } from '@app/groups/domain/member';

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
        private groupRepository: GroupRepository,

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
            });
        }
        return null;
    }

    getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        throw new Error('Method not implemented.');
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

    getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact> {
        throw new Error('Method not implemented.');
    }

    getAllActorExpenses(actorId: string): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorGroupExpenses(
        actorId: string,
        groupId: string,
    ): Promise<GroupExpense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorGroupsExpenses(
        actorId: string,
        groupIds: Array<string>,
    ): Promise<ExpensesByGroup> {
        throw new Error('Method not implemented.');
    }

    saveGroupExpense(expense: GroupExpense): Promise<void> {
        throw new Error('Method not implemented.');
    }

    savePairExpense(expense: PairExpense): Promise<void> {
        throw new Error('Method not implemented.');
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

    // todo: edit to enable group expense ; remove the nullable thing
    private mapExpenseFrom(record: ExpenseDetailedRecord): Nullable<Expense> {
        const isPairExpense = this.isPairExpense(record);
        return isPairExpense ? this.mapPairExpenseFrom(record) : null;
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

    private isPairExpense(record: ExpenseDetailedRecord): boolean {
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
