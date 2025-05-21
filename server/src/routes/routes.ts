import { Router, Request, Response, NextFunction, query } from 'express';
import { MainClass } from '../main-class';
import { PassportStatic, use } from 'passport';
import { upload } from '../multer/multer';
import { User } from '../model/User';
import { Post } from '../model/Post';
import { Friend } from '../model/Friend';
import bcrypt from 'bcrypt';
import { GroupMember } from '../model/GroupMember';
import { Group } from '../model/Group';

const SALT_FACTOR = 10;

export const configureRoutes = (passport: PassportStatic, router: Router): Router => {

    router.get('/', (req: Request, res: Response) => {
        let myClass = new MainClass();
        res.status(200).send('Hello, World!');
    });

    router.get('/callback', (req: Request, res: Response) => {
        let myClass = new MainClass();
        myClass.monitoringCallback((error, result) => {
            if (error) {
                res.write(error);
                res.status(400).end();
            } else {
                res.write(result);
                res.status(200).end();
            }
        });
    });

    router.get('/promise', async (req: Request, res: Response) => {
        let myClass = new MainClass();
        /* myClass.monitoringPromise().then((data: string) => {
            res.write(data);
            res.status(200).end();
        }).catch((error: string) => {
            res.write(error);
            res.status(400).end();
        }); */


        // async-await
        try {
            const data = await myClass.monitoringPromise();
            res.write(data);
            res.status(200).end();
        } catch (error) {
            res.write(error);
            res.status(400).end();
        }
    });

    router.get('/observable', (req: Request, res: Response) => {
        let myClass = new MainClass();
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
            next(data: string) {
                res.write(data);
            }, error(error: string) {
                res.status(400).end(error);
            }, complete() {
                res.status(200).end();
            }
        });
    });

    // AUTH

    router.post('/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (error: string | null, user: typeof User) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                if (!user) {
                    res.status(400).send('User not found.');
                } else {
                    req.login(user, (err: string | null) => {
                        if (err) {
                            res.status(500).send(error);
                            //console.log(err);
                            //res.status(500).send('Internal server error.');
                        } else {
                            res.status(200).send(user);
                        }
                    });
                }
            }
        })(req, res, next);
    });

    router.post('/register', (req: Request, res: Response) => {
        const name = req.body.name;
        const imageUrl = `/uploads/defaultpfp.png`;
        const birthday = req.body.birthday;
        const email = req.body.email;
        const password = req.body.password;
        const user = new User({name: name, imageUrl: imageUrl, birthday: birthday, email: email, password: password, isAdmin: false});
        user.save().then(data => {
            res.status(200).send(data);
        }).catch(error => {
            res.status(500).send(error);
        });
    });

    router.post('/logout', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            req.logout((error) => {
                if (error) {
                    res.status(500).send(error);
                }
                res.status(200).send('Successfully logged out.');
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/checkAuth', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.status(200).send(true);            
        } else {
            res.status(500).send(false);
        }
    });

    router.get('/checkAdmin', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = User.findById(req.user);
            query.then(data => {
                if (data) {
                    if (data.isAdmin) {
                        res.status(200).send(true);
                    } else {
                        res.status(500).send(false);
                    }
                }
            }).catch(error => {
                res.status(500).send(false);
            });
        } else {
            res.status(500).send(false);
        }
    });

    // USER

    router.post('/updateUser', upload.single('image'), async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const updates: any = {};
            if (req.body.name !== undefined) {
                updates.name = req.body.name;
            }
            if (req.file) {
                updates.imageUrl = `/uploads/${req.file?.filename}`;
            }
            if (req.body.email !== undefined) {
                updates.email = req.body.email;
            }
            if (req.body.birthday !== undefined) {
                updates.birthday = req.body.birthday;
            }
            if (req.body.password !== undefined) {
                bcrypt.genSalt(SALT_FACTOR, (error, salt) => {
                    if (error) {
                        return res.status(500).send('Error generating salt');
                    }
                    bcrypt.hash(req.body.password, salt, (err, encrypted) => {
                        if (err) {
                            return res.status(500).send('Error hashing password');
                        }
                        updates.password = encrypted;
                        console.log(updates)
                        const query = User.findByIdAndUpdate(user,
                            {$set: updates},
                            {new: true, runValidators: true}
                        );
                        query.then(data => {
                            res.status(200).send(data);
                        }).catch(error => {
                            res.status(500).send(error);
                        });
                    });
                });
            } else {
                console.log(updates)
                const query = User.findByIdAndUpdate(user,
                    {$set: updates},
                    {new: true, runValidators: true}
                );
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/getCurrentUser', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = User.findById(req.user);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getUserById', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = User.findById(req.body.userid);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getUserByName', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = User.find({name: { $regex: req.body.name, $options: 'i' }, _id: {$ne: req.user}});
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    // USER / FRIEND

    router.post('/addFriend', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const post = new Friend({user1: user, user2: other, accepted: false});
            post.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/acceptFriend', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const query = Friend.findOneAndUpdate({$or: [
                {user1: user, user2: other},
                {user1: other, user2: user}]}, 
                {$set: {accepted: true}}, 
                {new: false, runValidators: true}
            );
            query.then(data => {
                if (data) {
                    res.status(200).send({msg: 'Friend accepted.'});
                    //res.status(200).send(data);
                } else {
                    res.status(404).send('Friend not found.');
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/removeFriend', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const query = Friend.findOneAndDelete({$or: [
                {user1: user, user2: other},
                {user1: other, user2: user}
            ]});
            query.then(data => {
                if (data) {
                    res.status(200).send({msg: 'Friend deleted.'});
                    //res.status(200).send(data);
                } else {
                    res.status(404).send('Friend not found.');
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getFriends', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.body.userid;
            const query = Friend.find({$or: [
                {user1: user},
                {user2: user}
            ], accepted: true});
            query.then(data => {
                const ids = data.map(f => (f.user1 === user ? f.user2 : f.user1))
                const query = User.find({_id: {$in: ids}});
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/isFriends', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const other = req.body.userid;
            const query = Friend.findOne({$or: [
                {user1: user, user2: other},
                {user1: other, user2: user}
            ]});
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    // USER / GROUP

    router.post('/joinGroup', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const group = req.body.groupid;
            const member = new GroupMember({user: user, group: group});
            member.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/leaveGroup', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const group = req.body.groupid;
            const query = GroupMember.findOneAndDelete({user: user, group: group});
            query.then(data => {
                if (data) {
                    res.status(200).send({msg: 'Left the group.'});
                } else {
                    res.status(404).send('Not a member of this group.');
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getGroups', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.body.userid;
            const query = GroupMember.find({user: user});
            query.then(data => {
                const ids = data.map(f => (f.group))
                const query = Group.find({_id: {$in: ids}});
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/isInGroup', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const group = req.body.groupid;
            const query = GroupMember.findOne({user: user, group: group});
            query.then(data => {
                if (data) {
                    res.status(200).send(true);
                } else {
                    res.status(200).send(false);
                }
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    // POST

    router.post('/createPost', upload.single('image'), (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const location = req.body.location;
            const author = req.body.author;
            const date = req.body.date;
            const text = req.body.text;
            const imageUrl = req.file ? `/uploads/${req.file?.filename}` : '';
            const post = new Post({location: location, author: author, date: date, text: text, imageUrl: imageUrl});
            post.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getPostByLocation', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const location = req.body.location
            const query = Post.find({location: location});
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getPublicPostByUser', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.body.userid
            const query = Post.find({author: user, location: 'public'});
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/getUserTimeline', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const user = req.user;
            const query = Friend.find({$or: [
                {user1: user},
                {user2: user}
            ], accepted: true});
            query.then(data => {
                const ids = data.map(f => (f.user1 === user ? f.user2 : f.user1))
                const query = GroupMember.find({user: user});
                query.then(data => {
                    const ids2 = data.map(f => (f.group))
                    const query = Post.find({$or: [
                        {author: {$in: ids}, location: 'public'},
                        {location: {$in: ids2}, author: {$ne: user}}
                    ]});
                    query.then(data => {
                        res.status(200).send(data);
                    }).catch(error => {
                        res.status(500).send(error);
                    });
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    // GROUP

    router.post('/getGroupById', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Group.findById(req.body.groupid);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getGroupByName', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Group.find({name: { $regex: req.body.name, $options: 'i' }    });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/getMembers', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const group = req.body.groupid;
            const query = GroupMember.find({group: group});
            query.then(data => {
                const ids = data.map(f => (f.user))
                const query = User.find({_id: {$in: ids}});
                query.then(data => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send(error);
                });
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/createGroup', upload.single('image'), (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const name = req.body.name;
            const description = req.body.description;
            const imageUrl = `/uploads/${req.file?.filename}`;
            const post = new Group({name: name, description: description, imageUrl: imageUrl});
            post.save().then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    // ADMIN / GET

    router.get('/getAllUsers', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = User.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/getAllGroups', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Group.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/getAllPosts', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Post.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/getAllFriends', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Friend.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.get('/getAllMembers', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = GroupMember.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    // ADMIN / DELETE

    router.post('/deleteUser', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const id = req.body.id
            const query1 = Friend.deleteMany({$or: [{user1: id},{user2: id}]});
            query1.then(data => {

            }).catch(error => {
                res.status(500).send(error);
            });
            const query2 = GroupMember.deleteMany({user: id});
            query2.then(data => {

            }).catch(error => {
                res.status(500).send(error);
            });
            const query3 = Post.deleteMany({author: id});
            query3.then(data => {
                
            }).catch(error => {
                res.status(500).send(error);
            });
            const query = User.findByIdAndDelete(id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/deleteGroup', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const id = req.body.id
            const query1 = GroupMember.deleteMany({group: id});
            query1.then(data => {

            }).catch(error => {
                res.status(500).send(error);
            });
            const query2 = Post.deleteMany({location: id});
            query2.then(data => {
                
            }).catch(error => {
                res.status(500).send(error);
            });
            const query = Group.findByIdAndDelete(id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/deletePost', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Post.findByIdAndDelete(req.body.id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/deleteFriend', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Friend.findByIdAndDelete(req.body.id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    router.post('/deleteMember', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = GroupMember.findByIdAndDelete(req.body.id);
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send(error);
            });
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    return router;
}