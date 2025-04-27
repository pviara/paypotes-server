import { ConfigService } from '@nestjs/config';
import { DefaultRabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { Provider } from '@nestjs/common';

export const rabbitMQServiceToken = 'RabbitMQService';
export const rabbitMQServiceProvider: Provider = {
    inject: [ConfigService],
    provide: rabbitMQServiceToken,
    useFactory: (configService: ConfigService) =>
        new DefaultRabbitMQService(configService),
};
