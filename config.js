import dotenv from 'dotenv';

dotenv.config(); 

const envGet = (key) => {

    return process.env[key]
}
 
export {envGet}