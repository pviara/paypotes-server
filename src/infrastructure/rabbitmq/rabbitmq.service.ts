import { ConfigService } from '@nestjs/config';
import { ChannelModel, connect } from 'amqplib';
import {
    Injectable,
    Logger,
    OnApplicationShutdown,
    OnModuleInit,
} from '@nestjs/common';
import { Nullable } from '@test/helpers/application-runner/model/nullable';

@Injectable()
export class RabbitMQService implements OnApplicationShutdown, OnModuleInit {
    private connection: Nullable<ChannelModel> = null;
    private logger = new Logger(RabbitMQService.name);

    constructor(private configService: ConfigService) {}

    async onApplicationShutdown(): Promise<void> {
        await this.getConnection().close();
        this.logDisconnectedRabbitMQ();
    }

    async onModuleInit(): Promise<void> {
        try {
            await this.connectRabbitMQ();
            this.logConnectedToRabbitMQ();
        } catch (error: unknown) {
            this.logErrorConnectingToRabbitMQ(error);
        }
    }

    private getConnection(): ChannelModel {
        if (this.connection) return this.connection;
        throw new Error('RabbitMQ seems not to have been connected');
    }

    private async connectRabbitMQ(): Promise<void> {
        const url = this.buildRabbitMQURL();
        this.connection = await connect(url);
    }

    private logConnectedToRabbitMQ(): void {
        this.logger.log('Connected to RabbitMQ');
    }

    private buildRabbitMQURL(): string {
        const username = this.configService.get<string>(
            'RABBITMQ_DEFAULT_USER',
        );
        const password = this.configService.get<string>(
            'RABBITMQ_DEFAULT_PASS',
        );
        const host = this.configService.get<string>('RABBITMQ_HOST');
        const port = this.configService.get<string>('RABBITMQ_PORT');
        return `amqp://${username}:${password}@${host}:${port}`;
    }

    private logErrorConnectingToRabbitMQ(error: unknown): void {
        this.logger.error('Error connecting to RabbitMQ', error);
    }

    private logDisconnectedRabbitMQ(): void {
        this.logger.log('Disconnected RabbitMQ');
    }
}
