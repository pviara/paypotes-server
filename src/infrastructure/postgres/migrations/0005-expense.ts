import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('expenses');
    if (!exists) {
        return knex.schema.createTable('expenses', (table) => {
            table.uuid('id', { primaryKey: true }).notNullable();
            table.string('label', 30).notNullable().defaultTo('');
            table.string('emoji', 1).notNullable().defaultTo('');
            table.date('created_at').notNullable().defaultTo('1999-01-01');
            table.integer('balance').notNullable().defaultTo(0);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('expenses');
    if (exists) {
        return knex.schema.dropTable('expenses');
    }
}
