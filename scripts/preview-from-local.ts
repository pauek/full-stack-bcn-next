import { $ } from "bun"
import { createClient } from "@tursodatabase/api"

const API_TOKEN = process.env.TURSO_API_TOKEN
if (!API_TOKEN) {
  throw new Error(`Missing TURSO_API_KEY env variable!`)
}
const turso = createClient({
  org: `pauek`,
  token: API_TOKEN,
})

const DUMP_FILENAME = `dump.sql`
const PREVIEW_DB_NAME = `full-stack-bcn-preview`
const ORG_NAME = `pauek`
const GROUP_NAME = `upc`
const BASE_URL = `https://api.turso.tech/v1/organizations/${ORG_NAME}`

const deleteOldPreviewDatabase = async () => {
  const databases = await turso.databases.list()
  if (databases.findIndex((db) => db.name === PREVIEW_DB_NAME) === -1) {
    console.log(`Database ${PREVIEW_DB_NAME} is already deleted.`)
    return
  }
  const { database } = await turso.databases.delete(PREVIEW_DB_NAME)
  console.log(`Deleted database: ${database}`)
}

const createSQLiteDump = async () => {
  await $`sqlite3 full-stack-bcn.db .dump > ${DUMP_FILENAME}`
  console.log(`Created dump at "${DUMP_FILENAME}"`)
  return DUMP_FILENAME
}

const readDumpAsBytes = async (dumpFile: string) => {
  const arrayBuffer = await Bun.file(dumpFile).arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  console.log(`Read dump.`)
  return buffer
}

const uploadDumpToTurso = async (buffer: Buffer) => {
  const formData = new FormData()
  formData.set("file", new Blob([buffer]), DUMP_FILENAME)
  const response = await fetch(`${BASE_URL}/databases/dumps`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: formData,
  })
  if (!response.ok) {
    console.log(response)
    process.exit(1)
  }
  const { dump_url } = await response.json()
  console.log(`Uploaded dump to "${dump_url}"`)
  return dump_url
}

const createPreviewDatabase = async (dumpUrl: string) => {
  const database = await turso.databases.create(PREVIEW_DB_NAME, {
    group: GROUP_NAME,
    seed: { type: "dump", url: dumpUrl },
  })
  console.log(`Created database "${database.name}"`)
  return database.name
}

const getTokenForDatabase = async (database: string) => {
  const { jwt } = await turso.databases.createToken(database)
  return jwt;
}

// from https://regex101.com/library/oI0rR9?orderBy=MOST_POINTS&search=json
const jwtRegexp = /TURSO_TOKEN_PREVIEW="([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)"/

const savePreviewToken = async (newToken: string) => {
  const envFile = `.env.production.local`
  const content = await Bun.file(envFile).text()
  const newContent = content.replace(jwtRegexp, `TURSO_TOKEN_PREVIEW="${newToken}"`)
  if (newContent === content) {
    throw new Error(`Could not find TURSO_TOKEN_PREVIEW in "${envFile}`)
  }
  await Bun.write(envFile, newContent)
  console.log(`Saved token to "${envFile}"`)
}

await deleteOldPreviewDatabase()
const dumpFile = await createSQLiteDump()
const buffer = await readDumpAsBytes(dumpFile)
const dumpUrl = await uploadDumpToTurso(buffer)
const database = await createPreviewDatabase(dumpUrl)
const token = await getTokenForDatabase(database)
await savePreviewToken(token)
console.log(database)
