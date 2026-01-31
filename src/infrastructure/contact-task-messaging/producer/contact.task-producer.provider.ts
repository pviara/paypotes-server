import {
    ContactTaskProducer,
    DefaultContactTaskProducer,
} from '@app/infrastructure/contact-task-messaging/producer/contact.task-producer';
import { Provider } from '@nestjs/common';

export const contactTaskProducerProvider: Provider = {
    provide: ContactTaskProducer,
    useClass: DefaultContactTaskProducer,
};
