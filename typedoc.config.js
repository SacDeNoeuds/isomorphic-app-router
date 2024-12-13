const isGithubActions = process.env.GITHUB_ACTIONS === 'true'

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  basePath: isGithubActions ? './isomorphic-app-router' : './docs',
  entryPoints: ['./src/main.ts'],
  plugin: ['typedoc-unhoax-theme'],
  out: 'docs',
  includeVersion: true,
  searchInComments: true,
  searchInDocuments: true,
  categorizeByGroup: false,
  navigation: {
    compactFolders: true,
    includeCategories: true,
    excludeReferences: true,
    includeGroups: false,
  },
  visibilityFilters: {},
  defaultCategory: 'Default Category',
  cleanOutputDir: true,
  excludeCategories: ['Default Category'],
  categoryOrder: [
    'Guide',
    'Reference/Router',
    'Reference/RouterBuilder',
    'Reference/Resolver',
    '*',
  ],
  sort: ['documents-first', 'alphabetical'],
  navigationLinks: {
    GitHub: 'https://github.com/SacDeNoeuds/isomorphic-app-router',
  },
}

export default config
