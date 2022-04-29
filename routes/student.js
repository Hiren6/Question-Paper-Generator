const express = require('express');
const cli = require('nodemon/lib/cli');
const { ensureAuthenticated } = require('../config/auth');
const router = express.Router();
const client = require('../models/db').client

router.get('/:sroll_no', async (req, res) =>{
    const{sroll_no} = req.params;
    const showpap = `Select paper_id, response from Student_paper where sroll_no = $1`;
    try{
        const show_pap = await client.query(showpap,[sroll_no]);
        res.render('pap_list',{
            sroll_no : sroll_no,
            show_pap : show_pap.rows
        });
    }

    catch (e) { console.error(e.message); }
});

router.post('/add/:sroll_no', async (req,res) => {
    const {sroll_no} = req.params;
    const {p_id,response} = req.body;
    const addpap = `If Not Exists(select * from Student_paper where paper_id=$2)
                    Begin
                    insert into Student_paper  values ($1,$2,$3)
                    End`;

    const add_pap = await client.query(addpap,[sroll_no,p_id,response]);
    res.redirect('/student/' + sroll_no);
});

module.exports = router