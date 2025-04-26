import { Channel, ChannelModel, connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Nullable } from '@test/helpers/application-runner/model/nullable';

export interface RabbitMQService {
    getConsumer(): Channel;
    getProducer(): Channel;
}

export class DefaultRabbitMQService
    implements OnApplicationShutdown, OnModuleInit, RabbitMQService
{
    private consumer: Nullable<Channel> = null;
    private connection: Nullable<ChannelModel> = null;
    private logger = new Logger(DefaultRabbitMQService.name);
    private producer: Nullable<Channel> = null;

    constructor(private configService: ConfigService) {}

    getConsumer(): Channel {
        if (this.consumer) return this.consumer;
        throw new Error(
            'RabbitMQ seems not to have create any consumer channel',
        );
    }

    getProducer(): Channel {
        if (this.producer) return this.producer;
        throw new Error(
            'RabbitMQ seems not to have create any producer channel',
        );
    }

    async onApplicationShutdown(): Promise<void> {
        await this.disconnectConsumer();
        await this.disconnectProducer();
        await this.disconnectRabbitMQ();
    }

    async onModuleInit(): Promise<void> {
        try {
            await this.connectRabbitMQ();
            await this.createConsumer();
            await this.createProducer();
        } catch (error: unknown) {
            this.logErrorConnectingToRabbitMQ(error);
        }
    }

    private async disconnectConsumer(): Promise<void> {
        await this.getConsumer().close();
        this.logDisconnectedConsumer();
    }

    private logDisconnectedConsumer(): void {
        this.logger.log('Disconnected RabbitMQ consumer channel');
    }

    private async disconnectProducer(): Promise<void> {
        await this.getProducer().close();
        this.logDisconnectedProducer();
    }

    private logDisconnectedProducer(): void {
        this.logger.log('Disconnected RabbitMQ producer channel');
    }

    private async disconnectRabbitMQ() {
        await this.getConnection().close();
        this.logDisconnectedRabbitMQ();
    }

    private logDisconnectedRabbitMQ(): void {
        this.logger.log('Disconnected RabbitMQ');
    }

    private async createConsumer(): Promise<void> {
        this.consumer = await this.getConnection().createChannel();
        this.logConsumerCreated();
    }

    private async createProducer(): Promise<void> {
        this.producer = await this.getConnection().createChannel();
        this.logProducerCreated();
    }

    private getConnection(): ChannelModel {
        if (this.connection) return this.connection;
        throw new Error('RabbitMQ seems not to have been connected');
    }

    private async connectRabbitMQ(): Promise<void> {
        const url = this.buildRabbitMQURL();
        this.connection = await connect(url);
        this.logConnectedToRabbitMQ();
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

    private logConsumerCreated(): void {
        this.logger.log('Created RabbitMQ consumer channel');
    }

    private logProducerCreated(): void {
        this.logger.log('Created RabbitMQ producer channel');
    }
}
