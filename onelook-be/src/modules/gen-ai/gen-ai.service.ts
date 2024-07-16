import { createAnthropic } from '@ai-sdk/anthropic';
import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { generateText, LanguageModel, streamText } from 'ai';

export const GENAI_SERVICE_CONFIG = 'GENAI_SERVICE_CONFIG';

export enum GenAIServiceTypes {
  OPENAI = 'openai',
  OPENAI_COMPATIBLE = 'openai-compatible',
  GOOGLE = 'google',
  ANTHROPIC = 'anthropic',
  MISTRAL = 'mistral',
  COHERE = 'cohere',
}

export type GenAIServiceConfig = {
  service: GenAIServiceTypes;
  baseUrl?: string;
  project?: string;
  apiKey: string;
  model: string;
};

@Injectable()
export class GenAIService {
  readonly languageModel: LanguageModel;

  constructor(
    @Inject(GENAI_SERVICE_CONFIG) private readonly config: GenAIServiceConfig,
  ) {
    this.languageModel = this.setLanguageModel();
  }

  generateText: GenerateTextWithoutModelFunctionType = ({
    system,
    temperature,
    messages,
    tools,
    toolChoice,
  }) => {
    return generateText({
      model: this.languageModel,
      system,
      temperature,
      messages,
      tools,
      toolChoice,
    });
  };

  streamText: StreamTextWithoutModelFunctionType = ({
    system,
    temperature,
    messages,
    tools,
    toolChoice,
  }) => {
    return streamText({
      model: this.languageModel,
      system,
      temperature,
      messages,
      tools,
      toolChoice,
    });
  };

  private setLanguageModel(): LanguageModel {
    const genAIProviderSettings = {
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    };

    switch (this.config.service) {
      case GenAIServiceTypes.OPENAI:
      case GenAIServiceTypes.OPENAI_COMPATIBLE:
        return createOpenAI({
          ...genAIProviderSettings,
          project: this.config.project,
        })(this.config.model);
      case GenAIServiceTypes.GOOGLE:
        return createGoogleGenerativeAI(genAIProviderSettings)(
          this.config.model,
          this.getGoogleGenerativeAIConfig(),
        );
      case GenAIServiceTypes.ANTHROPIC:
        return createAnthropic(genAIProviderSettings)(this.config.model);
      case GenAIServiceTypes.MISTRAL:
        return createMistral(genAIProviderSettings)(this.config.model);
      case GenAIServiceTypes.COHERE:
        return createCohere(genAIProviderSettings)(this.config.model);
      default:
        throw new InternalServerErrorException(
          `Unknown service type: ${this.config.service}`,
        );
    }
  }

  private getGoogleGenerativeAIConfig(): {
    safetySettings: {
      category:
        | 'HARM_CATEGORY_HATE_SPEECH'
        | 'HARM_CATEGORY_DANGEROUS_CONTENT'
        | 'HARM_CATEGORY_HARASSMENT'
        | 'HARM_CATEGORY_SEXUALLY_EXPLICIT';
      threshold:
        | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
        | 'BLOCK_LOW_AND_ABOVE'
        | 'BLOCK_MEDIUM_AND_ABOVE'
        | 'BLOCK_ONLY_HIGH'
        | 'BLOCK_NONE';
    }[];
  } {
    return {
      // These settings are hardcoded for now, but they should be configurable.
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    };
  }
}

type GenerateTextFunctionType = typeof generateText;
type GenerateTextWithoutModelFunctionType = (
  params: Omit<Parameters<GenerateTextFunctionType>[0], 'model'>,
) => ReturnType<GenerateTextFunctionType>;

type StreamTextFunctionType = typeof streamText;
type StreamTextWithoutModelFunctionType = (
  params: Omit<Parameters<StreamTextFunctionType>[0], 'model'>,
) => ReturnType<StreamTextFunctionType>;
