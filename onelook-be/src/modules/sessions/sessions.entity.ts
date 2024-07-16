import { SessionVideoContextEntity } from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { VideoScreenshotEntity } from 'src/modules/video-screenshots/video-screenshots.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProcessingStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

@Entity({
  name: 'sessions',
})
export class SessionEntity {
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
    name: 'status',
  })
  status: ProcessingStatus;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'video_full_storage_path',
    nullable: true,
    type: 'text',
  })
  videoFullStoragePath: string | null;

  @OneToMany(() => VideoScreenshotEntity, (screenshot) => screenshot.session, {
    eager: false,
  })
  screenshots?: VideoScreenshotEntity[];

  @OneToMany(
    () => SessionVideoContextEntity,
    (videoContext) => videoContext.session,
    {
      eager: false,
      cascade: ['insert'],
    },
  )
  videoContexts?: SessionVideoContextEntity[];
}
