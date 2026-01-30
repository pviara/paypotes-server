import {
    ContactTaskProducer,
    DefaultContactTaskProducer,
} from '@infra/contact-task-management/contact.task-producer';
import { Provider } from '@nestjs/common';

export const contactTaskProducerProvider: Provider = {
    provide: ContactTaskProducer,
    useClass: DefaultContactTaskProducer,
};
