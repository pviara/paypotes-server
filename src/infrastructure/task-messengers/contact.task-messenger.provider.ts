import { Provider } from '@nestjs/common';
import { RabitMQContactTaskMessenger } from '@infra/task-messengers/contact.task-messenger';

export const contactTaskMessengerToken = 'ContactTaskMessenger';
export const contactTaskMessengerProvider: Provider = {
    provide: contactTaskMessengerToken,
    useClass: RabitMQContactTaskMessenger,
};
