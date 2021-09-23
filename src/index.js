import { readdir, readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { join as desmJoin } from 'desm'
import { unified } from 'unified'
import { default as remarkParse } from 'remark-parse'
import { default as remarkFrontmatter } from 'remark-frontmatter'
import { default as remarkToc } from 'remark-toc'
import { default as remarkRehype } from 'remark-rehype'
import { default as rehypeStringify } from 'rehype-stringify'
import { frontmatter } from './frontmatter.js'
import { postTemplate } from './post-template.js'

const POST_DIR = './content'
const OUT_DIR = './public'

const config = {
  postsdir: desmJoin(import.meta.url, '..', POST_DIR),
  outdir: desmJoin(import.meta.url, '..', OUT_DIR),
}

const r = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(frontmatter)
  .use(remarkToc)
  .use(remarkRehype)
  .use(rehypeStringify)

const makeDirectory = async (path) => {
  try {
    const dir = await stat(path)
    if (dir.isDirectory()) return
  } catch (err) {
    if (err.code !== 'ENOENT') throw new Error(err)
  }

  await mkdir(path)
}

const createPost = async (postPath) => {
  if (!postPath) throw new Error('post path missing')

  const dataPath = join(config.postsdir, postPath)

  try {
    const data = await readFile(`${dataPath}`, 'utf8')
    const post = await r.process(data)

    return post
  } catch (err) {
    throw new Error(err)
  }
}

await makeDirectory(config.outdir)
const posts = await readdir(config.postsdir)

for (let post of posts) {
  const name = basename(post, '.md')
  const path = join(config.outdir, name)

  try {
    await makeDirectory(path)
    const postData = await createPost(post)
    const postHtml = postTemplate(postData)
    await writeFile(join(config.outdir, name, 'index.html'), postHtml)
  } catch (err) {
    throw new Error(err)
  }
}
