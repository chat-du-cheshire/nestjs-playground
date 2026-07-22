import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Flavor } from './flavor.entity';

@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  brand!: string;

  @Column('int', { default: 0 })
  recommendations!: number;

  @ManyToMany(() => Flavor, (flavor) => flavor.coffees, { cascade: true })
  @JoinTable()
  flavors!: Flavor[];
}
