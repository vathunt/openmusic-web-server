require('dotenv').config()

const Hapi = require('@hapi/hapi')
const songs = require('./api/songs')
const ClientError = require('./exceptions/ClientError')
const SongsService = require('./services/postgres/SongsService')
const SongsValidator = require('./validator/songs')

const init = async () => {
  const songsService = new SongsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  /*
    * extension function untuk life cycle server 'onPreResponse',
    * dimana ini akan mengintervensi response sebelum dikirimkan ke client.
    * Disini bisa ditetapkan error handling bila response tersebut
    * merupakan ClientError.
  */
  server.ext('onPreResponse', (request, h) => {
    // mendapatkan response dari request
    const { response } = request

    if (response instanceof ClientError) {
      // membuat response baru dari respon toolkit sesuai kebutuhan error handling
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }

    if (response instanceof Error) {
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      newResponse.code(500)
      console.error(response)
      return newResponse
    }

    /*
      * jika bukan ClientError, lanjutkan dengan response sebelumnya
      * (tanpa terintervensi)
    */
    return response.continue || response
  })

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator
    }
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
