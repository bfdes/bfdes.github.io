import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as logger from 'morgan'
import * as express from 'express'
import * as compression from 'compression'
import { Request, Response, NextFunction } from 'express'

import router from './router'
import DB from '../shared/db'

export default function factory(posts: Post[]) {
  const mode = process.env.NODE_ENV

  const app = express()

  // Apply middleware stack:
  // i) logger
  if(mode == 'production') {
    app.use(logger('common'))
  }

  // ii) request parser
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // ii) static server w/ gzip compression. Used in dev or on Heroku.
  app.use(compression())
  app.use('/static', express.static(path.resolve('dist', 'static')))

  // iii) router
  app.use('/', router)

  // Error handler
  type RequestError = {status?: number} & Error;

  app.use((err: RequestError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);  // Server error if no status
    console.error(err.stack);
    const message = (err.status == 500)
      ? '500: Internal Server error'
      : `${err.status}: ${err.message}`
    res.json({
        error: {
            message,
        }
    });
  });

  // Spin-up the db
  app.set('DB', new DB(posts))

  return app
}
