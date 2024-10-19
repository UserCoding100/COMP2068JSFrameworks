const express = require('express');
const router = express.Router();

//Renders for pages home, about, contact and projects
router.get('/', (req, res) => {
    res.render('home'); 
});

router.get('/about', (req, res) => {
    res.render('about'); 
});

router.get('/projects', (req, res) => {
    res.render('projects'); 
});

router.get('/contact', (req, res) => {
    res.render('contact'); 
});

module.exports = router;
