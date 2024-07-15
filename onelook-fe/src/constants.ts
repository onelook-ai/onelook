export const BE_API_HOST = process.env.NEXT_PUBLIC_BE_API_HOST;
const BE_API_VER = process.env.NEXT_PUBLIC_BE_API_VER;
export const BE_API_URL = `${BE_API_HOST}/api/${BE_API_VER}`;

export const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

export const maxFileSize = 2 * 1024 ** 3; // 2 GB

export const examplePentestResults =
  process.env.NEXT_PUBLIC_EXAMPLE_PENTEST_RESULTS_LINK || '';

export const storagePrefix = 'terracottta';
