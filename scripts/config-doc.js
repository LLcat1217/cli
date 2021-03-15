const { shorthands, describeAll } = require('../lib/utils/config/index.js')
const { writeFileSync, readFileSync } = require('fs')
const { resolve } = require('path')
const configDoc = resolve(__dirname, '../docs/content/using-npm/config.md')

const addBetweenTags = (doc, startTag, endTag, body) => {
  const startSplit = doc.split(startTag)
  if (startSplit.length !== 2)
    throw new Error('Did not find exactly one start tag')

  const endSplit = startSplit[1].split(endTag)
  if (endSplit.length !== 2)
    throw new Error('Did not find exactly one end tag')

  return [
    startSplit[0],
    startTag,
    '\n<!-- automatically generated, do not edit manually -->\n',
    body,
    '\n\n',
    endTag,
    endSplit[1],
  ].join('')
}

const addDescriptions = doc => {
  const startTag = '<!-- AUTOGENERATED CONFIG DESCRIPTIONS START -->'
  const endTag = '<!-- AUTOGENERATED CONFIG DESCRIPTIONS END -->'
  return addBetweenTags(doc, startTag, endTag, describeAll())
}

const addShorthands = doc => {
  const startTag = '<!-- AUTOGENERATED CONFIG SHORTHANDS START -->'
  const endTag = '<!-- AUTOGENERATED CONFIG SHORTHANDS END -->'
  const body = Object.entries(shorthands)
    .sort(([shorta, expansiona], [shortb, expansionb]) => {
      // sort by what they're short FOR
      return expansiona.join(' ').localeCompare(expansionb.join(' ')) ||
        shorta.localeCompare(shortb)
    })
    .map(([short, expansion]) => {
    const dash = short.length === 1 ? '-' : '--'
    return `* \`${dash}${short}\`: \`${expansion.join(' ')}\``
  }).join('\n')
  return addBetweenTags(doc, startTag, endTag, body)
}

const doc = readFileSync(configDoc, 'utf8')
writeFileSync(configDoc, addDescriptions(addShorthands(doc)))
console.log(`updated docs/content/using-npm/config.md`)
