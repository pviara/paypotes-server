import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('stakeholders');
    if (!exists) {
        await knex.schema.createTable('stakeholders', (table) => {
            table.uuid('id').notNullable();
            table.uuid('expense_id').notNullable();
            table.boolean('creditor').notNullable().defaultTo(false);
            table.integer('share').notNullable().defaultTo(0);

            table.foreign('id').references('id').inTable('users');
            table.foreign('expense_id').references('id').inTable('expenses');

            table.unique(['id', 'expense_id']);
        });

        await knex('stakeholders').insert({
            id: process.env.DEFAULT_UUID,
            expense_id: process.env.DEFAULT_UUID,
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('stakeholders');
    if (exists) {
        return knex.schema.dropTable('stakeholders');
    }
}
