import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('groups');
    if (!exists) {
        await knex.schema.createTable('groups', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('name', 30).notNullable().defaultTo('');
            table.string('emoji', 3).notNullable().defaultTo('');
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo('1999-01-01 00:00:00');
        });

        await knex('groups').insert({ id: process.env.DEFAULT_UUID });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('groups');
    if (exists) {
        return knex.schema.dropTable('groups');
    }
}
