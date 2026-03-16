import type { Response, Request, NextFunction } from 'express';
import {type ZodSchema, ZodError} from 'zod';

export const validateBody = ( schema: ZodSchema ) => {
  return ( req: Request, res: Response, next: NextFunction ) => {
     try{
      const validationData = schema.parse(req.body);
      req.body = validationData;
      next();
     } catch (e){

         if ( e instanceof ZodError ){

            return res.status(400).json({
            error: 'validation failed',
            detail: e.issues.map(err => ({
             field: err.path.join('.'),
             message: err.message
             }))
            })

         }

         next(e);
     }
  }
};

export default validateBody
