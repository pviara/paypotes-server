import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { Member } from '@groups/domain/member';

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
    protected readonly groupTable = 'groups';
    protected readonly memberTable = 'members';

    constructor(@InjectKnex() protected knex: Knex) {}

    async getActorGroupById(
        actorId: string,
        groupId: string,
    ): Promise<Group | null> {
        const groupRecord = await this.knex
            .select('*')
            .from(this.groupTable)
            .where('id', groupId)
            .first();

        if (groupRecord) {
            const memberRecords = await this.knex
                .select('users.*')
                .from(this.memberTable)
                .innerJoin('users', 'users.id', `${this.memberTable}.id`)
                .where('members.group_id', groupId);

            return this.mapGroupFrom({
                id: groupRecord.id,
                name: groupRecord.name,
                emoji: groupRecord.emoji,
                members: memberRecords,
                created_at: groupRecord.created_at,
            });
        }
        return null;
    }

    async getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        const groupRecords = await this.knex
            .select('*')
            .from(this.memberTable)
            .innerJoin(
                this.groupTable,
                `${this.groupTable}.id`,
                `${this.memberTable}.group_id`,
            )
            .where('members.id', actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder.whereILike(`${this.groupTable}.name`, search);
                }
            })
            .orderBy(`${this.groupTable}.created_at`)
            .offset(pageIndex * 20)
            .limit(20);

        const groupDetailedRecords: Array<GroupDetailedRecord> = [];
        for (const groupRecord of groupRecords) {
            const memberRecords = await this.knex
                .select('users.*')
                .from(this.memberTable)
                .innerJoin('users', 'users.id', `${this.memberTable}.id`)
                .where('members.group_id', groupRecord.id);

            groupDetailedRecords.push({
                members: memberRecords,
                ...groupRecord,
            });
        }
        return this.mapGroupsFrom(groupDetailedRecords);
    }

    async save(group: Group): Promise<void> {
        const groupRecord: GroupRecord = {
            id: group.getId(),
            name: group.getName(),
            emoji: group.getEmoji(),
            created_at: group.getCreatedAt(),
        };

        const memberRecords: Array<MemberRecord> = group
            .getMembers()
            .map((member) => ({
                id: member.getId(),
                group_id: group.getId(),
            }));

        await this.knex.insert(groupRecord).into(this.groupTable);
        await this.knex.insert(memberRecords).into(this.memberTable);
    }

    private mapGroupsFrom(records: Array<GroupDetailedRecord>): Array<Group> {
        return records.map((record) => this.mapGroupFrom(record));
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
