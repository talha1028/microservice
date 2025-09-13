import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
export enum UserRole {
    USER = 0,
    ADMIN = 1,
    SUPERADMIN = 2,
}

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    password: string

    @Column({ unique: true })
    email: string

    @Column({ nullable: true, unique: true })
    avatarurl: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;
}