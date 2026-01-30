import {
    RabbitMQMessageBroker,
    MessageBroker,
} from '@app/infrastructure/rabbitmq/rabbitmq.message-broker';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceProvider: Provider = {
    provide: MessageBroker,
    useClass: RabbitMQMessageBroker,
};
