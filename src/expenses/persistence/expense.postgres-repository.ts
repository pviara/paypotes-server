import { ConfigService } from '@nestjs/config';
import { Expense, Metadata } from '@expenses/domain/expense/expense';
import {
    ExpenseRepository,
    ExpensesByContact,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { Table } from '@infra/postgres/table';

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
    creditor: boolean;
};

type ExpenseDetailedRecord = ExpenseRecord & {
    stakeholders: Array<StakeholderDetailedRecord>;
};

export class ExpensePostgresRepository implements ExpenseRepository {
    constructor(
        private configService: ConfigService,
        @InjectKnex() protected knex: Knex,
    ) {}

    async delete(expenseId: string): Promise<void> {
        await this.knex.delete().from(Table.Expenses).where('id', expenseId);
    }

    getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null> {
        throw new Error('Method not implemented.');
    }

    getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<PairExpense[]> {
        throw new Error('Method not implemented.');
    }

    async getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        const expense = await this.knex
            .select(`${Table.Expenses}.*`)
            .from(Table.Expenses)
            .innerJoin(
                Table.Stakeholders,
                `${Table.Expenses}.id`,
                `${Table.Stakeholders}.expense_id`,
            )
            .where(`${Table.Expenses}.id`, expenseId)
            .andWhere(`${Table.Stakeholders}.id`, actorId)
            .first();

        if (expense) {
            const stakeholders = await this.knex
                .select(`${Table.Users}.*, ${Table.Stakeholders}.creditor`)
                .from(Table.Stakeholders)
                .innerJoin(
                    Table.Users,
                    `${Table.Users}.id`,
                    `${Table.Stakeholders}.id`,
                )
                .where(`${Table.Stakeholders}.expense_id`, expenseId);

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

    private mapExpenseFrom(record: ExpenseDetailedRecord): Expense {
        const metadata = this.extractMetadataFrom(record);
        const creditor = this.getCreditorFrom(record);

        const isPairExpense = this.isPairExpense(record);
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

    getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }

    getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null> {
        throw new Error('Method not implemented.');
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
}
