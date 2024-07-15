'use client';

// import dataProviderSimpleRest from "@refinedev/simple-rest";
import { BE_API_URL } from '@/constants';
import { dataProvider as dataProviderFactory } from '@/rest-data-provider';

// const API_URL = "https://api.fake-rest.refine.dev";

export const dataProvider = dataProviderFactory(BE_API_URL);
// export const dataProvider = dataProviderSimpleRest(API_URL);
