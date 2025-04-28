import { ConfigService } from '@nestjs/config';
import { RabbitMQContactTaskRecipient } from '@infra/task-managers/contact.task-recipient';
import { Provider } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export const contactTaskRecipientToken = 'ContactTaskRecipient';
export const contactTaskRecipientProvider: Provider = {
    inject: [ConfigService, rabbitMQServiceToken],
    provide: contactTaskRecipientToken,
    useFactory: (
        configService: ConfigService,
        rabbitMQService: RabbitMQService,
    ) => new RabbitMQContactTaskRecipient(configService, rabbitMQService),
};
