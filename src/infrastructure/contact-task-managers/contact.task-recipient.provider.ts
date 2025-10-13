import {
    ContactTaskRecipient,
    RabbitMQContactTaskRecipient,
} from '@infra/contact-task-managers/contact.task-recipient';
import { Provider } from '@nestjs/common';

export const contactTaskRecipientProvider: Provider = {
    provide: ContactTaskRecipient,
    useClass: RabbitMQContactTaskRecipient,
};
