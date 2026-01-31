import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Log } from '@infra/logger/log.decorator';
import { Member } from '@groups/domain/member';
import { Table } from '@infra/database/table';

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

export type GroupDetailedRecord = GroupRecord & {
    members: Array<MemberDetailedRecord>;
};

export class GroupPostgresRepository implements GroupRepository {
    constructor(@InjectKnex() protected knex: Knex) {}

    @Log('debug')
    async getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null> {
        const group = await this.knex
            .select(`${Table.Groups}.*`)
            .from(Table.Groups)
            .innerJoin(
                Table.Members,
                `${Table.Groups}.id`,
                `${Table.Members}.group_id`,
            )
            .where(`${Table.Groups}.id`, groupId)
            .andWhere(`${Table.Members}.id`, actorId)
            .first();

        if (group) {
            const members = await this.knex
                .select(`${Table.Users}.*`)
                .from(Table.Members)
                .innerJoin(
                    Table.Users,
                    `${Table.Users}.id`,
                    `${Table.Members}.id`,
                )
                .where(`${Table.Members}.group_id`, groupId);

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

    @Log('debug')
    async getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        const groups: Array<GroupRecord> = await this.knex
            .select()
            .from(Table.Members)
            .innerJoin(
                Table.Groups,
                `${Table.Groups}.id`,
                `${Table.Members}.group_id`,
            )
            .where(`${Table.Members}.id`, actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder.whereILike(`${Table.Groups}.name`, search);
                }
            })
            .orderBy(`${Table.Groups}.created_at`)
            .offset(pageIndex * 20)
            .limit(20);

        return Promise.all(
            groups.map(async (group) => {
                const members: Array<MemberDetailedRecord> = await this.knex
                    .select(`${Table.Users}.*`)
                    .from(Table.Members)
                    .innerJoin(
                        Table.Users,
                        `${Table.Users}.id`,
                        `${Table.Members}.id`,
                    )
                    .where(`${Table.Members}.group_id`, group.id);

                return this.mapGroupFrom({ members, ...group });
            }),
        );
    }

    @Log('debug')
    async save(group: Group): Promise<void> {
        // todo tech/#129 transaction required
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

        await this.knex.insert(groupRecord).into(Table.Groups);
        await this.knex.insert(members).into(Table.Members);
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
