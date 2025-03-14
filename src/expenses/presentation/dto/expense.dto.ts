import { GroupExpenseDTO } from '@expenses/presentation/dto/group-expense.dto';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';

export type ExpenseDTO = GroupExpenseDTO | PairExpenseDTO;
