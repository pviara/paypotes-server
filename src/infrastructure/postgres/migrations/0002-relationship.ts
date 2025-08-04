import { Knex } from 'knex';

const TABLE_NAME = 'relationships';

export async function up(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (!exists) {
        return knex.schema.createTable(TABLE_NAME, (table) => {
            const REFERENCE_COLUMN = 'id';
            const REFERENCE_TABLE_NAME = 'users';
            const [USER_A, USER_B] = ['user_a', 'user_b'];

            table.uuid(USER_A).notNullable();
            table.uuid(USER_B).notNullable();

            table
                .foreign(USER_A)
                .references(REFERENCE_COLUMN)
                .inTable(REFERENCE_TABLE_NAME);
            table
                .foreign(USER_B)
                .references(REFERENCE_COLUMN)
                .inTable(REFERENCE_TABLE_NAME);

            table.index(USER_A);
            table.index(USER_B);

            table.unique([USER_A, USER_B]);
            table.check('?? != ??', [USER_A, USER_B]);
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const exists = await knex.schema.hasTable(TABLE_NAME);
    if (exists) {
        return knex.schema.dropTable(TABLE_NAME);
    }
}
