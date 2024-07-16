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

export enum Status {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

@Entity({
  name: 'video_screenshots',
})
export class VideoScreenshotEntity {
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

  @Column({
    name: 'full_storage_path',
  })
  fullStoragePath: string;

  @Column({
    name: 'timestamp_secs',
  })
  timestampSecs: number;

  @Column({
    name: 'extracted_text',
  })
  extractedText: string;

  @JoinColumn({ name: 'session_id' })
  @ManyToOne(() => SessionEntity, {
    eager: false,
    nullable: false,
  })
  session?: SessionEntity;
}
