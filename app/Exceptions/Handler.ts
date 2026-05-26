/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {

  async handle (error, { request, response }) {

    if(error.name == 'E_ROUTE_NOT_FOUND') {
      return response.status(404).send({
        status: 'Not Found', 
        error: error.message // or your error message
      })  
    }
  
  
    return response.status(404).send({
        "status": 404,
        "message": "Geçersiz İstek",
        "response": ''    
    })
  }

  constructor () {
    super(Logger)
  }
}
