import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ContextType,
  SessionVideoContextEntity,
} from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { Repository } from 'typeorm';

export type CreateSessionVideoContextDto = {
  contextType: ContextType;
  timestampSecs: number;
  content: string;
};

@Injectable()
export class SessionVideoContextsService {
  constructor(
    @InjectRepository(SessionVideoContextEntity)
    private readonly sessionVideoContextEntitiesRepo: Repository<SessionVideoContextEntity>,
  ) {}

  async createSessionVideoContext(
    sessionId: string,
    createSessionVideoContextDto: CreateSessionVideoContextDto,
  ): Promise<SessionVideoContextEntity> {
    return await this.sessionVideoContextEntitiesRepo.save({
      sessionId,
      ...createSessionVideoContextDto,
    });
  }

  async batchCreateSessionVideoContexts(
    sessionId: string,
    createSessionVideoContextDtos: CreateSessionVideoContextDto[],
  ): Promise<SessionVideoContextEntity[]> {
    return await this.sessionVideoContextEntitiesRepo.save(
      createSessionVideoContextDtos.map((dto) => ({
        sessionId,
        ...dto,
      })),
    );
  }
}
