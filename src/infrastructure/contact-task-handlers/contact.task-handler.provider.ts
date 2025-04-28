import { DefaultContactTaskHandler } from '@infra/contact-task-handlers/contact.task-handler';
import { Provider } from '@nestjs/common';

export const contactTaskHandlerToken = 'ContactTaskHandler';
export const contactTaskHandlerProvider: Provider = {
    provide: contactTaskHandlerToken,
    useClass: DefaultContactTaskHandler,
};
