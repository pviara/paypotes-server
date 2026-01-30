import {
    RabbitMQMessageBroker,
    MessageBroker,
} from '@infra/rabbitmq/rabbitmq.message-broker';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceProvider: Provider = {
    provide: MessageBroker,
    useClass: RabbitMQMessageBroker,
};
