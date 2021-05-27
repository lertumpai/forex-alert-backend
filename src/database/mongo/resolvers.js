// import { models } from 'mongoose'
// import _ from 'lodash'
//
// async function listIndexes() {
//   const indexes = await Promise.all(
//     Object
//       .entries(models)
//       .map(async ([key, model]) => {
//         const indexes = await model.listIndexes()
//         return indexes.map(index => `${key}:${index.name}`)
//       })
//   )
//   return indexes.flat()
// }
//
// async function syncIndexes() {
//   return Promise.all(Object.values(models).map(model => model.syncIndexes()))
// }
//
// module.exports = {
//   Mutation: {
//     async syncMongoIndexes() {
//       const indexesBeforeSync = await listIndexes()
//       await syncIndexes()
//       const indexesAfterSync = await listIndexes()
//
//       const removed = _.difference(indexesBeforeSync, indexesAfterSync).map(index => index.replace(':', ': -'))
//       const added = _.difference(indexesAfterSync, indexesBeforeSync).map(index => index.replace(':', ': +'))
//
//       return [...added, ...removed]
//     },
//   },
// }
