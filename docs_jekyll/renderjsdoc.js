
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')

/* input and output paths */
const inputFile = '../src/*.js'
const outputDir = __dirname + '/docs_md/';

/* get template data */
// const templateData = jsdoc2md.getTemplateDataSync({ files: inputFile })

/* reduce templateData to an array of class names */
// const classNames = templateData.reduce((classNames, identifier) => {
//  if (identifier.kind === 'class') classNames.push(identifier.name)
//  return classNames
// }, [])

/* create a documentation file for each class */
// for (const className of classNames) {
//  const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`
//  console.log(`rendering ${className}, template: ${template}`)
//  const output = jsdoc2md.renderSync({ data: templateData, template: template })
//  fs.writeFileSync(path.resolve(outputDir, `${className}.md`), output)
//}

if( !fs.existsSync(outputDir) )
    fs.mkdirSync(outputDir, 0744);

var output = jsdoc2md.renderSync({ files : inputFile })
output =
    '---\n'+
    'layout : home\n'+
    'title : Docs-full\n'+
    'permalink : /docs-full/\n'+
    'date : 2019-03-31\n'+
    '---\n'+
    output;
fs.writeFileSync( path.resolve(outputDir, 'docs-full.md'), output );


