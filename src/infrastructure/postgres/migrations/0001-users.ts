import { Knex } from 'knex';

const TABLE_NAME = 'users';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (!exists) {
        return knex.schema.createTable(TABLE_NAME, (table) => {
            table.uuid('id', { primaryKey: true });
            table.string('firstname', 30);
            table.string('lastname', 30);
            table.string('email', 50);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (exists) {
        return knex.schema.dropTable(TABLE_NAME);
    }
}
