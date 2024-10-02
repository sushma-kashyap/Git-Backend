const fs=require('fs').promises;
const path=require('path');

async function InitRepo(){
    console.log("init command called");
    const repoPath=path.resolve(process.cwd(),"apnaGit");
    const commitsPath=path.join(repoPath,"commits");

    try{
        await fs.mkdir(repoPath,{recursive:true});
        await fs.mkdir(commitsPath,{recursive:true});
        await fs.writeFile(path.join(repoPath,"config.json"),
        JSON.stringify({bucket:process.env.S3_BUCKET})
    );
    console.log('repositiory initialised!');

    }catch(err){
        console.error("error initializing repository",err);

    }
}
module.exports={InitRepo};