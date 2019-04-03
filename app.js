const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, req.body.email + '.' + file.originalname.split('.').pop());
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
});

app.use('/uploads', express.static('uploads'));

app.use('*', upload.single('img'), (req, res, next) => {

    if (req.file) {
        const requestBody = {
            query: `
                mutation createOne($company: CreateCompanyInput){
                    createCompany(companyInput: $company) {
                        _id,
                        email,
                        name,
                        address,
                        type,
                        description,
                        imgUrl,
                        identification,
                        jobs {
                            _id
                        }
                    }
                }
            `,
            variables: {
                company: {
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    address: req.body.address,
                    type: req.body.type,
                    description: req.body.description,
                    imgUrl: req.file.path
                }
            }
        };
    
        req.body = requestBody;
        
        req.headers = {
            ...req.headers,
            'Content-Type': 'application/graphql'
        };
    }
    
    next();
})


app.use('/graphql', graphQLHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true
}));


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ssew9.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)
    .then(() => {
        app.listen(8000, () => (console.log('server is running...')));
    }).catch((err) => console.log(err));

