const registerSchema = {
    type: 'object',
    required: ['username', 'fullname', 'email', 'phoneNumber', "address", 'password'],
    properties: {
        username: { type: 'string' },
        fullname: { type: 'string' },
        email: { type: 'string', pattern: "^[A-Za-z0-9]*@[a-z]*.com$" },
        phoneNumber: { type: 'string' },
        address: { type: 'string' },
        password: { type: 'string', pattern: '^[A-Za-z]{4,}[0-9]{1,}$' }
    }
}

module.exports = {
    registerSchema
}