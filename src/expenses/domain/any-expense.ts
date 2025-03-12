import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from '@expenses/domain/pair-expense';

export type AnyKindOfExpense = GroupExpense | PairExpense;
