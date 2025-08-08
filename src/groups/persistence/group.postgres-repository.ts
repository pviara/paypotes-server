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
        const [
            {
                rows: [record],
            },
        ] = await this.knex
            .select('*')
            .from(this.groupTable)
            .innerJoin(
                this.memberTable,
                `${this.memberTable}.group_id`,
                `${this.groupTable}.id`,
            )
            .innerJoin('users', 'users.id', `${this.memberTable}.id`)
            .where('members.id', actorId)
            .where('groups.id', groupId);

        return record ? this.mapGroupFrom(record) : null;
    }

    async getActorGroups(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Group[]> {
        const records = await this.knex
            .select('*')
            .from(this.groupTable)
            .innerJoin(
                this.memberTable,
                `${this.memberTable}.group_id`,
                `${this.groupTable}.id`,
            )
            .innerJoin('users', 'users.id', `${this.memberTable}.id`)
            .where('members.id', actorId)
            .modify((queryBuilder) => {
                if (search) {
                    queryBuilder.whereILike(`${this.groupTable}.name`, search);
                }
            })
            .offset(pageIndex * 20)
            .limit(20);

        return this.mapGroupsFrom(records);
    }

    async save(group: Group): Promise<void> {
        const groupRecord: GroupRecord = {
            id: group.getId(),
            name: group.getName(),
            emoji: group.getEmoji(),
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
}
