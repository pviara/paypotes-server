import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Member } from '@groups/domain/member';
import { SQLTable } from '@app/shared/sql-table';

type MemberRecord = {
    id: string;
    group_id: string;
};

type GroupRecord = {
    id: string;
    name: string;
    emoji: string;
    created_at: Date;
};

type MemberDetailedRecord = {
    id: string;
    firstname: string;
    lastname: string;
    avatar_url: string;
};

type GroupDetailedRecord = GroupRecord & {
    members: Array<MemberDetailedRecord>;
};

export class GroupPostgresRepository implements GroupRepository {
    constructor(@InjectKnex() protected knex: Knex) {}

    async getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null> {
        const group = await this.knex
            .select(`${SQLTable.Groups}.*`)
            .from(SQLTable.Groups)
            .innerJoin(
                SQLTable.Members,
                `${SQLTable.Groups}.id`,
                `${SQLTable.Members}.group_id`,
            )
            .where(`${SQLTable.Groups}.id`, groupId)
            .andWhere(`${SQLTable.Members}.id`, actorId)
            .first();

        if (group) {
            const members = await this.knex
                .select(`${SQLTable.Users}.*`)
                .from(SQLTable.Members)
                .innerJoin(
                    SQLTable.Users,
                    `${SQLTable.Users}.id`,
                    `${SQLTable.Members}.id`,
                )
                .where(`${SQLTable.Members}.group_id`, groupId);

            return this.mapGroupFrom({
                id: group.id,
                name: group.name,
                emoji: group.emoji,
                created_at: group.created_at,
                members,
            });
        }
        return null;
    }

    async getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        const groups: Array<GroupRecord> = await this.knex
            .select()
            .from(SQLTable.Members)
            .innerJoin(
                SQLTable.Groups,
                `${SQLTable.Groups}.id`,
                `${SQLTable.Members}.group_id`,
            )
            .where(`${SQLTable.Members}.id`, actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder.whereILike(`${SQLTable.Groups}.name`, search);
                }
            })
            .orderBy(`${SQLTable.Groups}.created_at`)
            .offset(pageIndex * 20)
            .limit(20);

        return Promise.all(
            groups.map(async (group) => {
                const members: Array<MemberDetailedRecord> = await this.knex
                    .select(`${SQLTable.Users}.*`)
                    .from(SQLTable.Members)
                    .innerJoin(
                        SQLTable.Users,
                        `${SQLTable.Users}.id`,
                        `${SQLTable.Members}.id`,
                    )
                    .where(`${SQLTable.Members}.group_id`, group.id);

                return this.mapGroupFrom({ members, ...group });
            }),
        );
    }

    async save(group: Group): Promise<void> {
        const groupRecord: GroupRecord = {
            id: group.getId(),
            name: group.getName(),
            emoji: group.getEmoji(),
            created_at: group.getCreatedAt(),
        };

        const members: Array<MemberRecord> = group
            .getMembers()
            .map((member) => ({
                id: member.getId(),
                group_id: group.getId(),
            }));

        await this.knex.insert(groupRecord).into(SQLTable.Groups);
        await this.knex.insert(members).into(SQLTable.Members);
    }

    private mapGroupFrom({ members, ...group }: GroupDetailedRecord): Group {
        return new Group({
            id: group.id,
            name: group.name,
            emoji: group.emoji,
            createdAt: new Date(group.created_at),
            members: this.mapMembersFrom(members),
        });
    }

    private mapMembersFrom(
        records: Array<MemberDetailedRecord>,
    ): Array<Member> {
        return records.map((record) => this.mapMemberFrom(record));
    }

    private mapMemberFrom(member: {
        id: string;
        firstname: string;
        lastname: string;
        avatar_url: string;
    }): Member {
        return new Member({
            id: member.id,
            firstname: member.firstname,
            lastname: member.lastname,
            avatarUrl: member.avatar_url,
        });
    }

    protected mapGroupRecordsFrom(groups: Array<Group>): Array<GroupRecord> {
        return groups.map((group) => ({
            id: group.getId(),
            name: group.getName(),
            emoji: group.getEmoji(),
            created_at: group.getCreatedAt(),
        }));
    }

    protected mapMemberRecordsFrom(
        members: Array<Member>,
        groupId: string,
    ): Array<MemberRecord> {
        return members.map((member) => ({
            id: member.getId(),
            group_id: groupId,
        }));
    }
}
