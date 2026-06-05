import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sitemapPath = resolve(__dirname, '../public/sitemap.xml')

const today = new Date().toISOString().slice(0, 10)
let xml = readFileSync(sitemapPath, 'utf8')

if (xml.includes('<lastmod>')) {
  xml = xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
} else {
  xml = xml.replace(/(<loc>[^<]*<\/loc>)/g, `$1\n    <lastmod>${today}</lastmod>`)
}

writeFileSync(sitemapPath, xml, 'utf8')
console.log(`Sitemap updated with lastmod: ${today}`)
