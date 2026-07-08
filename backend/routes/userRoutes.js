import {Router} from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { getUser, getUsers } from '../controllers/user.constroller.js';
import dbReady from '../middlewares/dbReady.js';
import cacheMiddleware, { clearCacheMiddleware } from '../middlewares/cache.js';

const userRouster = Router();

userRouster.use(dbReady);

const clearUsersAndAdminCache = clearCacheMiddleware(['/users', '/admin']);

userRouster.get('/', cacheMiddleware(30), getUsers);
userRouster.get('/:id', authorize, getUser);
userRouster.post('/', clearUsersAndAdminCache, (req, res) => res.send({title: 'CREATE new user'}));
userRouster.put('/:id', clearUsersAndAdminCache, (req, res) => res.send({title: 'UPDATE user'}));
userRouster.delete('/:id', clearUsersAndAdminCache, (req, res) => res.send({title: 'DELETE user'}));

export default userRouster;