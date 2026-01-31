import {
    ContactTaskConsumer,
    DefaultContactTaskConsumer,
} from '@app/infrastructure/contact-task-messaging/consumer/contact.task-consumer';
import { Provider } from '@nestjs/common';

export const contactTaskConsumerProvider: Provider = {
    provide: ContactTaskConsumer,
    useClass: DefaultContactTaskConsumer,
};
