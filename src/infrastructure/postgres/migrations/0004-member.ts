import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('members');
    if (!exists) {
        await knex.schema.createTable('members', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();

            table.uuid('user_id').notNullable();
            table.uuid('group_id').notNullable();

            table.foreign('user_id').references('id').inTable('users');
            table.foreign('group_id').references('id').inTable('groups');
        });

        await knex('members').insert({
            id: process.env.DEFAULT_UUID,
            user_id: process.env.DEFAULT_UUID,
            group_id: process.env.DEFAULT_UUID,
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('members');
    if (exists) {
        return knex.schema.dropTable('members');
    }
}
