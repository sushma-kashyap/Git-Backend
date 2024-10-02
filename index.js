const express=require('express');
const dotenv=require('dotenv');
const cors=require('cors');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const http=require('http');
const {Server, Socket}=require('socket.io');
const mainRouter=require('./routes/main.router.js')





const yargs=require('yargs');
const {hideBin}= require('yargs/helpers');
const {InitRepo}=require('./controllers/init.js');
const {addRepo}=require('./controllers/add.js');
const {commitRepo}=require('./controllers/commit.js');
const {pullRepo}=require('./controllers/pull.js');
const {pushRepo}=require('./controllers/push.js');
const {revertRepo}=require('./controllers/revert.js');

dotenv.config();


yargs(hideBin(process.argv))
.command('Start',"Start new Server",{},startServer)
.command('init',"initalize a new repository",{},InitRepo)
//add command
.command('add <file>',"Add a file to the  repository",
    (yargs)=>{
        yargs.positional('file',{
            describe:'file to add to the stagging area',
            type:'string',
         });
    },(argv)=>{
        addRepo(argv.file);
    }
)

//commit command
.command('commit <message>','commit a file to the repository',
    (yargs)=>{
        yargs.positional('message',{
            describe:"commit file to stagging area",
            type:"string"
        });
    },(argv)=>{
        commitRepo(argv.message);
    }
)

//push command
.command('push',"push commit to s3",{},pushRepo)

//pull command
.command('pull','pull commit from s3',{},pullRepo)

//revert command
.command('revert <commitID>',"revert to a specific commit",
    (yargs)=>{
        yargs.positional("commitID",{
            describe:"revert file",
            type:"string"
        });
    },(argv)=>{
        revertRepo(argv.commitID);
    }
)

.demandCommand(1,'you need atleast one command').help().argv;

function startServer(){
    const app=express();
    const port=process.env.PORT || 3000;

    app.use(bodyParser.json());
    app.use(express.json());

    const mongoURI=process.env.MONGODB_URI;

    mongoose.connect(mongoURI).then(()=>{
        console.log('Connection estabilished');
    }).catch((err)=>{
        console.error("mongo connection error",err);
    });

    app.use(cors({origin:"*"}));
    app.use("/",mainRouter);

    let user="test";
    const httpServer=http.createServer(app);
    const io=new Server(httpServer,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
        },
    });

    io.on("connection",(socket)=>{
        socket.on("joinRoom",(userID)=>{
            user=userID;
            console.log("===");
            console.log(user);
            console.log("===");
            socket.join(userID);
        })
    })

    const db=mongoose.connection;

    db.once("open",async()=>{
        console.log("CRUD operation called");
        //CRUD Operations
    });

    httpServer.listen(port,()=>{
        console.log(`servr is running on PORT ${port}`);
    });
}