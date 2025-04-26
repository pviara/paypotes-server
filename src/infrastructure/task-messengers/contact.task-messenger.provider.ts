import { Provider } from '@nestjs/common';
import { RabbitMQContactTaskMessenger } from '@infra/task-messengers/contact.task-messenger';

export const contactTaskMessengerToken = 'ContactTaskMessenger';
export const contactTaskMessengerProvider: Provider = {
    provide: contactTaskMessengerToken,
    useClass: RabbitMQContactTaskMessenger,
};
