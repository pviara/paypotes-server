import { GroupExpenseDTO } from './group-expense.dto';
import { PairExpenseDTO } from './pair-expense.dto';

export type ExpenseDTO = GroupExpenseDTO | PairExpenseDTO;
