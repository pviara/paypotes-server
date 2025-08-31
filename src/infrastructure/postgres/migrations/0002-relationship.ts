import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('relationships');
    if (!exists) {
        return knex.schema.createTable('relationships', (table) => {
            const [USER_A, USER_B] = ['user_a_id', 'user_b_id'];

            table.uuid(USER_A).notNullable();
            table.uuid(USER_B).notNullable();

            table.foreign(USER_A).references('id').inTable('users');
            table.foreign(USER_B).references('id').inTable('users');

            table.index(USER_A);
            table.index(USER_B);

            table.unique([USER_A, USER_B]);
            table.check('?? != ??', [USER_A, USER_B]);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable('relationships');
    if (exists) {
        return knex.schema.dropTable('relationships');
    }
}
