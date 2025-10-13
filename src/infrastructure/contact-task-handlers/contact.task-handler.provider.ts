import {
    ContactTaskHandler,
    DefaultContactTaskHandler,
} from '@infra/contact-task-handlers/contact.task-handler';
import { Provider } from '@nestjs/common';

export const contactTaskHandlerProvider: Provider = {
    provide: ContactTaskHandler,
    useClass: DefaultContactTaskHandler,
};
