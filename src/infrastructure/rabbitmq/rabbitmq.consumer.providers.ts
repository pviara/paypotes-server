import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumerOptions, RabbitMQConsumer } from './rabbitmq.consumer';
import { RabbitMQService } from './rabbitmq.service';
import { rabbitMQServiceToken } from './rabbitmq.service.provider';

export const rabbitMQContactTasksConsumerToken =
    'RabbitMQContactTasksConsumerToken';

export const rabbitMQContactTasksConsumerProvider: Provider = {
    inject: [ConfigService, rabbitMQServiceToken],
    provide: rabbitMQContactTasksConsumerToken,
    useFactory: (
        configService: ConfigService,
        rabbitMQService: RabbitMQService,
    ) => {
        const options: ConsumerOptions = {
            queue: configService.get<string>('CONTACT_TASKS_QUEUE', ''),
        };
        return new RabbitMQConsumer(options, rabbitMQService);
    },
};
