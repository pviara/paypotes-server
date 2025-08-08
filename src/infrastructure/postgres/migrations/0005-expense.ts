import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('expenses');
    if (!exists) {
        await knex.schema.createTable('expenses', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('label', 30).notNullable().defaultTo('');
            table.string('emoji', 3).notNullable().defaultTo('');
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo('1999-01-01 00:00:00');
            table.integer('balance').notNullable().defaultTo(0);
            table.uuid('group_id').notNullable();

            table.foreign('group_id').references('id').inTable('groups');
        });

        await knex('expenses').insert({
            id: process.env.DEFAULT_UUID,
            group_id: process.env.DEFAULT_UUID,
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('expenses');
    if (exists) {
        return knex.schema.dropTable('expenses');
    }
}
