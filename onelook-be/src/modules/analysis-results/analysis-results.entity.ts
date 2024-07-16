import { SessionEntity } from 'src/modules/sessions/sessions.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AnalysisResultsResults = {
  [key: string]: any;
};

@Entity({
  name: 'analysis_results',
})
export class AnalysisResultsEntity {
  @PrimaryColumn({
    name: 'session_id',
  })
  sessionId: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'results',
    type: 'jsonb',
  })
  results: AnalysisResultsResults;

  @JoinColumn({ name: 'session_id' })
  @OneToOne(() => SessionEntity, {
    eager: false,
    nullable: false,
  })
  session?: SessionEntity;
}
