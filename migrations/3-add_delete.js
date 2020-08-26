'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "Delete" to table "posts"
 * addColumn "Delete" to table "users"
 * changeColumn "UserId" on table "users"
 *
 **/

var info = {
    "revision": 3,
    "name": "add_delete",
    "created": "2020-02-02T02:41:51.128Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "posts",
            "Delete",
            {
                "type": Sequelize.BOOLEAN,
                "field": "Delete",
                "defaultValue": false,
                "allowNull": false
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "users",
            "Delete",
            {
                "type": Sequelize.BOOLEAN,
                "field": "Delete",
                "defaultValue": false,
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "users",
            "UserId",
            {
                "type": Sequelize.INTEGER,
                "field": "UserId",
                "refrences": {
                    "model": "user",
                    "key": "UserId"
                },
                "primaryKey": true,
                "autoIncrement": true,
                "allowNull": false
            }
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
