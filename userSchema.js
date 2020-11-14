const mongoose = require("mongoose");
/**
 * This file contains the schema of mongoose for the purpose of setting up the database.
 * <strong>NOTE</strong>
 * Due to the time shortage I did not get a chance to use this.
 * Hopefully for the next submission ;).
 */


 /**
  * Setting up the schema.
  */
const userSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            required: true
        },
      username: {
        type: String,
        unique: true,
        required: true,
      },
      fullname:{
          type: String,
          unique: false,
          required: true
      },
      password:{
          type: String,
          unique:false,
          required: true
      },
      following:{
          type: Array,
          unique: false,
          required: true
      },
      status: {
          type: String,
          unique: false,
          required: true
      },
      won: {
          type: String,
          unique:false,
          required: true
      }
      
    },
    { timestamps: true },
);

module.exports = userSchema;