const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const URI = process.env.MONGODB_URI;
let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "user already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECERT_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token ,userId:result.insertId});
  } catch (err) {
    console.error("error during signup", err.message);
    res.status(500).send("Server error");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECERT_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("error during login", err.message);
    res.status(500).send("Server error");
  }
}

async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();
    res.json({ users });
  } catch (err) {
    console.error("error during fetching", err.message);
    res.status(500).send("Server error");
  }
}

async function getUserProfile(req, res) {
  const currentId = req.params.id;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(user);
  } catch (err) {
    console.error("error during fetching", err.message);
    res.status(500).send("Server error");
  }
}

async function updateUserProfile(req, res) {
  const currentId = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    let updateFields = { email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(salt);
      updateFields.password = hashedPassword;
    }
    const result = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentId),
      },
      { $set: updateFields },
      { ReturnDocument: "after" },
    );
    if(!result.value){
        return res.status(404).json({message:"User not found"});
    }
    res.send(result.value);
  } catch (err) {
    console.error("error during updating", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteUserProfile(req, res) {
    const currentId = req.params.id;
    try{
        await connectClient();
        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        const result=await usersCollection.deleteOne({
            _id: new ObjectId(currentId),  
        });

        if(result.deleteCount==0){
            return res.status(404).json({message:"User not found"});
        }
        res.json({message:"User profile deleted"});

    }catch (err) {
    console.error("error during deleting", err.message);
    res.status(500).send("Server error");
  }
 
}

module.exports = {
  login,
  getAllUsers,
  getUserProfile,
  signup,
  updateUserProfile,
  deleteUserProfile,
};
