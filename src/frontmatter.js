import { visit } from 'unist-util-visit'
import { default as YAML } from 'yaml'

const frontmatter = () => (tree, vfile) => {
  visit(tree, 'yaml', (node) => {
    vfile.data = Object.assign(vfile.data, YAML.parse(node.value))

    return visit.EXIT
  })
}

export { frontmatter }
