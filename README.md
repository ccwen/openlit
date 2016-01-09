install ksanaforge/ksana2015

Install dependencies
====================

    npm install

Get Booklist from openlit.com, save as booklist.json
===========================================

    node genbooklist


Get raw html from openlit.com, save as utf8
===========================================

    node wget

Convert to accelon xml format
============================

    node gen

Build database
=============

    ks mkdb openlit
