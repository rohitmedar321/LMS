import fs from 'fs'
import {adminServer} from './servers/adminServer.js';
import  {clientServer}  from './servers/clientserver.js';


const rawData = fs.readFileSync('./config.json');



// adminServer

const adminConfig = JSON.parse(rawData).adminServer;
adminServer.listen( adminConfig.PORT, adminConfig.HOST, () => {
    console.log("admin server is running on http://"+adminConfig.HOST+":"+adminConfig.PORT)
})

//clientServer
const clientConfig = JSON.parse(rawData).clientServer;
clientServer.listen( clientConfig.PORT, clientConfig.HOST, () => {
    console.log("client server is running on http://"+clientConfig.HOST+":"+clientConfig.PORT)
})