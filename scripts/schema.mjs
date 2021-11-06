import * as dotenv from 'dotenv'
import { resolve, join } from 'path'
import { readFile, writeFile } from 'fs/promises'

const env = dotenv.config()

if (env.error) {
  throw env.error
}

const { CUSTOM_NAMESPACE, ADMIN_SECRET, JWT_SECRET, AUTH_HEADER } = process.env
const envVars = {
  CUSTOM_NAMESPACE,
  ADMIN_SECRET,
  JWT_SECRET,
  AUTH_HEADER,
}

const readSchema = async () => {
  const path = resolve(process.cwd(), join('./graphql', '_schema.graphql'))

  return readFile(path, { encoding: 'utf-8' })
}

const writeSchema = async (contents) => {
  const path = resolve(process.cwd(), join('./graphql', 'schema.graphql'))

  return writeFile(path, contents, { encoding: 'utf-8' })
}

const replaceEnvVars = async () => {
  let contents = await readSchema()

  Object.entries(envVars).forEach(([envKey, envVal]) => {
    const replacement = `<${envKey}>`
    contents = contents.replaceAll(replacement, envVal)
  })

  writeSchema(contents)
}

replaceEnvVars()
