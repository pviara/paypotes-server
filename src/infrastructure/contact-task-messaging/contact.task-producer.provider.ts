import {
    ContactTaskProducer,
    DefaultContactTaskProducer,
} from '@infra/contact-task-messaging/contact.task-producer';
import { Provider } from '@nestjs/common';

export const contactTaskProducerProvider: Provider = {
    provide: ContactTaskProducer,
    useClass: DefaultContactTaskProducer,
};
