const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {Friend, friendSchema} = require('./friend')


const ObjectId = mongoose.Schema.Types.ObjectId

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(e) {
            if (!validator.isEmail(e)) {
                throw new Error('Incorrect email!')
            }
        }
    },
    password: {
        type: String,
        requred: true,
        trim: true,
        minlength: 7
    },
    is_active: {
        type: Boolean,
        default: false
    },
    friends: [{
        friend: friendSchema
    }],
    tokens: [{
        token: {
            type: String,
            requred: true
        }
    }]
})

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


// Instance Methods

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'dafuqelgamed')
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

// Model Methods
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('There is no such user!')
    }

    const isMatched = await bcrypt.compare(password, user.password)

    if (!isMatched) {
        throw new Error('Email or password are incorrect!')
    }
    return user

}
const User = module.exports = mongoose.model('User', userSchema)
