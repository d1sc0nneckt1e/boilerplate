const router = require('express').Router();
const User = require('../models/userModel')

router.post('/', async (req, res) => {
    try{
        const {email, password, passwordVarify} = req.body;
        // validation
        if (!email || !password || !passwordVarify) {
            return res.status(400).json({
                errorMessage: 'Please enter all required fields.'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                errorMessage: 'Please enter a password with at least 6 charecters.'
            });
        }
        if (password.length !== passwordVarify) {
            return res.status(400).json({
                errorMessage: 'Please enter the same password.'
            });
        } 
        const existingUser = await User.findOne({email: email});
        if (existingUser) {
            return res.status(400).json({
                errorMessage: 'An account with this email exists.'
            });
        }
    } catch (err) {}
        console.error(err)
        res.status(500).send();
    })

module.exports = router;