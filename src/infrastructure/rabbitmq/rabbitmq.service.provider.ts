import { DefaultRabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceToken = 'RabbitMQService';
export const rabbitMQServiceProvider: Provider = {
    provide: rabbitMQServiceToken,
    useClass: DefaultRabbitMQService,
};
