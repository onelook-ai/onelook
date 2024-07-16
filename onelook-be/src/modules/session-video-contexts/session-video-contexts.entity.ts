import { SessionEntity } from 'src/modules/sessions/sessions.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContextType {
  USER = 'USER',
  AI = 'AI',
}

@Entity({
  name: 'session_video_contexts',
})
export class SessionVideoContextEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'session_id',
  })
  sessionId: string;

  @JoinColumn({
    name: 'session_id',
  })
  @ManyToOne(() => SessionEntity, {
    eager: false,
    nullable: false,
  })
  session?: SessionEntity;

  @Column({
    name: 'context_type',
  })
  contextType: ContextType;

  @Column({
    name: 'timestamp_secs',
  })
  timestampSecs: number;

  @Column({
    name: 'content',
  })
  content: string;
}
