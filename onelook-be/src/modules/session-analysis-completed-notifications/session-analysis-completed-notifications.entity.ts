import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'session_analysis_completed_notifications',
})
export class SessionAnalysisCompletedNotificationEntity {
  @PrimaryColumn({
    name: 'session_id',
  })
  sessionId: string;

  @PrimaryColumn({
    name: 'email',
    type: 'text',
  })
  email: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'sent_at',
    type: 'timestamptz',
    nullable: true,
  })
  sentAt: Date | null;

  @Column({
    name: 'message_id',
    type: 'text',
    unique: true,
    nullable: true,
  })
  messageId: string | null;
}
