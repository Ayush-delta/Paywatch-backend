import {Router} from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { getUser, getUsers } from '../controllers/user.constroller.js';
import errorMiddleware from '../middlewares/error.middleware.js';

const userRouster = Router();

//GET /users -> get all users
//GET /user:id -> get user by id

userRouster.get('/', getUsers);
userRouster.get('/:id', authorize, getUser); //Dynamic -parameter
userRouster.post('/', (req, res) => res.send({title: 'CREATE new user'}));
userRouster.put('/:id', (req, res) => res.send({title: 'UPDATE user'}));
userRouster.delete('/:id', (req, res) => res.send({title: 'DELETE user'}));

export default userRouster;

//You can have multiple routes with same endpoint but they have to be different http verbs(GET, POST,etc).