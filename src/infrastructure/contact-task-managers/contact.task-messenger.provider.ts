import {
    ContactTaskMessenger,
    RabbitMQContactTaskMessenger,
} from '@infra/contact-task-managers/contact.task-messenger';
import { Provider } from '@nestjs/common';

export const contactTaskMessengerProvider: Provider = {
    provide: ContactTaskMessenger,
    useClass: RabbitMQContactTaskMessenger,
};
