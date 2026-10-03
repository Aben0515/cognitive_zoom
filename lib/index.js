import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export const name = 'cognitive-zoom-dsh';
export const PACKAGE_NAME = 'cognitive-zoom-dsh';

export function resolveCognitiveZoomSkillRoot(profileBaseUrl) {
  if (!profileBaseUrl) {
    throw new Error('cognitive-zoom-dsh: missing DSH profile baseUrl for package resolution');
  }
  let manifestPath;
  try {
    manifestPath = createRequire(profileBaseUrl).resolve(`${PACKAGE_NAME}/package.json`);
  } catch (error) {
    throw new Error(
      `cognitive-zoom-dsh: cannot resolve ${PACKAGE_NAME}/package.json from the DSH profile`,
      { cause: error },
    );
  }
  return join(dirname(manifestPath), 'skills');
}
