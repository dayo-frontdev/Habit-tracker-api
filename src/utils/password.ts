import bcrypt from 'bcrypt'
import env from '../../env.ts'

export const hashpassword = async (password: string) =>{
       return bcrypt.hash(password, env.BCRYPT_ROUNDS)
};

export const comparePassword = (password: string, encryptPassword: string) =>{
    const compare = bcrypt.compare(password, encryptPassword);
    return compare;
}
