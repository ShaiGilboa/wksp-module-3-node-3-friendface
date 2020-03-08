'use strict';

const express = require('express');
const morgan = require('morgan');

const {users} = require('./data/users');

const PORT = process.env.PORT || 8000;

const app = express();

let currentUser = null;

// ------------------------------------------
// server endpoints
app.use(morgan('dev'));
app.use(express.static('public'));

app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');


const handleNotFriend = (req, res) => {
    let friendId = req.query.removing;
    let removed = currentUser.friends.filter(friend => friend !== friendId);
    currentUser.friends = removed;
    let otherSide = users.find(user => user.id === friendId);
    removed = otherSide.friends.filter(friend => friend !== currentUser.id);
    otherSide.friends = removed;
    res.redirect('/');
}

const handleNewFriend = (req, res) => {
    let friendId = req.query.adding;
    currentUser.friends.push(friendId);
    let otherSide = users.find(user => user.id === friendId);
    otherSide.friends.push(currentUser.id);
    res.redirect('/');
}

const findFriends = (aUser) => {
    let friends = [];
    aUser.friends.forEach(currentFriendId => {  
        users.forEach(user => {
                if(currentFriendId === user.id)friends.push(user);
        });
    });
    return friends;
}

const handleHome = (req, res) => {
    if (!currentUser) { res.redirect('/signin'); return}
    let friends = findFriends(currentUser);
    res.render('pages/homepage', {
        title: 'hello',
        currentUser: currentUser,
        users: users,
        friends: friends,
        currentUser: currentUser
    });
}

const handleSignin = (req, res) => {
    if (currentUser) { res.redirect('/'); return}
    res.render('pages/signin', {
        title: 'hello',
        users: users,
        currentUser: currentUser
    });
};

const handleUser = (req, res) => {
    if (!currentUser) { res.redirect('/signin'); return}
    let id = req.params.id;
    if(currentUser.id === id){res.redirect('/'); return}
    let user = users.find(user => user.id === id);
    let friends = findFriends(user);
    res.render('pages/user', {
        title: 'hello',
        user: user,
        users: users,
        friends: friends,
        isFriend: currentUser.friends.find(newId => newId === id),
        currentUser: currentUser
    });
};

const handleGetname = (req, res) => {
    const firstName = req.query.firstName;
    currentUser = users.find(user => user.name === firstName) || null;

    res.redirect(`${currentUser ? '/' : '/signin'}`);
};

const handlePYMK = (req, res) => {
    if (!currentUser) { res.redirect('/signin'); return}
    let notFriends = [];
        users.forEach(user => {
            if(!(currentUser.friends.includes(user.id))){
                if(!(notFriends.includes(user.id)) && user.id !== currentUser.id){
                    notFriends.push(user);
                };
            };
        });

    res.render('pages/PYMK', {
        title: "people you might know",
        users: users,
        friends: notFriends,
        currentUser: currentUser
    });
}

const handleLogout = (req, res) => {
    currentUser = null;
    res.redirect('/')
}

// endpoints
app.get('/', handleHome);
app.get('/signin', handleSignin);
app.get('/user/:id', handleUser);
app.get('/getname', handleGetname);
app.get('/people-you-might-know', handlePYMK)
app.get('/newfriend', handleNewFriend)
app.get('/removefriend', handleNotFriend)
app.get('/logout', handleLogout);

app.get('*', (req, res) => {
    res.status(404);
    res.render('pages/fourOhFour', {
        title: 'I got nothing',
        path: req.originalUrl
    });
});

app.listen(PORT, () => console.log(`we are listening... ${PORT}`));