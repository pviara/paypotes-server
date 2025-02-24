import { AuthGuard } from '@app/auth/auth-guard.decorator';
import { Controller } from '@nestjs/common';

export const CONTACTS_API_ROUTE = 'contacts';

@AuthGuard()
@Controller(CONTACTS_API_ROUTE)
export class ContactController {}
