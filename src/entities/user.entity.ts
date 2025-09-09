import { Entity,PrimaryGeneratedColumn,Column } from "typeorm";
@Entity('user')
export class User{
    @PrimaryGeneratedColumn()
    id : number
    
    @Column()
    name: string
    
    @Column()
    password: string
    
    @Column({unique: true})
    email: string
    
    @Column({ nullable: true, unique: true})
    avatarurl: string
}