import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('groups');
    if (!exists) {
        await knex.schema.createTable('groups', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('name', 30).notNullable().defaultTo('');
            table.string('emoji', 1).notNullable().defaultTo('');
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
