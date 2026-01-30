import {
    RabbitMQService,
    MessageBrokerService,
} from '@infra/rabbitmq/rabbitmq.service';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceProvider: Provider = {
    provide: MessageBrokerService,
    useClass: RabbitMQService,
};
