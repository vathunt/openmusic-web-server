class ExportsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this)
  }

  async postExportSongsHandler (request, h) {
    this._validator.validateExportSongsPayload(request.payload)

    const message = {
      userId: request.auth.credentials.id,
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail
    }

    await this._service.sendMessage('export:songs', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
