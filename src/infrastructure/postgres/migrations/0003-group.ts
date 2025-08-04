import { Knex } from 'knex';

const TABLE_NAME = 'groups';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (!exists) {
        return knex.schema.createTable(TABLE_NAME, (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('name', 25).notNullable().defaultTo('');
            table.string('emoji', 1).notNullable().defaultTo('❔');
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (exists) {
        return knex.schema.dropTable(TABLE_NAME);
    }
}
