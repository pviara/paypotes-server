import {
    RabbitMQMessageBroker,
    MessageBroker,
} from '@infra/messaging/rabbitmq.message-broker';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceProvider: Provider = {
    provide: MessageBroker,
    useClass: RabbitMQMessageBroker,
};
