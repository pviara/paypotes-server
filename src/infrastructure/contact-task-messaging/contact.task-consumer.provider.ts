import {
    ContactTaskConsumer,
    DefaultContactTaskConsumer,
} from '@infra/contact-task-messaging/contact.task-consumer';
import { Provider } from '@nestjs/common';

export const contactTaskConsumerProvider: Provider = {
    provide: ContactTaskConsumer,
    useClass: DefaultContactTaskConsumer,
};
