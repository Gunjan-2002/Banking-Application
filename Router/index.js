const router = require('express').Router();
const { application } = require('express');
const users = require('../Model/All_Users');
const customers = require('../Model/All_Users');
const historyModel = require('../Model/Transaction_History');

// GET REQUEST TO SHOW HOME.EJS PAGE
router.get('/', (req, res) => {
    res.render('Home')
});

// THIS WILL OPEN ADD USER EJS FILE AND LET USER TO PUT INPUT IN FORM
router.get('/adduser', (req, res) => {
    res.render('Add_User', { title: "Add User", msg: '' })
});

// THIS WILL TAKE OUT ALL THE DATA FROM ADD USER FORM BY POST REQUEST AND THEN SAVE IT TO DATA BASE 
router.post('/adduser', (req, res) => {
    const { userName, userEmail, userNumber, userAmount } = req.body;

    const User = new customers
        (
            {
                name: userName,
                email: userEmail,
                contact: userNumber,
                amount: userAmount,
            }
        );

    User.save().then(() => {
        res.render('Add_User', { title: "Add User", msg: 'User Added Succesfully' })
    }).catch((err) => {
        console.log(err);
    })
})


// THIS IS TO SHOW ALL USERS FROM DATABASE AND RENDER IT TO VIEW USER EJS FILE
router.get('/data', (req, res) => {
    const allData = customers.find({});

    allData.exec((err, data) => {
        if (err) {
            throw err;
        }
        else {
            res.render('View_User', { title: "View Users", data: data });
        }
    })
})


// THIS IS TO DELETE ALL USERS FROM DATABASE AND RENDER IT TO VIEW USER EJS FILE
router.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    const updateData = customers.findByIdAndDelete({ "_id": id });

    updateData.exec((err, data) => {
        if (err) {
            throw err;
        }
        else {
            res.redirect('/data')
        }
    })
});


// THIS WILL RUN WHEN A PERSON WANTS TO TRANSFER AMOUNT TO ANOTHER SO THE FIRST PAGE THAT OPEN TO INPUT VALUE THIS IS FOR THAT
router.get("/view/:id", (req, res) => {
    const id = req.params.id;

    const Sender = customers.find({ "_id": id });

    const allUser = customers.find({});

    Sender.exec((err, uData) => {
        if (err) {
            throw err;
        }
        else {
            allUser.exec((err, rData) => {
                if (err) {
                    throw err;
                }
                else {
                    res.render('View_Transfer', { title: "View Transfer", data: uData, records: rData })
                }
            })
        }
    })
})

// THIS IS TO SHOW THE VIEW & TRANSFER 
router.post('/transfer', (req, res) => {
    const { SenderID, SenderName, SenderEmail, reciverName, reciverEmail, transferAmount } = req.body;

    console.log(transferAmount)

    const history = new historyModel({
        sName: SenderName,
        sEmail: SenderEmail,
        rName: reciverName,
        rEmail: reciverEmail,
        amount: transferAmount
    })


    if (reciverName === 'Select Reciver Name' || reciverEmail === 'Select Reciver Email') {

        res.render('Succes_Page', { title: "Sucess", value: "", msg: "", errmsg: "All fields are require!" });
    } else {

        const Sender = customers.find({ "_id": SenderID })
        const Reciver = customers.find({ "name": reciverName, "email": reciverEmail });


        Promise.all([Sender, Reciver]).then(([senderData, reciverData]) => {
            senderData.forEach(async (c) => {
                if (c.name === reciverName || c.email === reciverEmail || c.amount < transferAmount) {

                    res.render('Succes_Page', { title: "Failed", value: "", msg: "", errmsg: "Process Not Complete due to incorrect reciver details!" });
                }

                else {
                    let updateAmount = parseInt(c.amount) - parseInt(transferAmount);
                    await customers.findOneAndUpdate({ "name": SenderName }, { "$set": { "amount": updateAmount } });
                    history.save().then((r) => {

                    }).catch(err => { console.log(err) });

                    reciverData.forEach(async (e) => {
                        let updateAmount = parseInt(e.amount) + parseInt(transferAmount);

                        await customers.findOneAndUpdate({ "name": reciverName }, { "$set": { "amount": updateAmount } })
                    })
                }

                res.render('Succes_Page', { title: "Sucess", value: "True", msg: "Transfer Sucessfull" })
            });

        }).catch((err) => {
            console.log(err)
        })

    }
})


router.get('/view/edit/:id', (req, res) => {
    const id = req.params.id;

    const Sender = customers.find({ "_id": id });

    const allUser = customers.find({});

    Sender.exec((err, uData) => {
        if (err) {
            throw err;
        }
        else {
            allUser.exec((err, rData) => {
                if (err) {
                    throw err;
                }
                else {
                    res.render('Edit', { title: "Edit Details", data: uData })
                }
            })
        }
    })
})

router.post('/edit', (req, res) => {
    const { ChangerID, ChangeName, ChangeEmail, ChangeContact, ChangeBalance } = req.body;

    console.log(ChangeBalance)

    const updateCust = new customers({
        name: ChangeName,
        email: ChangeEmail,
        contact: ChangeContact,
        amount: ChangeBalance
    })

    const ChangeID = customers.find({ "_id": ChangerID })

    Promise.all([ChangeID]).then(([changeData]) => {
        changeData.forEach(async (c) => {
            let updateAmount = parseInt(c.amount) + parseInt(ChangeBalance);
            await customers.findOneAndUpdate({ "_id": ChangerID }, { "$set": { "amount": updateAmount, "name": ChangeName, "email": ChangeEmail, "contact": ChangeContact } });

            res.render('Succes_Page', { title: "Sucess", value: "True", msg: "Changes Made Sucessfully" })
        });

    }).catch((err) => {
        console.log(err)
    })


})


// THIS WILL SHOW THE TRANSACTION HISTORY
router.get('/history', (req, res) => {
    const hist = historyModel.find({});
    hist.exec((err, hdata) => {
        if (err) {
            throw err;
        }
        else {
            res.render('Transaction_History', { title: 'History', data: hdata })
        }
    });
});


router.get('/remove/:id', (req, res) => {
    const id = req.params.id;
    const updateData = historyModel.findByIdAndDelete({ "_id": id });
    updateData.exec((err, data) => {
        if (err) { throw err }
        else {
            res.redirect('/history')
        }
    })
});

// ***************
router.post('/search', (req, res) => {

    var findname = req.body.findname

    findname = findname.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

    console.log(findname)


    const Sender = customers.find({ "name": findname });

    const allUser = customers.find({});

    Sender.exec((err, uData) => {
        if (err) {
            throw err;
        }
        else {
            allUser.exec((err, rData) => {
                if (err) {
                    throw err;
                }
                else {
                    res.render('Show_User', { title: "View Transfer", data: uData , records: rData , msg: "Customer Found" , value: "True"})
                }
            })
        }
    })


})


module.exports = router;