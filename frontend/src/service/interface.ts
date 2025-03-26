export interface AppInfo {
    user: {
        username: string
    }
}

export interface AppLoginInput { 
    username: string
    password: string 
}

export interface AppResponse {
    message: string
}

export interface AppLoginToken {
    token: string
}

export interface AppLoginCodeInput {
    username: string
    code: string
}

export interface AppRegisterInput {
    username: string
    password: string
    email: string
}

export interface AppResetPassword {
    email: string
}

export interface AppChangePassword {
    token: string
    password: string
}