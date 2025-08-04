import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('members');
    if (!exists) {
        return knex.schema.createTable('members', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();

            table
                .uuid('user_id')
                .notNullable()
                .references('id')
                .inTable('users');

            table
                .uuid('group_id')
                .notNullable()
                .references('id')
                .inTable('groups');
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('members');
    if (exists) {
        return knex.schema.dropTable('members');
    }
}
