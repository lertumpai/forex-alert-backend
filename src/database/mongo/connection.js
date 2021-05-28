import mongoose from 'mongoose'

mongoose
  .connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/forex_alert',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  )
  // eslint-disable-next-line no-console
  .then(() => console.log('Connect Mongo Success'))
  // eslint-disable-next-line no-console
  .catch(e => console.log('Connect Mongo Error', e))

export default mongoose
