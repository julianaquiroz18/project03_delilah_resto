const registerSchema = {
    type: 'object',
    required: ['username', 'fullname', 'email', 'phoneNumber', "address", 'password'],
    properties: {
        username: { type: 'string' },
        fullname: { type: 'string' },
        email: { type: 'string', pattern: "^[A-Za-z0-9._-]*@[a-z]*.com$" },
        phoneNumber: { type: 'string' },
        address: { type: 'string' },
        password: { type: 'string', pattern: '^[A-Za-z0-9.!#$%&‘*+=?^_`{|}~-]{4,}$' },
        isAdmin: { tipe: 'integer' }
    }
}

const productSchema = {
    type: 'object',
    required: ['img', 'name', 'price'],
    properties: {
        img: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'integer' }
    }
}


const orderSchema = {
    type: 'object',
    required: ['products', 'paymentMethod'],
    properties: {
        products: { type: 'array' },
        paymentMethod: { type: 'string' }
    }
}

const orderStatusSchema = {
    type: 'object',
    required: ['status'],
    properties: {
        status: { type: 'string' }
    }
}



module.exports = {
    registerSchema,
    productSchema,
    orderSchema,
    orderStatusSchema
}