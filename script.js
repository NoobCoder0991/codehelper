
/* Variables */
const express = require('express')
const path = require('path');
const app = express();
const port = process.env.port || 3000;
const helper = require("./helper_functions");
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const { InitializeDatabase, getDatabase } = require("./database");
const { getgid } = require('process');
const cookieParser = require("cookie-parser");
const { Timestamp, ObjectId } = require('mongodb');
const { get } = require('http');
const { timeStamp } = require('console');




/**Initializing database and running server */

InitializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`server is running at port ${port}`);
    })

}).catch(err => {
    console.error("Failed to initialize database", err);
    process.exit(1);

})

/**Middleward */


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: '2kjdndhiusss44056954@3^*H%&66e',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000,
            secure: false,
        },
    })
);
app.use(cookieParser());



/**Post and get requests */

app.get('/', async (req, res) => {
    const id = req.session.sessionId;
    const { db, gfs } = getDatabase();
    const user = await db.collection('session_tokens').findOne({ token: id });
    if (user) {
        res.sendFile(path.join(__dirname, '/public/src/pages/index.html'));
    }
    else {
        res.redirect('/login');
    }
})
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/src/pages/login.html'));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/src/pages/register.html'))
})
app.get('/complete-profile', async (req, res) => {

    const { db, gfs } = getDatabase();
    const token = req.session.incompleteProfileToken;
    const userData = await db.collection('incomplete_profile').findOne({ token });

    if (userData) {
        res.sendFile(path.join(__dirname, '/public/src/pages/complete-profile.html'));
    }
    else {
        res.redirect('/register');
    }

})

app.get("/post-question", async (req, res) => {

    const id = req.session.sessionId;
    const { db, gfs } = getDatabase();
    const user = await db.collection('session_tokens').findOne({ token: id });
    if (user) {

        res.sendFile(path.join(__dirname, "/public/src/pages/post-question.html"))
    }
    else {

        res.redirect('/login');
    }

})

app.get("/question/id/:id", async (req, res) => {

    res.sendFile(path.join(__dirname, 'public/src/pages/question.html'))

})

app.get("/answer-question/id/:id", async (req, res) => {

    res.sendFile(path.join(__dirname, 'public/src/pages/answer-question.html'))
})

app.post("/fetch-question", async (req, res) => {

    try {
        const { db, gfs } = getDatabase();
        const { questionId } = req.body;
        console.log("Question id", questionId);
        const questionDetails = await db.collection("questions").findOne({ _id: new ObjectId(questionId) });

        const solutionIds = questionDetails.solutions;
        if (solutionIds.length) {
            const topSolution = await db.collection('solutions').findOne({ _id: new ObjectId(solutionIds[0]) });
            topSolution.title = "Top Solution";
            questionDetails.topSolution = topSolution;
        }
        if (questionDetails) {
            res.send({ ok: true, questionDetails });
        }
        else {
            res.send({ ok: false, errMessage: "Question Not Found" });
        }

    } catch (error) {

        console.error(error);
        res.send({ ok: false, errMessage: "Internal Server Error" });

    }
})
app.post("/fetch-question-alone", async (req, res) => {

    try {
        const { db, gfs } = getDatabase();
        const { questionId } = req.body;
        console.log("Question id", questionId);
        const questionDetails = await db.collection("questions").findOne({ _id: new ObjectId(questionId) });

        if (questionDetails) {
            res.send({ ok: true, questionDetails });
        }
        else {
            res.send({ ok: false, errMessage: "Question Not Found" });
        }

    } catch (error) {

        console.error(error);
        res.send({ ok: false, errMessage: "Internal Server Error" });

    }
})
app.post('/auth', async (req, res) => {

    const { email, password } = req.body;

    try {
        const { db, gfs } = getDatabase();
        const user = await db.collection('users').findOne({ email, password });
        if (user) {
            //create a session token for the user
            const id = helper.generateToken();
            await db.collection('session_tokens').insertOne({ userid: user.userid, token: id });
            req.session.sessionId = id;
            res.send({ ok: true });
        }
        else {
            res.send({ ok: false, errMessage: "Authentication failed." });

        }

    } catch (error) {
        console.error(error);
        res.send({ ok: false, errMessage: "Internal Server Error" });
    }
})

app.post("/register", async (req, res) => {

    const { db, gfs } = getDatabase();
    const { email } = req.body;

    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
        res.send({ ok: false, errMessage: "user already exists" });
    }
    else {
        const token = helper.generateToken();
        req.session.incompleteProfileToken = token;
        await db.collection('incomplete_profile').insertOne({ email, token });
        res.send({ ok: true })
    }
})


app.post('/complete-profile', async (req, res) => {

    const { db, gfs } = getDatabase();
    const incompleteProfileToken = req.session.incompleteProfileToken;
    const userData = await db.collection('incomplete_profile').findOne({ token: incompleteProfileToken });

    if (userData) {

        const email = userData.email;
        const { firstName, lastName, password } = req.body;
        const userid = uuidv4();
        await db.collection('users').insertOne({ email, password, firstName, lastName, userid, emailVerified: false });
        await db.collection('user_data').insertOne({ email, firstName, lastName, userid, questions: [], solutions: [] });
        const token = helper.generateToken();
        req.session.sessionId = token;
        await db.collection('session_tokens').insertOne({ userid, token });
        await db.collection('incomplete_profile').deleteOne({ token: incompleteProfileToken });

        res.send({ ok: true });

    }

    else {
        res.send({ ok: false, errMessage: "No user data found on server. Please sign up with email first" });
    }

})

app.post('/get-incomplete-profile-data', async (req, res) => {

    const token = req.session.incompleteProfileToken;

    try {
        const { db, gfs } = getDatabase();
        const userData = await db.collection('incomplete_profile').findOne({ token });
        if (userData) {
            res.send({ ok: true, email: userData.email });
        }

    } catch (error) {

        console.error(error);
        res.send({ ok: false, errMessage: "Internal Server Error" });

    }



})


app.post("/user-data", async (req, res) => {

    const { db, gfs } = getDatabase();
    const token = req.session.sessionId;

    try {
        const user = await db.collection("session_tokens").findOne({ token });
        if (user) {
            const userData = await db.collection("user_data").findOne({ userid: user.userid });
            const questions = userData.questions;
            const solutions = userData.solutions;
            for (let i = 0; i < questions.length; i++) {

                const questionDetails = await db.collection("questions").findOne({ _id: new ObjectId(questions[i].questionId) }, { projection: { _id: 0, title: 1, solved: 1, timeStamp: 1 } });
                questions[i].title = questionDetails.title;
                questions[i].solved = questionDetails.solved;
                questions[i].timeStamp = questionDetails.timeStamp;
            }
            for (let i = 0; i < solutions.length; i++) {

                const questionDetails = await db.collection("questions").findOne({ _id: new ObjectId(solutions[i].questionId) }, { projection: { _id: 0, title: 1, solved: 1 } });
                const solutionDetails = await db.collection("solutions").findOne({ questionId: solutions[i].questionId }, { projection: { _id: 0, upVotes: 1, downVotes: 1 } });
                solutions[i].title = questionDetails.title;
                solutions[i].solved = questionDetails.solved;
                solutions[i].upVotes = solutionDetails.upVotes;
                solutions[i].downVotes = solutionDetails.downVotes;
            }
            res.send({ ok: true, userData });
        }
        else {
            res.send({ ok: false, errMessage: "User not found." }).status(404);
        }

    } catch (error) {

        console.log(error)
        res.send({ ok: false, errMessage: "Internal Server Error" });

    }

})

app.post('/post-question', async (req, res) => {
    try {
        const token = req.session.sessionId;
        const { db, gfs } = getDatabase();
        const { title, description } = req.body;
        const date = new Date();
        const timeStamp = Math.floor(date.getTime() / 1000);

        const user = await db.collection('session_tokens').findOne({ token });
        if (user) {
            const userid = user.userid;
            const result = await db.collection('questions').insertOne({ title, description, timeStamp, solved: false, solutions: [] });
            const questionId = result.insertedId;
            await db.collection("user_data").updateOne({ userid }, { $push: { questions: { title, solved: false, questionId } } });
            res.status(200).send({ ok: true, questionId });

        }

        else {
            console.log("user not found ");
            res.status(404).send({ ok: false, errMessage: "User not found." });
        }
    } catch (error) {

        console.error(error);
        res.status(500).send({ ok: false, errMessage: "Internal Server Error" });

    }
})

app.post("/post-solution", async (req, res) => {
    try {

        const token = req.session.sessionId;
        const { db, gfs } = getDatabase();
        const { questionId, solution } = req.body;
        const user = await db.collection('session_tokens').findOne({ token });

        if (user) {

            const userid = user.userid;
            const userData = await db.collection("user_data").findOne({ userid });
            if (userData.solutions.includes(questionId)) {
                res.send({ ok: false, errMessage: "Sorry we allow just one answer per question by a particular user." });
            }
            else {
                const result = await db.collection("solutions").insertOne({ questionId, author: userData.firstName + " " + userData.lastName, upVotes: 0, downVotes: 0, solution });

                await db.collection("questions").updateOne({ _id: new ObjectId(questionId) }, { $push: { solutions: result.insertedId }, $set: { solved: true } });
                await db.collection("user_data").updateOne({ userid }, { $push: { solutions: { questionId } } });

                res.send({ ok: true });

            }

        }
        else {
            res.send({ ok: false, errMessage: "You need to sign in to post your solution." });
        }

    } catch (error) {

        res.send({ ok: false, errMessage: "Internal Server Error" }).status(500);

    }
})


