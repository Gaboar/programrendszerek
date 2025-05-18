"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
const main_class_1 = require("../main-class");
const multer_1 = require("../multer/multer");
const User_1 = require("../model/User");
const Post_1 = require("../model/Post");
const Friend_1 = require("../model/Friend");
const bcrypt_1 = __importDefault(require("bcrypt"));
const GroupMember_1 = require("../model/GroupMember");
const Group_1 = require("../model/Group");
const SALT_FACTOR = 10;
const configureRoutes = (passport, router) => {
    router.get('/', (req, res) => {
        let myClass = new main_class_1.MainClass();
        res.status(200).send('Hello, World!');
    });
    router.get('/callback', (req, res) => {
        let myClass = new main_class_1.MainClass();
        myClass.monitoringCallback((error, result) => {
            if (error) {
                res.write(error);
                res.status(400).end();
            }
            else {
                res.write(result);
                res.status(200).end();
            }
        });
    });
    router.get('/promise', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let myClass = new main_class_1.MainClass();
        /* myClass.monitoringPromise().then((data: string) => {
            res.write(data);
            res.status(200).end();
        }).catch((error: string) => {
            res.write(error);
            res.status(400).end();
        }); */
        // async-await
        try {
            const data = yield myClass.monitoringPromise();
            res.write(data);
            res.status(200).end();
        }
        catch (error) {
            res.write(error);
            res.status(400).end();
        }
    }));
    router.get('/observable', (req, res) => {
        let myClass = new main_class_1.MainClass();
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        // deprecated variant
        /* myClass.monitoringObservable().subscribe((data) => {
            console.log(data);
        }, (error) => {
            console.log(error);
        }, () => {
            console.log('complete');
        }); */
        myClass.monitoringObservable().subscribe({
            next(data) {
                res.write(data);
            }, error(error) {
                res.status(400).end(error);
            }, complete() {
                res.status(200).end();
            }
        });
    });
    // AUTH
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', (error, user) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            }
            else {
                if (!user) {
                    res.status(400).send('User not found.');
                }
                else {
                    req.login(user, (err) => {
                        if (err) {
                            res.status(500).send(error);
                            //console.log(err);
                            //res.status(500).send('Internal server error.');
                        }
                        else {
                            res.status(200).send(user);
                        }
                    });
                }
            }
        })(req, res, next);
    });
    router.post('/register', (req, res) => {
        const name = req.body.name;
        const imageUrl = `/uploads/defaultpfp.png`;
        const birthday = req.body.birthday;
        const email = req.body.email;
        const password = req.body.password;
        const user = new User_1.User({ name: name, imageUrl: imageUrl, birthday: birthday, email: email, password: password, isAdmin: false });
        user.save().then(data => {
            res.status(200).send(data);
        }).catch(error => {
            res.status(500).send(error);
        });
    });
    router.post('/logout', (req, res) => {
        if (req.isAuthenticated()) {
            req.logout((error) => {
                if (error) {
                    res.status(500).send(error);
                }
                res.status(200).send('Successfully logged out.');
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.get('/checkAuth', (req, res) => {
        if (req.isAuthenticated()) {
            res.status(200).send(true);
        }
        else {
            res.status(500).send(false);
        }
    });
    router.get('/checkAdmin', (req, res) => {
        if (req.isAuthenticated()) {
            const query = User_1.User.findById(req.user);
            query.then(data => {
                if (data) {
                    if (data.isAdmin) {
                        res.status(200).send(true);
                    }
                    else {
                        res.status(500).send(false);
                    }
                }
            }).catch(error => {
                res.status(500).send(false);
            });
        }
        else {
            res.status(500).send(false);
        }
    });
    // USER
    router.post('/updateUser', multer_1.upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (req.isAuthenticated()) {
            const user = req.user;
            const updates = {};
            if (req.body.name !== undefined) {
                updates.name = req.body.name;
            }
            if (req.file) {
                updates.imageUrl = `/uploads/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
            }
            if (req.body.email !== undefined) {
                updates.email = req.body.email;
            }
            if (req.body.birthday !== undefined) {
                updates.birthday = req.body.birthday;
            }
            if (req.body.password !== undefined) {
                bcrypt_1.default.genSalt(SALT_FACTOR, (error, salt) => {
                    if (error) {
                        return res.status(500).send('Error generating salt');
                    }
                    bcrypt_1.default.hash(req.body.password, salt, (err, encrypted) => {
                        if (err) {
                            return res.status(500).send('Error hashing password');
                        }
                        updates.password = encrypted;
                        console.log(updates);
                        const query = User_1.User.findByIdAndUpdate(user, { $set: updates }, { new: true, runValidators: true });
                        query.then(data => {
                            res.status(200).send(data);
                        }).catch(error => {
                            res.status(500).send(error);
                        });
                    });
                });
            }
            else {
                console.log(updates);
                const query = User_1.User.findByIdAndUpdate(user, { $set: updates }, { new: true, runValidators: true });
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    }));
    router.get('/getCurrentUser', (req, res) => {
        if (req.isAuthenticated()) {
            const query = User_1.User.findById(req.user);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getUserById', (req, res) => {
        if (req.isAuthenticated()) {
            const query = User_1.User.findById(req.body.userid);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getUserByName', (req, res) => {
        if (req.isAuthenticated()) {
            const query = User_1.User.find({ name: { $regex: req.body.name, $options: 'i' }, _id: { $ne: req.user } });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    // USER / FRIEND
    router.post('/addFriend', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const post = new Friend_1.Friend({ user1: user, user2: other, accepted: false });
            post.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/acceptFriend', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const query = Friend_1.Friend.findOneAndUpdate({ $or: [
                    { user1: user, user2: other },
                    { user1: other, user2: user }
                ] }, { $set: { accepted: true } }, { new: false, runValidators: true });
            query.then(data => {
                if (data) {
                    res.status(200).send({ msg: 'Friend accepted.' });
                    //res.status(200).send(data);
                }
                else {
                    res.status(404).send('Friend not found.');
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/removeFriend', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const query = Friend_1.Friend.findOneAndDelete({ $or: [
                    { user1: user, user2: other },
                    { user1: other, user2: user }
                ] });
            query.then(data => {
                if (data) {
                    res.status(200).send({ msg: 'Friend deleted.' });
                    //res.status(200).send(data);
                }
                else {
                    res.status(404).send('Friend not found.');
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getFriends', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.body.userid;
            const query = Friend_1.Friend.find({ $or: [
                    { user1: user },
                    { user2: user }
                ] });
            query.then(data => {
                const ids = data.map(f => (f.user1 === user ? f.user2 : f.user1));
                const query = User_1.User.find({ _id: { $in: ids } });
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/isFriends', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const query = Friend_1.Friend.findOne({ $or: [
                    { user1: user, user2: other },
                    { user1: other, user2: user }
                ] });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    // USER / GROUP
    router.post('/joinGroup', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const group = req.body.groupid;
            const member = new GroupMember_1.GroupMember({ user: user, group: group });
            member.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/leaveGroup', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const group = req.body.groupid;
            const query = GroupMember_1.GroupMember.findOneAndDelete({ user: user, group: group });
            query.then(data => {
                if (data) {
                    res.status(200).send({ msg: 'Left the group.' });
                }
                else {
                    res.status(404).send('Not a member of this group.');
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getGroups', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.body.userid;
            const query = GroupMember_1.GroupMember.find({ user: user });
            query.then(data => {
                const ids = data.map(f => (f.group));
                const query = Group_1.Group.find({ _id: { $in: ids } });
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/isInGroup', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const group = req.body.groupid;
            const query = GroupMember_1.GroupMember.findOne({ user: user, group: group });
            query.then(data => {
                if (data) {
                    res.status(200).send(true);
                }
                else {
                    res.status(200).send(false);
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    // POST
    router.post('/createPost', multer_1.upload.single('image'), (req, res) => {
        var _a;
        if (req.isAuthenticated()) {
            const location = req.body.location;
            const author = req.body.author;
            const date = req.body.date;
            const text = req.body.text;
            const imageUrl = req.file ? `/uploads/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}` : '';
            const post = new Post_1.Post({ location: location, author: author, date: date, text: text, imageUrl: imageUrl });
            post.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getPostByLocation', (req, res) => {
        if (req.isAuthenticated()) {
            const location = req.body.location;
            const query = Post_1.Post.find({ location: location });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getPublicPostByUser', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.body.userid;
            const query = Post_1.Post.find({ author: user });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.get('/getUserTimeline', (req, res) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const query = Friend_1.Friend.find({ $or: [
                    { user1: user },
                    { user2: user }
                ] });
            query.then(data => {
                const ids = data.map(f => (f.user1 === user ? f.user2 : f.user1));
                const query = Post_1.Post.find({ author: { $in: ids } });
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    // GROUP
    router.post('/getGroupById', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Group_1.Group.findById(req.body.groupid);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getGroupByName', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Group_1.Group.find({ name: { $regex: req.body.name, $options: 'i' } });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/getMembers', (req, res) => {
        if (req.isAuthenticated()) {
            const group = req.body.groupid;
            const query = GroupMember_1.GroupMember.find({ group: group });
            query.then(data => {
                const ids = data.map(f => (f.user));
                const query = User_1.User.find({ _id: { $in: ids } });
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/createGroup', multer_1.upload.single('image'), (req, res) => {
        var _a;
        if (req.isAuthenticated()) {
            const name = req.body.name;
            const description = req.body.description;
            const imageUrl = `/uploads/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
            const post = new Group_1.Group({ name: name, description: description, imageUrl: imageUrl });
            post.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    // ADMIN / GET
    router.get('/getAllUsers', (req, res) => {
        if (req.isAuthenticated()) {
            const query = User_1.User.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.get('/getAllGroups', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Group_1.Group.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.get('/getAllPosts', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Post_1.Post.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.get('/getAllFriends', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Friend_1.Friend.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.get('/getAllMembers', (req, res) => {
        if (req.isAuthenticated()) {
            const query = GroupMember_1.GroupMember.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    // ADMIN / DELETE
    router.post('/deleteUser', (req, res) => {
        if (req.isAuthenticated()) {
            const id = req.body.id;
            const query1 = Friend_1.Friend.deleteMany({ $or: [{ user1: id }, { user2: id }] });
            query1.then(data => {
            }).catch(error => {
                res.status(500).send(error);
            });
            const query2 = GroupMember_1.GroupMember.deleteMany({ user: id });
            query2.then(data => {
            }).catch(error => {
                res.status(500).send(error);
            });
            const query3 = Post_1.Post.deleteMany({ author: id });
            query3.then(data => {
            }).catch(error => {
                res.status(500).send(error);
            });
            const query = User_1.User.findByIdAndDelete(id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/deleteGroup', (req, res) => {
        if (req.isAuthenticated()) {
            const id = req.body.id;
            const query1 = GroupMember_1.GroupMember.deleteMany({ group: id });
            query1.then(data => {
            }).catch(error => {
                res.status(500).send(error);
            });
            const query2 = Post_1.Post.deleteMany({ location: id });
            query2.then(data => {
            }).catch(error => {
                res.status(500).send(error);
            });
            const query = Group_1.Group.findByIdAndDelete(id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/deletePost', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Post_1.Post.findByIdAndDelete(req.body.id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/deleteFriend', (req, res) => {
        if (req.isAuthenticated()) {
            const query = Friend_1.Friend.findByIdAndDelete(req.body.id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    router.post('/deleteMember', (req, res) => {
        if (req.isAuthenticated()) {
            const query = GroupMember_1.GroupMember.findByIdAndDelete(req.body.id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        }
        else {
            res.status(500).send('User is not logged in.');
        }
    });
    return router;
};
exports.configureRoutes = configureRoutes;
