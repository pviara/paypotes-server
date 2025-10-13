import {
    DefaultRabbitMQService,
    RabbitMQService,
} from '@infra/rabbitmq/rabbitmq.service';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceProvider: Provider = {
    provide: RabbitMQService,
    useClass: DefaultRabbitMQService,
};
